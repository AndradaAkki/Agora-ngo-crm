const { PubSub } = require('graphql-subscriptions');
const pubsub = new PubSub();

// 1. The GraphQL Schema definition
const typeDefs = `#graphql
  type FirmEventStatus {
    id: ID!
    status: String!
    eventId: ID!
    eventName: String
  }

  type Contact {
    id: ID!
    name: String!
    email: String
    phoneNumber: String
    position: String
    isPrimary: Boolean
  }

  type Firm {
    id: ID!
    name: String!
    email: String
    status: String
    details: String
    assignedCD: String
    assigneeName: String
    pausedUntil: String
    contracts: [Contract]
    contacts: [Contact]
    history: [History]
    tasks: [Task]
    firmEventStatuses: [FirmEventStatus]
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

  type Event {
    id: ID!
    name: String!
    year: Int
  }

  type Task {
    id: ID!
    desc: String!
    isDone: Boolean!
  }

  type User {
    id: ID!
    username: String!
    email: String!
    displayName: String
    avatarUrl: String
    role: String
    isAdmin: Boolean!
  }

  type PaginatedFirms {
    totalItems: Int!
    currentPage: Int!
    totalPages: Int!
    data: [Firm!]!
  }

  type Query {
    getFirms(page: Int!, limit: Int!): PaginatedFirms!
    getEvents: [Event!]!
    getUsers: [User!]!
  }

  type Mutation {
    addFirm(name: String!, email: String, status: String): Firm!
    updateFirm(id: ID!, name: String, mail: String, status: String, details: String, assignedCD: String, pausedUntil: String): Firm!
    deleteFirm(id: ID!): Firm!
    addTask(firmId: ID!, desc: String!): Task!
    toggleTask(taskId: ID!): Task!
    deleteTask(taskId: ID!): Task!
    addHistory(firmId: ID!, type: String!, desc: String!, author: String!, date: String!): History!
    deleteHistory(historyId: ID!): History!
    setFirmEventStatus(firmId: ID!, eventId: ID!, status: String!): FirmEventStatus!
    addContact(firmId: ID!, name: String!, email: String, position: String, phone: String, isPrimary: Boolean): Contact!
    updateContact(firmId: ID!, contactId: ID!, name: String, email: String, position: String, phone: String, isPrimary: Boolean): Contact!
    deleteContact(firmId: ID!, contactId: ID!): Contact!
    addContract(firmId: ID!, eventId: ID!): Contract!
    deleteContract(contractId: ID!): Contract!
    updateContractSteps(contractId: ID!, steps: [String!]!): Contract!
    login(email: String!, password: String!): User
    updateAvatar(userId: ID!, avatarUrl: String!): User!
  }

  type Subscription {
    firmAdded: Firm!
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
          include: {
            history: true,
            contracts: { include: { event: true } },
            contacts: true,
            tasks: true,
            firmEventStatuses: { include: { event: true } },
            assignee: true
          }
        }),
        prisma.firm.count()
      ]);

      const formattedFirms = firms.map(firm => ({
        ...firm,
        assignedCD: firm.assignee?.id ?? null,
        assigneeName: firm.assignee?.displayName ?? null,
        contracts: firm.contracts.map(c => ({
          id: c.id,
          status: c.status,
          name: c.event?.name || "Unknown Event",
          steps: c.completedSteps || []
        })),
        history: firm.history.map(h => ({
          id: h.id,
          type: h.details.split(' ')[0] || 'Log',
          details: h.details,
          author: h.author || null,
          timestamp: h.timestamp ? h.timestamp.toISOString() : null
        })),
        contacts: firm.contacts.map(c => ({
          id: c.id,
          name: c.name,
          email: c.email || null,
          phoneNumber: c.phoneNumber || null,
          position: c.position || null,
          isPrimary: c.isPrimary
        })),
        firmEventStatuses: firm.firmEventStatuses.map(fes => ({
          id: fes.id,
          status: fes.status,
          eventId: fes.eventId,
          eventName: fes.event?.name || null
        }))
      }));

      return {
        totalItems,
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        data: formattedFirms
      };
    },

    getEvents: async (_, __, { prisma }) => {
      return await prisma.event.findMany({ orderBy: { year: 'desc' } });
    },

    getUsers: async (_, __, { prisma }) => {
      return await prisma.user.findMany({ orderBy: { displayName: 'asc' } });
    }
  },

  Mutation: {
    login: async (_, { email, password }, { prisma }) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || user.password !== password) return null;
      return user;
    },

    updateAvatar: async (_, { userId, avatarUrl }, { prisma }) => {
      return await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl }
      });
    },

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
    
    updateFirm: async (_, { id, assignedCD, mail, ...rest }, { prisma }) => {
      const data = { ...rest };
      if (assignedCD !== undefined) {
        // assignedCD is a User UUID; 'nobody' or empty means unassign
        data.assignedCd = (assignedCD && assignedCD !== 'nobody') ? assignedCD : null;
      }
      if (mail !== undefined) {
        data.email = mail || null;
      }
      const updatedFirm = await prisma.firm.update({
        where: { id },
        data
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
    },
    addContract: async (_, { firmId, eventId }, { prisma }) => {
      const contract = await prisma.contract.create({
        data: { firmId, eventId },
        include: { event: true }
      });
      return { id: contract.id, status: contract.status, name: contract.event?.name || 'Unknown Event', steps: [] };
    },
    deleteContract: async (_, { contractId }, { prisma }) => {
      const contract = await prisma.contract.delete({
        where: { id: contractId },
        include: { event: true }
      });
      return { id: contract.id, status: contract.status, name: contract.event?.name || 'Unknown Event', steps: [] };
    },
    updateContractSteps: async (_, { contractId, steps }, { prisma }) => {
      const contract = await prisma.contract.update({
        where: { id: contractId },
        data: { completedSteps: steps },
        include: { event: true }
      });
      return { id: contract.id, status: contract.status, name: contract.event?.name || 'Unknown Event', steps: contract.completedSteps || [] };
    },
    addContact: async (_, { firmId, name, email, position, phone, isPrimary }, { prisma }) => {
      if (isPrimary) {
        await prisma.contact.updateMany({ where: { firmId }, data: { isPrimary: false } });
      }
      return await prisma.contact.create({
        data: { firmId, name, email: email || null, position: position || null, phoneNumber: phone || null, isPrimary: isPrimary || false }
      });
    },
    updateContact: async (_, { contactId, name, email, position, phone, isPrimary }, { prisma }) => {
      if (isPrimary === true) {
        const contact = await prisma.contact.findUnique({ where: { id: contactId } });
        await prisma.contact.updateMany({ where: { firmId: contact.firmId }, data: { isPrimary: false } });
      }
      return await prisma.contact.update({
        where: { id: contactId },
        data: { name, email: email || null, position: position || null, phoneNumber: phone || null, ...(isPrimary !== undefined && { isPrimary }) }
      });
    },
    deleteContact: async (_, { contactId }, { prisma }) => {
      return await prisma.contact.delete({ where: { id: contactId } });
    },
    setFirmEventStatus: async (_, { firmId, eventId, status }, { prisma }) => {
      const record = await prisma.firmEventStatus.upsert({
        where: { firmId_eventId: { firmId, eventId } },
        update: { status },
        create: { firmId, eventId, status },
        include: { event: true }
      });
      return {
        id: record.id,
        status: record.status,
        eventId: record.eventId,
        eventName: record.event?.name || null
      };
    }
  },

  Subscription: {
    firmAdded: {
      subscribe: () => pubsub.asyncIterator(['FIRM_ADDED'])
    }
  }
};

module.exports = { typeDefs, resolvers };