const { PubSub } = require('graphql-subscriptions');
const pubsub = new PubSub();

// 1. The GraphQL Schema definition
const typeDefs = `#graphql
  type Firm {
    id: ID!
    name: String!
    email: String
    status: String
    details: String
    assignedCD: String
    pausedUntil: String
    contracts: [Contract]
    history: [History]
    tasks: [Task]
  }

  type Contract {
    id: ID!
    status: String
    name: String
    steps: [String]
  }

  type History {
    id: ID!
    type: String
    details: String
    author: String
    timestamp: String
  }

  type PaginatedFirms {
    totalItems: Int!
    currentPage: Int!
    totalPages: Int!
    data: [Firm!]!
  }

  type Query {
    getFirms(page: Int!, limit: Int!): PaginatedFirms!
  }

  type Mutation {
    addFirm(name: String!, email: String, status: String): Firm!
    updateFirm(id: ID!, name: String, mail: String, status: String, details: String, assignedCD: String): Firm!    deleteFirm(id: ID!): Firm!
    addTask(firmId: ID!, desc: String!): Task!
    toggleTask(taskId: ID!): Task!
    deleteTask(taskId: ID!): Task!
    addHistory(firmId: ID!, type: String!, desc: String!, author: String!, date: String!): History!
    deleteHistory(historyId: ID!): History!
  }

  type Subscription {
    firmAdded: Firm!
  }

  type User {
    id: ID!
    username: String!
    email: String!
    displayName: String
    role: String
    isAdmin: Boolean!
  }
    type Task {
  id: ID!
  desc: String!
  isDone: Boolean!
}
`;

// 2. The Resolvers (Where Prisma talks to PostgreSQL)
const resolvers = {
  Query: {
    getFirms: async (_, { page = 1, limit = 10 }, { prisma }) => {
      const skip = (page - 1) * limit;
      
      const [firms, totalItems] = await prisma.$transaction([
        prisma.firm.findMany({ 
          skip, 
          take: limit,
          // Include the relational tables from Prisma
          include: {
            history: true,
            contracts: {
              include: {
                event: true 
              }
            },
            tasks: true
          }
        }),
        prisma.firm.count()
      ]);
      
      // Map the complex Prisma relations to the simple GraphQL schema
      const formattedFirms = firms.map(firm => ({
        ...firm,
        contracts: firm.contracts.map(c => ({
          id: c.id,
          status: c.status,
          name: c.event?.name || "Unknown Event", 
          steps: [] 
        })),
        history: firm.history.map(h => ({
          id: h.id,
          type: h.details.split(' ')[0] || 'Log',
          details: h.details,
          author: h.author || null,
          timestamp: h.timestamp ? h.timestamp.toISOString() : null
        }))
      }));

      return { 
        totalItems, 
        currentPage: page, 
        totalPages: Math.ceil(totalItems / limit), 
        data: formattedFirms 
      };
    }
  },
  
  Mutation: {
    addFirm: async (_, args, { prisma }) => {
      const newFirm = await prisma.firm.create({
        data: { 
          name: args.name, 
          email: args.email, 
          status: args.status || 'In Progress' 
        }
      });
      
      pubsub.publish('FIRM_ADDED', { firmAdded: newFirm });
      return newFirm;
    },
    
    updateFirm: async (_, { id, ...data }, { prisma }) => {
      const updatedFirm = await prisma.firm.update({
        where: { id: id }, // ID is already a UUID string
        data: data
      });
      return updatedFirm;
    },
    
    deleteFirm: async (_, { id }, { prisma }) => {
      const deletedFirm = await prisma.firm.delete({
        where: { id: id } // ID is already a UUID string
      });
      return deletedFirm;
    },
    addTask: async (_, { firmId, desc }, { prisma }) => {
      return await prisma.task.create({
        data: { desc, firmId, isDone: false }
      });
    },
    toggleTask: async (_, { taskId }, { prisma }) => {
      const task = await prisma.task.findUnique({ where: { id: taskId } });
      return await prisma.task.update({
        where: { id: taskId },
        data: { isDone: !task.isDone }
      });
    },
    deleteTask: async (_, { taskId }, { prisma }) => {
      return await prisma.task.delete({ where: { id: taskId } });
    },
    addHistory: async (_, { firmId, type, desc, author, date }, { prisma }) => {
      return await prisma.history.create({
        data: { details: desc, author: author, timestamp: new Date(date), firmId: firmId }
      });
    },
    deleteHistory: async (_, { historyId }, { prisma }) => {
      return await prisma.history.delete({ where: { id: historyId } });
    }
  },

  Subscription: {
    firmAdded: {
      subscribe: () => pubsub.asyncIterator(['FIRM_ADDED'])
    }
  }
};

module.exports = { typeDefs, resolvers };