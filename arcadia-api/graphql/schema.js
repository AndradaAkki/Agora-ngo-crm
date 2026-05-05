const { PubSub } = require('graphql-subscriptions');
const pubsub = new PubSub();

// 1. The GraphQL Schema definition
const typeDefs = `#graphql
  type Firm {
    id: ID!
    name: String!
    email: String!
    status: String!
    details: String
    assignedCD: String
    pausedUntil: String
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
    addFirm(name: String!, email: String!, status: String): Firm!
    updateFirm(id: ID!, name: String, email: String, status: String, details: String): Firm!
    deleteFirm(id: ID!): Firm!
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
  isAdmin: Boolean!  # Add it here
}
`;

// 2. The Resolvers (Where Prisma talks to PostgreSQL)
const resolvers = {
  Query: {
    getFirms: async (_, { page = 1, limit = 10 }, { prisma }) => {
      const skip = (page - 1) * limit;
      
      // Prisma fetches the data and the total count simultaneously
      const [firms, totalItems] = await prisma.$transaction([
        prisma.firm.findMany({ skip, take: limit, orderBy: { id: 'desc' } }),
        prisma.firm.count()
      ]);
      
      return { 
        totalItems, 
        currentPage: page, 
        totalPages: Math.ceil(totalItems / limit), 
        // Prisma uses Ints for IDs, but GraphQL expects Strings for IDs. We convert them here.
        data: firms.map(firm => ({ ...firm, id: firm.id.toString() })) 
      };
    }
  },
  
  Mutation: {
    addFirm: async (_, args, { prisma }) => {
      // Prisma saves to the database
      const newFirm = await prisma.firm.create({
        data: { 
          name: args.name, 
          email: args.email, 
          status: args.status || 'In Progress' 
        }
      });
      
      const firmToReturn = { ...newFirm, id: newFirm.id.toString() };
      
      // Broadcast to Apollo Subscriptions in React
      pubsub.publish('FIRM_ADDED', { firmAdded: firmToReturn });
      return firmToReturn;
    },
    
    updateFirm: async (_, { id, ...data }, { prisma }) => {
      const updatedFirm = await prisma.firm.update({
        where: { id: parseInt(id) },
        data: data
      });
      return { ...updatedFirm, id: updatedFirm.id.toString() };
    },
    
    deleteFirm: async (_, { id }, { prisma }) => {
      const deletedFirm = await prisma.firm.delete({
        where: { id: parseInt(id) }
      });
      return { ...deletedFirm, id: deletedFirm.id.toString() };
    }
  },

  Subscription: {
    firmAdded: {
      subscribe: () => pubsub.asyncIterator(['FIRM_ADDED'])
    }
  }
};

module.exports = { typeDefs, resolvers };