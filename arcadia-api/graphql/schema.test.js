jest.mock('graphql-subscriptions', () => ({
  PubSub: jest.fn().mockImplementation(() => ({
    publish: jest.fn(),
    asyncIterator: jest.fn().mockReturnValue('mock-async-iterator'),
  })),
}));

const { resolvers } = require('./schema');
const prisma = require('./__mocks__/prisma');

beforeEach(() => jest.clearAllMocks());

const ctx = { prisma };

// ─── getFirms ────────────────────────────────────────────────────────────────

describe('Query: getFirms', () => {
  const mockFirm = {
    id: 'firm-1', name: 'Test Corp', email: null, status: 'In Progress',
    details: null, assignedCd: null, pausedUntil: null,
    contracts: [], contacts: [], history: [], tasks: [], firmEventStatuses: [],
  };

  test('returns correct paginated structure', async () => {
    prisma.$transaction.mockResolvedValue([[mockFirm], 1]);
    const result = await resolvers.Query.getFirms(null, { page: 1, limit: 10 }, ctx);
    expect(result.totalItems).toBe(1);
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('firm-1');
  });

  test('formats contracts with event name and steps', async () => {
    const firm = {
      ...mockFirm,
      contracts: [{ id: 'c-1', status: 'Active', completedSteps: ['step1'], event: { name: 'Gala 2024' } }],
    };
    prisma.$transaction.mockResolvedValue([[firm], 1]);
    const result = await resolvers.Query.getFirms(null, { page: 1, limit: 10 }, ctx);
    expect(result.data[0].contracts[0]).toEqual({ id: 'c-1', status: 'Active', name: 'Gala 2024', steps: ['step1'] });
  });

  test('formats history entries including null author and null timestamp', async () => {
    const firm = {
      ...mockFirm,
      history: [
        { id: 'h-1', details: 'Called client', author: 'Ana', timestamp: new Date('2024-01-15') },
        { id: 'h-2', details: 'Meeting', author: null, timestamp: null },
      ],
    };
    prisma.$transaction.mockResolvedValue([[firm], 1]);
    const result = await resolvers.Query.getFirms(null, { page: 1, limit: 10 }, ctx);
    expect(result.data[0].history[0].author).toBe('Ana');
    expect(result.data[0].history[0].timestamp).not.toBeNull();
    expect(result.data[0].history[1].author).toBeNull();
    expect(result.data[0].history[1].timestamp).toBeNull();
  });

  test('formats contacts and firmEventStatuses', async () => {
    const firm = {
      ...mockFirm,
      contacts: [{ id: 'c-1', name: 'Alice', email: null, phoneNumber: null, position: null, isPrimary: true }],
      firmEventStatuses: [{ id: 'fes-1', status: 'Confirmed', eventId: 'evt-1', event: { name: 'Gala 2024' } }],
    };
    prisma.$transaction.mockResolvedValue([[firm], 1]);
    const result = await resolvers.Query.getFirms(null, { page: 1, limit: 10 }, ctx);
    expect(result.data[0].contacts[0]).toMatchObject({ id: 'c-1', name: 'Alice', isPrimary: true });
    expect(result.data[0].firmEventStatuses[0]).toMatchObject({ eventName: 'Gala 2024' });
  });

  test('formats contacts with non-null email, phone and position', async () => {
    const firm = {
      ...mockFirm,
      contacts: [{ id: 'c-2', name: 'Bob', email: 'bob@corp.com', phoneNumber: '123', position: 'CEO', isPrimary: false }],
    };
    prisma.$transaction.mockResolvedValue([[firm], 1]);
    const result = await resolvers.Query.getFirms(null, { page: 1, limit: 10 }, ctx);
    expect(result.data[0].contacts[0]).toMatchObject({ email: 'bob@corp.com', phoneNumber: '123', position: 'CEO' });
  });

  test('formats contracts with null completedSteps as empty steps array', async () => {
    const firm = {
      ...mockFirm,
      contracts: [{ id: 'c-2', status: null, completedSteps: null, event: null }],
    };
    prisma.$transaction.mockResolvedValue([[firm], 1]);
    const result = await resolvers.Query.getFirms(null, { page: 1, limit: 10 }, ctx);
    expect(result.data[0].contracts[0].steps).toEqual([]);
    expect(result.data[0].contracts[0].name).toBe('Unknown Event');
  });

  test('uses default page and limit when not provided', async () => {
    prisma.$transaction.mockResolvedValue([[], 0]);
    const result = await resolvers.Query.getFirms(null, {}, ctx);
    expect(result.totalItems).toBe(0);
    expect(result.currentPage).toBe(1);
  });

  test('falls back to "Log" type when history details is empty string', async () => {
    const firm = { ...mockFirm, history: [{ id: 'h-3', details: '', author: null, timestamp: null }] };
    prisma.$transaction.mockResolvedValue([[firm], 1]);
    const result = await resolvers.Query.getFirms(null, { page: 1, limit: 10 }, ctx);
    expect(result.data[0].history[0].type).toBe('Log');
  });

  test('formats firmEventStatuses with null event as null eventName', async () => {
    const firm = {
      ...mockFirm,
      firmEventStatuses: [{ id: 'fes-2', status: 'Pending', eventId: 'evt-1', event: null }],
    };
    prisma.$transaction.mockResolvedValue([[firm], 1]);
    const result = await resolvers.Query.getFirms(null, { page: 1, limit: 10 }, ctx);
    expect(result.data[0].firmEventStatuses[0].eventName).toBeNull();
  });
});

// ─── addFirm ─────────────────────────────────────────────────────────────────

describe('Mutation: addFirm', () => {
  test('creates firm with default status and returns it', async () => {
    const created = { id: 'firm-2', name: 'New Corp', email: null, status: 'In Progress' };
    prisma.firm.create.mockResolvedValue(created);
    const result = await resolvers.Mutation.addFirm(null, { name: 'New Corp' }, ctx);
    expect(result).toEqual(created);
    expect(prisma.firm.create).toHaveBeenCalledWith({
      data: { name: 'New Corp', email: undefined, status: 'In Progress' },
    });
  });
});

// ─── updateFirm ──────────────────────────────────────────────────────────────

describe('Mutation: updateFirm', () => {
  test('maps mail → email and assignedCD → assignedCd', async () => {
    const updated = { id: 'firm-1', email: 'new@email.com', assignedCd: 'user-1' };
    prisma.firm.update.mockResolvedValue(updated);
    await resolvers.Mutation.updateFirm(null, { id: 'firm-1', mail: 'new@email.com', assignedCD: 'user-1' }, ctx);
    expect(prisma.firm.update).toHaveBeenCalledWith({
      where: { id: 'firm-1' },
      data: { email: 'new@email.com', assignedCd: 'user-1' },
    });
  });

  test('sets assignedCd to null when assignedCD is "nobody"', async () => {
    prisma.firm.update.mockResolvedValue({ id: 'firm-1', assignedCd: null });
    await resolvers.Mutation.updateFirm(null, { id: 'firm-1', assignedCD: 'nobody' }, ctx);
    expect(prisma.firm.update.mock.calls[0][0].data.assignedCd).toBeNull();
  });

  test('updates only name when assignedCD and mail are not provided', async () => {
    prisma.firm.update.mockResolvedValue({ id: 'firm-1', name: 'Renamed Corp' });
    await resolvers.Mutation.updateFirm(null, { id: 'firm-1', name: 'Renamed Corp' }, ctx);
    const callData = prisma.firm.update.mock.calls[0][0].data;
    expect(callData).not.toHaveProperty('assignedCd');
    expect(callData).not.toHaveProperty('email');
    expect(callData.name).toBe('Renamed Corp');
  });

  test('sets email to null when mail is empty string', async () => {
    prisma.firm.update.mockResolvedValue({ id: 'firm-1', email: null });
    await resolvers.Mutation.updateFirm(null, { id: 'firm-1', mail: '' }, ctx);
    expect(prisma.firm.update.mock.calls[0][0].data.email).toBeNull();
  });
});

// ─── deleteFirm ──────────────────────────────────────────────────────────────

describe('Mutation: deleteFirm', () => {
  test('deletes firm and returns it', async () => {
    const deleted = { id: 'firm-1', name: 'Gone Corp' };
    prisma.firm.delete.mockResolvedValue(deleted);
    const result = await resolvers.Mutation.deleteFirm(null, { id: 'firm-1' }, ctx);
    expect(prisma.firm.delete).toHaveBeenCalledWith({ where: { id: 'firm-1' } });
    expect(result).toEqual(deleted);
  });
});

// ─── addContact ──────────────────────────────────────────────────────────────

describe('Mutation: addContact', () => {
  test('creates a contact without isPrimary — skips updateMany', async () => {
    const created = { id: 'con-1', name: 'Alice', email: null, phoneNumber: null, position: null, isPrimary: false };
    prisma.contact.create.mockResolvedValue(created);
    const result = await resolvers.Mutation.addContact(null, { firmId: 'firm-1', name: 'Alice' }, ctx);
    expect(prisma.contact.updateMany).not.toHaveBeenCalled();
    expect(prisma.contact.create).toHaveBeenCalledWith({
      data: { firmId: 'firm-1', name: 'Alice', email: null, position: null, phoneNumber: null, isPrimary: false },
    });
    expect(result).toEqual(created);
  });

  test('demotes existing contacts before creating when isPrimary is true', async () => {
    const created = { id: 'con-2', name: 'Bob', isPrimary: true };
    prisma.contact.updateMany.mockResolvedValue({});
    prisma.contact.create.mockResolvedValue(created);
    await resolvers.Mutation.addContact(null, { firmId: 'firm-1', name: 'Bob', isPrimary: true }, ctx);
    expect(prisma.contact.updateMany).toHaveBeenCalledWith({ where: { firmId: 'firm-1' }, data: { isPrimary: false } });
    expect(prisma.contact.create).toHaveBeenCalled();
  });
});

// ─── updateContact ────────────────────────────────────────────────────────────

describe('Mutation: updateContact', () => {
  test('updates contact fields without touching isPrimary logic when isPrimary not true', async () => {
    const updated = { id: 'con-1', name: 'Alice Updated' };
    prisma.contact.update.mockResolvedValue(updated);
    await resolvers.Mutation.updateContact(null, { contactId: 'con-1', name: 'Alice Updated' }, ctx);
    expect(prisma.contact.findUnique).not.toHaveBeenCalled();
    expect(prisma.contact.updateMany).not.toHaveBeenCalled();
    expect(prisma.contact.update).toHaveBeenCalledWith({
      where: { id: 'con-1' },
      data: { name: 'Alice Updated', email: null, position: null, phoneNumber: null },
    });
  });

  test('demotes others and updates when isPrimary is true', async () => {
    prisma.contact.findUnique.mockResolvedValue({ id: 'con-1', firmId: 'firm-1' });
    prisma.contact.updateMany.mockResolvedValue({});
    prisma.contact.update.mockResolvedValue({ id: 'con-1', isPrimary: true });
    await resolvers.Mutation.updateContact(null, { contactId: 'con-1', isPrimary: true }, ctx);
    expect(prisma.contact.findUnique).toHaveBeenCalledWith({ where: { id: 'con-1' } });
    expect(prisma.contact.updateMany).toHaveBeenCalledWith({ where: { firmId: 'firm-1' }, data: { isPrimary: false } });
  });
});

// ─── deleteContact ────────────────────────────────────────────────────────────

describe('Mutation: deleteContact', () => {
  test('deletes contact and returns it', async () => {
    const deleted = { id: 'con-1', name: 'Alice' };
    prisma.contact.delete.mockResolvedValue(deleted);
    const result = await resolvers.Mutation.deleteContact(null, { contactId: 'con-1' }, ctx);
    expect(prisma.contact.delete).toHaveBeenCalledWith({ where: { id: 'con-1' } });
    expect(result).toEqual(deleted);
  });
});

// ─── addContract ─────────────────────────────────────────────────────────────

describe('Mutation: addContract', () => {
  test('creates contract and maps to correct shape', async () => {
    prisma.contract.create.mockResolvedValue({
      id: 'con-1', status: null, event: { name: 'Gala 2024' }, completedSteps: [],
    });
    const result = await resolvers.Mutation.addContract(null, { firmId: 'firm-1', eventId: 'evt-1' }, ctx);
    expect(prisma.contract.create).toHaveBeenCalledWith({
      data: { firmId: 'firm-1', eventId: 'evt-1' },
      include: { event: true },
    });
    expect(result).toEqual({ id: 'con-1', status: null, name: 'Gala 2024', steps: [] });
  });

  test('falls back to "Unknown Event" when event is null', async () => {
    prisma.contract.create.mockResolvedValue({ id: 'con-2', status: null, event: null });
    const result = await resolvers.Mutation.addContract(null, { firmId: 'firm-1', eventId: 'evt-1' }, ctx);
    expect(result.name).toBe('Unknown Event');
  });
});

// ─── deleteContract ───────────────────────────────────────────────────────────

describe('Mutation: deleteContract', () => {
  test('deletes contract and returns correct shape', async () => {
    prisma.contract.delete.mockResolvedValue({
      id: 'con-1', status: 'Active', event: { name: 'Gala 2024' },
    });
    const result = await resolvers.Mutation.deleteContract(null, { contractId: 'con-1' }, ctx);
    expect(prisma.contract.delete).toHaveBeenCalledWith({
      where: { id: 'con-1' },
      include: { event: true },
    });
    expect(result).toEqual({ id: 'con-1', status: 'Active', name: 'Gala 2024', steps: [] });
  });

  test('falls back to "Unknown Event" when event is null', async () => {
    prisma.contract.delete.mockResolvedValue({ id: 'con-2', status: null, event: null });
    const result = await resolvers.Mutation.deleteContract(null, { contractId: 'con-2' }, ctx);
    expect(result.name).toBe('Unknown Event');
  });
});

// ─── updateContractSteps ──────────────────────────────────────────────────────

describe('Mutation: updateContractSteps', () => {
  test('updates completedSteps and returns them as steps', async () => {
    prisma.contract.update.mockResolvedValue({
      id: 'con-1', status: 'Active', event: { name: 'Gala 2024' }, completedSteps: ['step1', 'step2'],
    });
    const result = await resolvers.Mutation.updateContractSteps(
      null, { contractId: 'con-1', steps: ['step1', 'step2'] }, ctx
    );
    expect(prisma.contract.update).toHaveBeenCalledWith({
      where: { id: 'con-1' },
      data: { completedSteps: ['step1', 'step2'] },
      include: { event: true },
    });
    expect(result.steps).toEqual(['step1', 'step2']);
  });

  test('handles null event and null completedSteps', async () => {
    prisma.contract.update.mockResolvedValue({ id: 'con-2', status: null, event: null, completedSteps: null });
    const result = await resolvers.Mutation.updateContractSteps(null, { contractId: 'con-2', steps: [] }, ctx);
    expect(result.name).toBe('Unknown Event');
    expect(result.steps).toEqual([]);
  });
});

// ─── addTask ─────────────────────────────────────────────────────────────────

describe('Mutation: addTask', () => {
  test('creates task with isDone false and returns it', async () => {
    const created = { id: 'task-1', desc: 'Send invoice', isDone: false, firmId: 'firm-1' };
    prisma.task.create.mockResolvedValue(created);
    const result = await resolvers.Mutation.addTask(null, { firmId: 'firm-1', desc: 'Send invoice' }, ctx);
    expect(prisma.task.create).toHaveBeenCalledWith({
      data: { desc: 'Send invoice', firmId: 'firm-1', isDone: false },
    });
    expect(result).toEqual(created);
  });
});

// ─── toggleTask ───────────────────────────────────────────────────────────────

describe('Mutation: toggleTask', () => {
  test('flips isDone from false to true', async () => {
    prisma.task.findUnique.mockResolvedValue({ id: 'task-1', isDone: false });
    prisma.task.update.mockResolvedValue({ id: 'task-1', isDone: true });
    const result = await resolvers.Mutation.toggleTask(null, { taskId: 'task-1' }, ctx);
    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: { isDone: true },
    });
    expect(result.isDone).toBe(true);
  });

  test('flips isDone from true to false', async () => {
    prisma.task.findUnique.mockResolvedValue({ id: 'task-1', isDone: true });
    prisma.task.update.mockResolvedValue({ id: 'task-1', isDone: false });
    const result = await resolvers.Mutation.toggleTask(null, { taskId: 'task-1' }, ctx);
    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: { isDone: false },
    });
    expect(result.isDone).toBe(false);
  });
});

// ─── deleteTask ───────────────────────────────────────────────────────────────

describe('Mutation: deleteTask', () => {
  test('deletes task and returns it', async () => {
    const deleted = { id: 'task-1', desc: 'Send invoice', isDone: false };
    prisma.task.delete.mockResolvedValue(deleted);
    const result = await resolvers.Mutation.deleteTask(null, { taskId: 'task-1' }, ctx);
    expect(prisma.task.delete).toHaveBeenCalledWith({ where: { id: 'task-1' } });
    expect(result).toEqual(deleted);
  });
});

// ─── addHistory ───────────────────────────────────────────────────────────────

describe('Mutation: addHistory', () => {
  test('maps desc → details and parses date string to Date', async () => {
    const created = { id: 'hist-1', details: 'Called client', author: 'Ana', timestamp: new Date('2024-01-15') };
    prisma.history.create.mockResolvedValue(created);
    const result = await resolvers.Mutation.addHistory(
      null,
      { firmId: 'firm-1', type: 'Call', desc: 'Called client', author: 'Ana', date: '2024-01-15' },
      ctx
    );
    expect(prisma.history.create).toHaveBeenCalledWith({
      data: {
        details: 'Called client',
        author: 'Ana',
        timestamp: expect.any(Date),
        firmId: 'firm-1',
      },
    });
    expect(result).toEqual(created);
  });
});

// ─── deleteHistory ────────────────────────────────────────────────────────────

describe('Mutation: deleteHistory', () => {
  test('deletes history entry and returns it', async () => {
    const deleted = { id: 'hist-1', details: 'Called client' };
    prisma.history.delete.mockResolvedValue(deleted);
    const result = await resolvers.Mutation.deleteHistory(null, { historyId: 'hist-1' }, ctx);
    expect(prisma.history.delete).toHaveBeenCalledWith({ where: { id: 'hist-1' } });
    expect(result).toEqual(deleted);
  });
});

// ─── getEvents ────────────────────────────────────────────────────────────────

describe('Query: getEvents', () => {
  test('returns events ordered by year descending', async () => {
    const events = [{ id: 'evt-1', name: 'Gala 2024', year: 2024 }, { id: 'evt-2', name: 'Gala 2023', year: 2023 }];
    prisma.event.findMany.mockResolvedValue(events);
    const result = await resolvers.Query.getEvents(null, {}, ctx);
    expect(prisma.event.findMany).toHaveBeenCalledWith({ orderBy: { year: 'desc' } });
    expect(result).toEqual(events);
  });
});

// ─── Subscription ─────────────────────────────────────────────────────────────

describe('Subscription: firmAdded', () => {
  test('subscribe returns an async iterator', () => {
    const iterator = resolvers.Subscription.firmAdded.subscribe();
    expect(iterator).toBeDefined();
  });
});

// ─── setFirmEventStatus ───────────────────────────────────────────────────────

describe('Mutation: setFirmEventStatus', () => {
  test('upserts status and returns formatted record with eventName', async () => {
    prisma.firmEventStatus.upsert.mockResolvedValue({
      id: 'fes-1', status: 'Confirmed', eventId: 'evt-1', event: { name: 'Gala 2024' },
    });
    const result = await resolvers.Mutation.setFirmEventStatus(
      null, { firmId: 'firm-1', eventId: 'evt-1', status: 'Confirmed' }, ctx
    );
    expect(prisma.firmEventStatus.upsert).toHaveBeenCalledWith({
      where: { firmId_eventId: { firmId: 'firm-1', eventId: 'evt-1' } },
      update: { status: 'Confirmed' },
      create: { firmId: 'firm-1', eventId: 'evt-1', status: 'Confirmed' },
      include: { event: true },
    });
    expect(result).toEqual({ id: 'fes-1', status: 'Confirmed', eventId: 'evt-1', eventName: 'Gala 2024' });
  });

  test('returns eventName as null when event is missing', async () => {
    prisma.firmEventStatus.upsert.mockResolvedValue({
      id: 'fes-2', status: 'Pending', eventId: 'evt-2', event: null,
    });
    const result = await resolvers.Mutation.setFirmEventStatus(
      null, { firmId: 'firm-1', eventId: 'evt-2', status: 'Pending' }, ctx
    );
    expect(result.eventName).toBeNull();
  });
});
