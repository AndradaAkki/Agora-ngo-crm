const { faker } = require('@faker-js/faker');
//node faker-bot.js
const GRAPHQL_URL = 'http://localhost:3000/graphql';
let intervalId;

const generateFirm = async () => {
  const query = `
    mutation AddFirm($name: String!, $email: String!, $status: String!) {
      addFirm(name: $name, email: $email, status: $status) {
        id
        name
      }
    }
  `;

  const variables = {
    name: faker.company.name(),
    email: faker.internet.email(),
    status: faker.helpers.arrayElement(['In Progress', 'Accepted', 'Rejected'])
  };

  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables })
    });
    
    const result = await response.json();
    if (result.errors) {
      console.error(" Error adding firm:", result.errors[0].message);
    } else {
      console.log(` Added: ${result.data.addFirm.name}`);
    }
  } catch (error) {
    console.error(" Failed to connect to server. Is it running?");
  }
};

console.log(" Faker Bot Started. Generating a new company every 5 seconds...");
console.log("Press [Ctrl + C] to stop.");

// Run immediately once, then every 5 seconds
generateFirm();
intervalId = setInterval(generateFirm, 3000);