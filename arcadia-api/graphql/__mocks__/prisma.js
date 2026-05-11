const prismaMock = {
  firm: {
    findMany:   jest.fn(),
    count:      jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
    delete:     jest.fn(),
  },
  contact: {
    create:     jest.fn(),
    update:     jest.fn(),
    updateMany: jest.fn(),
    findUnique: jest.fn(),
    delete:     jest.fn(),
  },
  contract: {
    create:     jest.fn(),
    update:     jest.fn(),
    delete:     jest.fn(),
  },
  task: {
    create:     jest.fn(),
    findUnique: jest.fn(),
    update:     jest.fn(),
    delete:     jest.fn(),
  },
  history: {
    create:     jest.fn(),
    delete:     jest.fn(),
  },
  event: {
    findMany:   jest.fn(),
  },
  firmEventStatus: {
    upsert:     jest.fn(),
  },
  $transaction: jest.fn(),
};

module.exports = prismaMock;
