const express = require('express');
const cors = require('cors');
const http = require('http'); 
const { Server: SocketIOServer } = require('socket.io'); 
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5'); 
const { typeDefs, resolvers } = require('./graphql/schema');
const firmRoutes = require('./routes/firms');

const app = express();
const httpServer = http.createServer(app); 

const io = new SocketIOServer(httpServer, {
    cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] }
});

const PORT = 3000;

app.use(cors());
app.use(express.json());
app.set('socketio', io);

// We keep the REST routes for the Faker generate loop (Silver challenge)
app.use('/api/firms', firmRoutes);

// --- GOLD CHALLENGE: APOLLO GRAPHQL SETUP ---
async function startServer() {
    const apolloServer = new ApolloServer({ typeDefs, resolvers });
    await apolloServer.start();
    
    // Attach GraphQL to the /graphql endpoint
    app.use('/graphql', expressMiddleware(apolloServer));

    httpServer.listen(PORT, () => {
        console.log(`🚀 REST/WebSockets running at http://localhost:${PORT}`);
        console.log(`🌌 GraphQL API ready at http://localhost:${PORT}/graphql`);
    });
}

startServer();

io.on('connection', (socket) => {
    console.log('A client connected to WebSockets:', socket.id);
});