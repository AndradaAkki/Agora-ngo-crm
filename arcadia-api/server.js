const express = require('express');
const { createServer } = require('http');
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
const { typeDefs, resolvers } = require('./graphql/schema');

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
  app.use(
    '/graphql',
    cors(),
    bodyParser.json(),
    expressMiddleware(server, {
      // This injects Prisma into every request so your resolvers can use it
      context: async () => ({ prisma }), 
    })
  );

  const PORT = 3000;
  httpServer.listen(PORT, () => {
    console.log(`Server is now running on http://localhost:${PORT}/graphql`);
    console.log(`WebSockets listening on ws://localhost:${PORT}/graphql`);
  });
}

startServer();