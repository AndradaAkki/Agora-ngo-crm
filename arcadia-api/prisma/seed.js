const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
 
  // 1. Create a System Admin User (Required to link Firms and History)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@arcadia.com',
      username: 'admin_test',
      password: 'password123', 
      role: 'ADMIN',
      isAdmin: true,
      displayName: 'System Admin',
    },
  });

  // 2. Create 2 Events
  const event1 = await prisma.event.create({
    data: { name: 'Global Tech Summit', year: 2026, details: 'Main IT conference' }
  });
  const event2 = await prisma.event.create({
    data: { name: 'Regional Expo', year: 2026, details: 'Local business networking' }
  });

  // 3. Create the 2 "Special" Firms with deeply nested relations
  for (let i = 1; i <= 2; i++) {
    await prisma.firm.create({
      data: {
        name: `Premium Partner ${i} SRL`,
        email: `contact@premium${i}.ro`,
        status: 'Active',
        details: `This is a highly detailed description for our premium partner firm ${i}. They require special handling.`,
        assignedCd: admin.id, // Linking to the admin user
        
        // Creating 3 Contacts (1 Primary)
        contacts: {
          create: [
            { name: `Director ${i}`, email: `ceo@premium${i}.ro`, position: 'CEO', isPrimary: true },
            { name: `Manager ${i}A`, email: `hr@premium${i}.ro`, position: 'HR Manager', isPrimary: false },
            { name: `Manager ${i}B`, email: `tech@premium${i}.ro`, position: 'CTO', isPrimary: false },
          ]
        },
        
        // Creating 2 Contracts (Linked to the 2 events created above)
        contracts: {
          create: [
            { status: 'Signed', eventId: event1.id },
            { status: 'Pending Negotiation', eventId: event2.id },
          ]
        },
        
        // Creating 3 History Entries
        history: {
          create: [
            { details: 'Initial cold call completed.', userId: admin.id },
            { details: 'Follow-up meeting scheduled.', userId: admin.id },
            { details: 'Contracts sent for review.', userId: admin.id },
          ]
        }
      }
    });
  }

  // 4. Create the remaining 28 standard firms
  const standardFirmsData = Array.from({ length: 28 }).map((_, index) => ({
    name: `Standard Firm ${index + 3} SRL`,
    email: `info@standard${index + 3}.ro`,
    status: index % 2 === 0 ? 'Active' : 'Lead', // Alternates between Active and Lead
    assignedCd: admin.id,
  }));

  // Insert all 28 at once
  await prisma.firm.createMany({
    data: standardFirmsData
  });

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });