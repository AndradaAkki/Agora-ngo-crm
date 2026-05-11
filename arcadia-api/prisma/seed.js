const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  await prisma.history.deleteMany();
  await prisma.task.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.firm.deleteMany();
  await prisma.user.deleteMany();
  await prisma.event.deleteMany();
  console.log('Seeding database...');

  // ─── USERS ──────────────────────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      email: 'admin@arcadia.com',
      username: 'admin',
      password: 'password123',
      role: 'ADMIN',
      isAdmin: true,
      displayName: 'System Admin',
    },
  });

  const alex = await prisma.user.create({
    data: {
      email: 'alex.thompson@arcadia.com',
      username: 'alex_thompson',
      password: 'password123',
      role: 'Externe CD',
      isAdmin: false,
      displayName: 'Alex Thompson',
    },
  });

  const sarah = await prisma.user.create({
    data: {
      email: 'sarah.johnson@arcadia.com',
      username: 'sarah_johnson',
      password: 'password123',
      role: 'General CD',
      isAdmin: false,
      displayName: 'Sarah Johnson',
    },
  });

  // ─── EVENTS ─────────────────────────────────────────────────────────────────
  const eventCariere = await prisma.event.create({
    data: { name: 'CariereInIT', year: 2026, details: 'Main annual IT careers fair' },
  });

  const eventTechSummit = await prisma.event.create({
    data: { name: 'Global Tech Summit', year: 2026, details: 'International technology conference' },
  });

  const eventStartup = await prisma.event.create({
    data: { name: 'Startup Expo', year: 2025, details: 'Regional startup networking event' },
  });

  // ─── DETAILED FIRMS (tests all relations) ───────────────────────────────────

  // Firm 1: Fully accepted sponsor, two events, active tasks, rich history
  await prisma.firm.create({
    data: {
      name: 'TechVision SRL',
      email: 'contact@techvision.ro',
      status: 'Accepted',
      details: 'Key sponsor for three consecutive years. Very responsive. Primary contact prefers email over phone.',
      assignedCd: alex.id,
      contacts: {
        create: [
          { name: 'Mihai Popescu', email: 'mihai@techvision.ro', position: 'CEO', phoneNumber: '0722-111-001', isPrimary: true },
          { name: 'Elena Ionescu', email: 'elena@techvision.ro', position: 'Marketing Director', phoneNumber: '0722-111-002', isPrimary: false },
          { name: 'Radu Constantin', email: 'radu@techvision.ro', position: 'Legal Counsel', phoneNumber: '0722-111-003', isPrimary: false },
        ],
      },
      contracts: {
        create: [
          { status: 'Signed', eventId: eventCariere.id },
          { status: 'In Negotiation', eventId: eventTechSummit.id },
        ],
      },
      history: {
        create: [
          { details: 'Initial cold call. Spoke with Mihai, expressed strong interest.', author: 'Alex Thompson', timestamp: new Date('2025-10-05') },
          { details: 'Follow-up email sent with sponsorship package details.', author: 'Alex Thompson', timestamp: new Date('2025-10-18') },
          { details: 'Meeting held at their HQ. Verbal agreement reached on Gold tier.', author: 'Alex Thompson', timestamp: new Date('2025-11-02') },
          { details: 'Contract signed and returned. Payment invoice sent.', author: 'Alex Thompson', timestamp: new Date('2025-12-01') },
        ],
      },
      tasks: {
        create: [
          { desc: 'Send final invoice for CariereInIT Gold package', isDone: true },
          { desc: 'Confirm logo placement on main banner', isDone: true },
          { desc: 'Schedule post-event debrief call', isDone: false },
          { desc: 'Prepare renewal proposal for 2027', isDone: false },
        ],
      },
    },
  });

  // Firm 2: In progress, one event, paused contact, partial tasks
  await prisma.firm.create({
    data: {
      name: 'Innovatech Labs',
      email: 'office@innovatech.ro',
      status: 'In Progress',
      details: 'Start-up, limited budget. May be interested in a Silver package. Decision maker is hard to reach — try Thursday afternoons. (Paused until June 15)',
      assignedCd: sarah.id,
      contacts: {
        create: [
          { name: 'Andrei Vlad', email: 'andrei@innovatech.ro', position: 'Founder', phoneNumber: '0733-222-001', isPrimary: true },
          { name: 'Cristina Marin', email: 'cristina@innovatech.ro', position: 'COO', phoneNumber: '0733-222-002', isPrimary: false },
        ],
      },
      contracts: {
        create: [
          { status: 'Pending Signature', eventId: eventCariere.id },
        ],
      },
      history: {
        create: [
          { details: 'LinkedIn outreach sent. No response yet.', author: 'Sarah Johnson', timestamp: new Date('2025-11-10') },
          { details: 'Call with Andrei. Budget constraints discussed. Agreed to revisit in June.', author: 'Sarah Johnson', timestamp: new Date('2025-12-03') },
        ],
      },
      tasks: {
        create: [
          { desc: 'Resend Silver package brochure after June 15 pause lifts', isDone: false },
          { desc: 'Research Innovatech funding rounds for leverage', isDone: true },
        ],
      },
    },
  });

  // Firm 3: Rejected, historical entries only, no tasks
  await prisma.firm.create({
    data: {
      name: 'DataStream Corp',
      email: 'info@datastream.ro',
      status: 'Rejected',
      details: 'Declined sponsorship citing internal budget freeze. Revisit in Q4 2026.',
      assignedCd: alex.id,
      contacts: {
        create: [
          { name: 'George Stancu', email: 'george@datastream.ro', position: 'CFO', phoneNumber: '0744-333-001', isPrimary: true },
        ],
      },
      contracts: {
        create: [],
      },
      history: {
        create: [
          { details: 'Cold email sent. Bounced — wrong address. Updated from LinkedIn.', author: 'Alex Thompson', timestamp: new Date('2025-09-14') },
          { details: 'Call with George. Budget freeze for rest of fiscal year. Polite rejection.', author: 'Alex Thompson', timestamp: new Date('2025-09-28') },
          { details: 'Follow-up to check if freeze lifted. No change in position.', author: 'Alex Thompson', timestamp: new Date('2026-01-12') },
        ],
      },
      tasks: {
        create: [
          { desc: 'Re-contact in Q4 2026 with updated package', isDone: false },
        ],
      },
    },
  });

  // Firm 4: Accepted, assigned to Sarah, two contracts, tasks all done
  await prisma.firm.create({
    data: {
      name: 'CloudBase Solutions',
      email: 'partnerships@cloudbase.ro',
      status: 'Accepted',
      details: 'Platinum tier sponsor. Very professional team. Wire transfer confirmed. Requires 3 booth slots.',
      assignedCd: sarah.id,
      contacts: {
        create: [
          { name: 'Diana Popa', email: 'diana@cloudbase.ro', position: 'Partnerships Manager', phoneNumber: '0755-444-001', isPrimary: true },
          { name: 'Vlad Neagu', email: 'vlad@cloudbase.ro', position: 'CEO', phoneNumber: '0755-444-002', isPrimary: false },
        ],
      },
      contracts: {
        create: [
          { status: 'Signed', eventId: eventCariere.id },
          { status: 'Signed', eventId: eventStartup.id },
        ],
      },
      history: {
        create: [
          { details: 'Introduction call with Diana. Very interested in Platinum.', author: 'Sarah Johnson', timestamp: new Date('2025-08-20') },
          { details: 'Contract delivered and signed within 48 hours. Record turnaround.', author: 'Sarah Johnson', timestamp: new Date('2025-09-01') },
          { details: 'Payment received. Booth materials requested.', author: 'Sarah Johnson', timestamp: new Date('2025-09-10') },
        ],
      },
      tasks: {
        create: [
          { desc: 'Confirm 3 booth slot allocation with logistics team', isDone: true },
          { desc: 'Send Platinum sponsor media kit', isDone: true },
          { desc: 'Add logo to website sponsor section', isDone: true },
        ],
      },
    },
  });

  // Firm 5: In Progress, no contacts yet, early stage
  await prisma.firm.create({
    data: {
      name: 'NexaDigital SRL',
      email: 'hello@nexadigital.ro',
      status: 'In Progress',
      details: 'Found them at a networking event. Early stage — no formal contact established yet. Promising.',
      assignedCd: alex.id,
      contacts: {
        create: [],
      },
      contracts: {
        create: [
          { status: 'Draft', eventId: eventTechSummit.id },
        ],
      },
      history: {
        create: [
          { details: 'Met founder at Cluj Tech Mixer. Exchanged cards. Will follow up Monday.', author: 'Alex Thompson', timestamp: new Date('2026-02-08') },
        ],
      },
      tasks: {
        create: [
          { desc: 'Send intro email with sponsorship deck', isDone: false },
          { desc: 'Find correct decision-maker contact', isDone: false },
        ],
      },
    },
  });

  // Firm 6: Accepted, past event (2025), older history to test the isOld graying in UI
  await prisma.firm.create({
    data: {
      name: 'Helix Software',
      email: 'sponsoring@helix.ro',
      status: 'Accepted',
      details: 'Returning sponsor from 2025. Great relationship. Auto-renewed for 2026.',
      assignedCd: sarah.id,
      contacts: {
        create: [
          { name: 'Ioana Dumitru', email: 'ioana@helix.ro', position: 'CMO', phoneNumber: '0766-555-001', isPrimary: true },
        ],
      },
      contracts: {
        create: [
          { status: 'Signed', eventId: eventStartup.id },
          { status: 'Signed', eventId: eventCariere.id },
        ],
      },
      history: {
        create: [
          // Old entries (2024) — will be greyed out in UI
          { details: 'First contact at 2024 Startup Expo.', author: 'Sarah Johnson', timestamp: new Date('2024-06-15') },
          { details: 'Signed 2025 Startup Expo contract.', author: 'Sarah Johnson', timestamp: new Date('2024-11-20') },
          // Recent entries (2026)
          { details: 'Auto-renewal call. Ioana confirmed 2026 participation.', author: 'Sarah Johnson', timestamp: new Date('2026-01-08') },
          { details: '2026 contract sent and countersigned.', author: 'Sarah Johnson', timestamp: new Date('2026-01-22') },
        ],
      },
      tasks: {
        create: [
          { desc: 'Send 2026 updated sponsor guidelines', isDone: true },
          { desc: 'Add to returning sponsor highlight reel', isDone: false },
        ],
      },
    },
  });

  // ─── STANDARD FIRMS (24 simpler firms, varied statuses and assignments) ─────
  const statuses = ['In Progress', 'In Progress', 'Accepted', 'Rejected', 'In Progress'];
  const assignees = [alex.id, sarah.id, alex.id, sarah.id, admin.id];

  for (let i = 7; i <= 30; i++) {
    const statusIndex = (i - 7) % statuses.length;
    const assigneeIndex = (i - 7) % assignees.length;
    await prisma.firm.create({
      data: {
        name: `Company ${i} SRL`,
        email: `contact@company${i}.ro`,
        status: statuses[statusIndex],
        assignedCd: assignees[assigneeIndex],
        contacts: {
          create: [
            { name: `Contact ${i} Primary`, email: `primary${i}@company${i}.ro`, position: 'Manager', isPrimary: true },
          ],
        },
        history: {
          create: [
            { details: `Initial outreach email sent to Company ${i}.`, author: i % 2 === 0 ? 'Alex Thompson' : 'Sarah Johnson', timestamp: new Date(2026, 0, i) },
          ],
        },
        tasks: {
          create: [
            { desc: `Follow up with Company ${i} this week`, isDone: i % 3 === 0 },
          ],
        },
      },
    });
  }

  console.log('Seeding complete! 30 firms, 3 users, 3 events.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
