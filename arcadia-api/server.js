const express = require('express');
const fs = require('fs');
const path = require('path');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/use/ws');
const cors = require('cors');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const { typeDefs, resolvers, JWT_SECRET } = require('./graphql/schema');

// HTTPS only when USE_HTTPS=true (local dev with self-signed certs).
// On Render / any cloud host, TLS is terminated by the platform — run plain HTTP.
const USE_HTTPS = process.env.USE_HTTPS === 'true';
let createServer;
let serverOptions;
if (USE_HTTPS) {
  createServer = require('https').createServer;
  serverOptions = {
    key: fs.readFileSync(path.join(__dirname, 'certs', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'certs', 'cert.pem')),
  };
} else {
  createServer = require('http').createServer;
  serverOptions = {};
}

// OAuth is optional — only loaded when ENABLE_OAUTH=true
let oauthRouter = null;
let passportMiddleware = (req, res, next) => next();
if (process.env.ENABLE_OAUTH === 'true') {
  const oauthModule = require('./auth/oauth');
  oauthRouter = oauthModule.router;
  passportMiddleware = oauthModule.passport.initialize();
}

const prisma = new PrismaClient();
const app = express();
const httpServer = USE_HTTPS
  ? createServer(serverOptions, app)
  : createServer(app);

const schema = makeExecutableSchema({ typeDefs, resolvers });

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});
const serverCleanup = useServer({ schema }, wsServer);

const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

async function startServer() {
  await server.start();

  const privateNetwork = /^https?:\/\/(10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+)(:\d+)?$/;
  const allowedOrigins = [
    'https://localhost:5173',
    'https://localhost:3000',
    'http://localhost:5173',
    'http://localhost:3000',
    privateNetwork,
  ];
  if (process.env.ALLOWED_ORIGINS) {
    process.env.ALLOWED_ORIGINS.split(',').forEach(o => allowedOrigins.push(o.trim()));
  }

  app.use(cors({ origin: allowedOrigins, credentials: true }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(passportMiddleware);
  if (oauthRouter) app.use('/auth', oauthRouter);

  app.get(/^(?!\/graphql).*$/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  app.use(
    '/graphql',
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req.headers.authorization || '';
        let currentUser = null;
        if (auth.startsWith('Bearer ')) {
          try {
            const payload = jwt.verify(auth.slice(7), JWT_SECRET);
            currentUser = payload;
          } catch {
            // invalid or expired token
          }
        }
        return { prisma, currentUser, host: req.get('host') };
      },
    })
  );

  const PORT = process.env.PORT || 3000;
  const protocol = USE_HTTPS ? 'https' : 'http';
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on ${protocol}://0.0.0.0:${PORT}/graphql`);
  });
}

startServer();
