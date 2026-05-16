const express = require('express');
const { createServer } = require('http');
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

// Import your newly created GraphQL Schema
const jwt = require('jsonwebtoken');
const { typeDefs, resolvers, JWT_SECRET } = require('./graphql/schema');

// Initialize Prisma
const prisma = new PrismaClient();

const app = express();
const httpServer = createServer(app);

// 1. Create the Executable Schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// 2. Set up WebSocket server for Subscriptions
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});
const serverCleanup = useServer({ schema }, wsServer);

// 3. Set up Apollo Server
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

  // 4. Mount Apollo Server middleware to the /graphql route
  // TODO (A4): lock down CORS to specific origins once HTTPS + JWT auth is implemented
  app.use(cors());
  app.use(express.static(path.join(__dirname, 'public')));

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
        return { prisma, currentUser };
      },
    })
  );

  const PORT = 3000;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is now running on http://0.0.0.0:${PORT}/graphql`);
    console.log(`WebSockets listening on ws://0.0.0.0:${PORT}/graphql`);
  });
}

startServer();