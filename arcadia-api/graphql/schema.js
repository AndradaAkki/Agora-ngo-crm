const { firms } = require('../data/memoryDb');

// 1. The Schema (TypeDefs)
const typeDefs = `#graphql
  type Contact { id: ID, name: String, position: String, email: String, phone: String, isPrimary: Boolean }
  type Task { id: ID, desc: String, isDone: Boolean }
  type History { type: String, desc: String, author: String, date: String }
  type Contract { name: String, steps: [String] }

  type Firm {
    id: ID!
    name: String!
    contactName: String
    email: String!
    phone: String
    status: String!
    details: String
    assignedCD: String
    pausedUntil: String
    contacts: [Contact]
    tasks: [Task]
    history: [History]
    contracts: [Contract]
  }

  type PaginatedFirms {
    totalItems: Int!
    currentPage: Int!
    totalPages: Int!
    data: [Firm]!
  }

  type Query {
    getFirms(page: Int, limit: Int): PaginatedFirms
    getFirm(id: ID!): Firm
  }

  type Mutation {
    addFirm(name: String!, email: String!, status: String, contactName: String): Firm
    updateFirm(id: ID!, name: String, email: String, status: String, details: String): Firm
    deleteFirm(id: ID!): Firm
    
    # --- NEW CONTACT MUTATIONS ---
    addContact(firmId: ID!, name: String!, email: String!, position: String, phone: String, isPrimary: Boolean): Firm
    updateContact(firmId: ID!, contactId: ID!, name: String, email: String, position: String, phone: String, isPrimary: Boolean): Firm
    deleteContact(firmId: ID!, contactId: ID!): Firm
  }
`;

// 2. The Resolvers
const resolvers = {
  Query: {
    getFirms: (_, { page = 1, limit = 50 }) => {
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedFirms = firms.slice(startIndex, endIndex);

      return {
        totalItems: firms.length,
        currentPage: page,
        totalPages: Math.ceil(firms.length / limit),
        data: paginatedFirms
      };
    },
    getFirm: (_, { id }) => firms.find(f => f.id === parseInt(id))
  },
  
  Mutation: {
    addFirm: (_, args) => {
      const newFirm = {
        id: firms.length > 0 ? Math.max(...firms.map(f => f.id)) + 1 : 1,
        ...args,
        status: args.status || 'In Progress',
        contacts: [],
      };
      firms.push(newFirm);
      return newFirm;
    },
    updateFirm: (_, args) => {
      const firmIndex = firms.findIndex(f => f.id === parseInt(args.id));
      if (firmIndex === -1) throw new Error("Firm not found");
      
      const { id, ...updates } = args;
      firms[firmIndex] = { ...firms[firmIndex], ...updates };
      return firms[firmIndex];
    },
    deleteFirm: (_, { id }) => {
      const firmIndex = firms.findIndex(f => f.id === parseInt(id));
      if (firmIndex === -1) throw new Error("Firm not found");
      
      const deletedFirm = firms.splice(firmIndex, 1)[0];
      return deletedFirm;
    },

    // --- NEW CONTACT RESOLVERS ---
    addContact: (_, args) => {
      const firm = firms.find(f => f.id === parseInt(args.firmId));
      if (!firm) throw new Error("Firm not found");
      
      if (!firm.contacts) firm.contacts = [];
      
      const newContact = {
        id: Date.now().toString(), // Generate a unique ID for the contact
        name: args.name,
        email: args.email,
        position: args.position,
        phone: args.phone,
        isPrimary: args.isPrimary || false
      };
      
      firm.contacts.push(newContact);
      return firm; // Return the whole firm so React updates automatically
    },
    
    updateContact: (_, args) => {
      const firm = firms.find(f => f.id === parseInt(args.firmId));
      if (!firm) throw new Error("Firm not found");
      if (!firm.contacts) return firm;

      const contactIndex = firm.contacts.findIndex(c => c.id === args.contactId);
      if (contactIndex === -1) throw new Error("Contact not found");

      // Merge existing contact data with the updates
      const { firmId, contactId, ...updates } = args;
      firm.contacts[contactIndex] = { ...firm.contacts[contactIndex], ...updates };
      
      return firm;
    },

    deleteContact: (_, args) => {
      const firm = firms.find(f => f.id === parseInt(args.firmId));
      if (!firm) throw new Error("Firm not found");
      if (!firm.contacts) return firm;

      firm.contacts = firm.contacts.filter(c => c.id !== args.contactId);
      return firm;
    }
  }
};

module.exports = { typeDefs, resolvers };