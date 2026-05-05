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
            }
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
    }
  },

  Subscription: {
    firmAdded: {
      subscribe: () => pubsub.asyncIterator(['FIRM_ADDED'])
    }
  }
};

module.exports = { typeDefs, resolvers };