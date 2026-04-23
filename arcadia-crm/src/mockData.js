export const mockData = [
  {
    id: 1,
    name: "Tech Solutions Inc.",
    contactName: "Sarah Johnson",
    email: "sarah.j@techsolutions.com",
    phone: "+1 (555) 123-4567",
    status: "Accepted",
    lastContact: "2026-03-25",
    details: "Agreed to 500 EUR sponsorship and 2 tech speakers for Job Fair.",
    assignedCD: "Alex Thompson",
    contacts: [
      { id: 1, name: "Sarah Johnson", position: "Marketing Dir.", email: "sarah.j@techsolutions.com", phone: "+1 (555) 123-4567", isPrimary: true },
      { id: 2, name: "Tom Baker", position: "HR Lead", email: "tbaker@techsolutions.com", phone: "+1 (555) 123-9999", isPrimary: false }
    ],
    contracts: [
      { name: "CariereInIT 2026", steps: ["Accepted", "Legal info", "Contract sent"] }
    ],
    history: [
      { type: "Call", desc: "Negotiated sponsorship package", author: "Alex", date: "2026-03-25" },
      { type: "Email", desc: "Sent proposal deck", author: "Alex", date: "2026-03-20" }
    ]
  },
  {
    id: 2,
    name: "DataStream Corp",
    contactName: "Mike Chen",
    email: "m.chen@datastream.com",
    phone: "+1 (555) 987-6543",
    status: "In Progress",
    lastContact: "2026-03-30",
    details: "Waiting for budget approval from their local marketing department.",
    assignedCD: "Alex Thompson",
    contacts: [
      { id: 1, name: "Mike Chen", position: "Talent Acquisition", email: "m.chen@datastream.com", phone: "+1 (555) 987-6543", isPrimary: true }
    ],
    contracts: [],
    history: [
      { type: "Meeting", desc: "Introductory call with HR team", author: "Alex", date: "2026-03-30" }
    ]
  },
  {
    id: 3,
    name: "CloudNet Systems",
    contactName: "Emma Davis",
    email: "emma.d@cloudnet.com",
    phone: "+1 (555) 456-7890",
    status: "Rejected",
    lastContact: "2026-02-15",
    details: "No budget allocated for student events this quarter.",
    assignedCD: "Sarah Johnson"
  },
  {
    id: 4,
    name: "Nexus Development",
    contactName: "Alex Rivera",
    email: "arivera@nexusdev.com",
    phone: "+1 (555) 234-5678",
    status: "In Progress",
    lastContact: "2026-04-01",
    details: "Scheduled a follow-up meeting for next Tuesday.",
    assignedCD: "Sarah Johnson"
  },
  {
    id: 5,
    name: "Stark Industries",
    contactName: "Tony Stark",
    email: "tony@stark.com",
    phone: "+1 (555) 111-2222",
    status: "Accepted",
    lastContact: "2026-03-28",
    details: "Signed platinum sponsorship contract.",
    assignedCD: "Mike Davis"
  },
  {
    id: 6,
    name: "Wayne Enterprises",
    contactName: "Bruce Wayne",
    email: "bruce@wayne.com",
    phone: "+1 (555) 333-4444",
    status: "In Progress",
    lastContact: "2026-03-29",
    details: "Reviewing event proposal details.",
    assignedCD: "nobody"
  },
  {
    id: 7,
    name: "Acme Corp",
    contactName: "Wile E. Coyote",
    email: "wile@acme.com",
    phone: "+1 (555) 999-0000",
    status: "Rejected",
    lastContact: "2026-01-10",
    details: "Not interested in university recruiting right now.",
    assignedCD: "nobody"
  },
  {
    id: 8,
    name: "Globex Corporation",
    contactName: "Hank Scorpio",
    email: "hank@globex.com",
    phone: "+1 (555) 666-7777",
    status: "Accepted",
    lastContact: "2026-04-02",
    details: "Confirmed attendance for the startup panel.",
    assignedCD: "nobody",
    contacts: [
      { id: 1, name: "Hank Scorpio", position: "CRO", email: "hank@globex.com", phone: "+1 (555) 666-7777", isPrimary: true },
      { id: 2, name: "Mike Davis", position: "CTO", email: "mike@example.com", phone: "+1 (555) 987-6543", isPrimary: false },
      { id: 3, name: "Anna Lee", position: "HR Manager", email: "anna@example.com", phone: "+1 (555) 555-5555", isPrimary: false }
    ],
    contracts: [
      { name: "CariereInIT 2026", steps: ["Accepted", "Legal info", "Contract sent", "Signed by them", "Signed by us", "Got Paid"] },
      { name: "Anytime 2026", steps: ["Accepted", "Legal info", "Contract sent", "Signed by them"] }
    ],
    history: [
      { type: "Email", desc: "sent initial mail for CariereInIT 2026", author: "Alex", date: "2026-05-07" },
      { type: "Call", desc: "discussed sponsorship tiers", author: "Alex", date: "2026-05-06" },
      { type: "Contract", desc: "drafted contract revisions", author: "Sarah", date: "2026-05-05" },
      { type: "Call", desc: "initial contact", author: "Alex", date: "2026-05-01" }
    ]
  }
];
export default mockData;