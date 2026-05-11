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
