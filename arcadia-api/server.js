const express = require('express');
const { createServer } = require('https');
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

const tlsOptions = {
  key: fs.readFileSync(path.join(__dirname, 'certs', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certs', 'cert.pem')),
};

// Import your newly created GraphQL Schema
const jwt = require('jsonwebtoken');
const { typeDefs, resolvers, JWT_SECRET } = require('./graphql/schema');
const { router: oauthRouter, passport } = require('./auth/oauth');

// Initialize Prisma
const prisma = new PrismaClient();

const app = express();
const httpsServer = createServer(tlsOptions, app);

// 1. Create the Executable Schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// 2. Set up WebSocket server for Subscriptions
const wsServer = new WebSocketServer({
  server: httpsServer,
  path: '/graphql',
});
const serverCleanup = useServer({ schema }, wsServer);

// 3. Set up Apollo Server
const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer: httpsServer }),
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

  // 4. Mount Apollo Server middleware to the /graphql route
  // Allow localhost dev origins and all RFC 1918 private LAN ranges (10.x, 172.16-31.x, 192.168.x)
  const privateNetwork = /^https:\/\/(10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+)(:\d+)?$/;
  app.use(cors({
    origin: ['https://localhost:5173', 'https://localhost:3000', privateNetwork],
    credentials: true,
  }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(passport.initialize());
  app.use('/auth', oauthRouter);

  // SPA fallback: any non-API route serves index.html so React Router handles it
  app.get(/^(?!\/graphql).*$/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  app.use(
    '/graphql',
    bodyParser.json(),
    expressMiddleware(server, {
      // This injects Prisma into every request so your resolvers can use it
      context: async ({ req }) => {
        const auth = req.headers.authorization || '';
        let currentUser = null;
        if (auth.startsWith('Bearer ')) {
          try {
            const payload = jwt.verify(auth.slice(7), JWT_SECRET);
            currentUser = payload;
          } catch {
            // Invalid or expired token — currentUser stays null
          }
        }
        return { prisma, currentUser, host: req.get('host') };
      },
    })
  );

  const PORT = 3000;
  httpsServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is now running on https://0.0.0.0:${PORT}/graphql`);
    console.log(`WebSockets listening on wss://0.0.0.0:${PORT}/graphql`);
  });
}

startServer();