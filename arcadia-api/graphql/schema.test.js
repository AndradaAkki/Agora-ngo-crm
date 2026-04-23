const { resolvers } = require('./schema');
const { firms } = require('../data/memoryDb');

describe('GraphQL Resolvers', () => {

  // TEST 1: Check if the Query successfully fetches paginated firms
  test('Query: getFirms should return paginated data', () => {
    // We simulate Apollo calling our function by passing (parent, args)
    const result = resolvers.Query.getFirms(null, { page: 1, limit: 10 });
    
    expect(result.data).toBeDefined();
    expect(result.currentPage).toBe(1);
    expect(result.totalItems).toBe(firms.length);
  });

  // TEST 2: Check if the Mutation successfully adds a new firm
  test('Mutation: addFirm should create a new company', () => {
    const newFirmArgs = { 
      name: "Jest Testing Corp", 
      email: "test@jest.com", 
      status: "In Progress" 
    };
    
    const newFirm = resolvers.Mutation.addFirm(null, newFirmArgs);

    expect(newFirm.id).toBeDefined();
    expect(newFirm.name).toBe("Jest Testing Corp");
    expect(newFirm.email).toBe("test@jest.com");
    expect(newFirm.contacts).toEqual([]); // Should start with empty contacts
  });

  // TEST 3: Check if the Mutation successfully adds a contact to a firm
  test('Mutation: addContact should add a contact to an existing firm', () => {
    // Grab the firm we just created in the previous test
    const targetFirm = firms[firms.length - 1]; 
    
    const newContactArgs = { 
      firmId: targetFirm.id, 
      name: "Unit Tester", 
      email: "tester@jest.com" 
    };

    const updatedFirm = resolvers.Mutation.addContact(null, newContactArgs);

    expect(updatedFirm.contacts.length).toBeGreaterThan(0);
    expect(updatedFirm.contacts[0].name).toBe("Unit Tester");
    expect(updatedFirm.contacts[0].id).toBeDefined();
  });
// TEST 4: Check if Query successfully fetches a single firm by ID
  test('Query: getFirm should return a specific firm', () => {
    const targetFirm = firms[0]; // Grab the first firm in the DB
    const result = resolvers.Query.getFirm(null, { id: targetFirm.id });
    
    expect(result).toBeDefined();
    expect(result.id).toBe(targetFirm.id);
  });

  // TEST 5: Check if updateFirm modifies data correctly
  test('Mutation: updateFirm should modify an existing firm', () => {
    const targetFirm = firms[0];
    const result = resolvers.Mutation.updateFirm(null, { 
      id: targetFirm.id, 
      status: "Accepted" 
    });
    
    expect(result.status).toBe("Accepted");
  });

  // TEST 6: Check if deleteFirm removes the firm
  test('Mutation: deleteFirm should remove a firm', () => {
    // Create a temporary firm just so we can delete it safely
    const tempFirm = resolvers.Mutation.addFirm(null, { 
      name: "Delete Me", email: "x@x.com", status: "In Progress" 
    });
    
    const initialLength = firms.length;
    const result = resolvers.Mutation.deleteFirm(null, { id: tempFirm.id });
    
    expect(result.id).toBe(tempFirm.id);
    expect(firms.length).toBe(initialLength - 1);
  });

  // TEST 7: Check if updateContact modifies an existing contact
  test('Mutation: updateContact should modify contact details', () => {
    const targetFirm = firms[firms.length - 1]; // The firm we added in Test 2
    const targetContact = targetFirm.contacts[0]; // The contact we added in Test 3
    
    const result = resolvers.Mutation.updateContact(null, {
      firmId: targetFirm.id,
      contactId: targetContact.id,
      position: "Senior Lead Tester"
    });

    const updatedContact = result.contacts.find(c => c.id === targetContact.id);
    expect(updatedContact.position).toBe("Senior Lead Tester");
  });

  // TEST 8: Check if deleteContact removes the contact from the array
  test('Mutation: deleteContact should remove a contact', () => {
    const targetFirm = firms[firms.length - 1]; 
    const targetContact = targetFirm.contacts[0]; 
    
    const result = resolvers.Mutation.deleteContact(null, {
      firmId: targetFirm.id,
      contactId: targetContact.id
    });

    // Verify the contact no longer exists in the array
    const foundContact = result.contacts.find(c => c.id === targetContact.id);
    expect(foundContact).toBeUndefined();
  });
  // TEST 9: updateFirm should fail if ID is wrong
  test('Mutation: updateFirm should throw error if firm not found', () => {
    expect(() => {
      resolvers.Mutation.updateFirm(null, { id: 99999, status: "Accepted" });
    }).toThrow("Firm not found");
  });

  // TEST 10: deleteFirm should fail if ID is wrong
  test('Mutation: deleteFirm should throw error if firm not found', () => {
    expect(() => {
      resolvers.Mutation.deleteFirm(null, { id: 99999 });
    }).toThrow("Firm not found");
  });

  // TEST 11: addContact should fail if Firm ID is wrong
  test('Mutation: addContact should throw error if firm not found', () => {
    expect(() => {
      resolvers.Mutation.addContact(null, { firmId: 99999, name: "Ghost Contact" });
    }).toThrow("Firm not found");
  });

  // TEST 12: updateContact should fail if Contact ID is wrong
  test('Mutation: updateContact should throw error if contact not found', () => {
    // Grab the firm we made in the earlier test that DEFINITELY has contacts
    const targetFirm = firms[firms.length - 1]; 
    
    expect(() => {
      resolvers.Mutation.updateContact(null, { firmId: targetFirm.id, contactId: "fake-contact-id" });
    }).toThrow("Contact not found");
  });

  // TEST 13: deleteContact should fail if Firm ID is wrong
  test('Mutation: deleteContact should throw error if firm not found', () => {
    expect(() => {
      resolvers.Mutation.deleteContact(null, { firmId: 99999, contactId: "123" });
    }).toThrow("Firm not found");
  });
  // TEST 14: cover line 100 (initialize empty contacts if missing)
  test('Mutation: addContact should initialize contacts array if missing', () => {
    // Create a firm and manually strip its contacts array
    const tempFirm = resolvers.Mutation.addFirm(null, { name: "No Contacts Corp", email: "nc@test.com" });
    delete tempFirm.contacts; 

    const result = resolvers.Mutation.addContact(null, { 
      firmId: tempFirm.id, 
      name: "New Contact", 
      email: "new@test.com" 
    });

    expect(Array.isArray(result.contacts)).toBe(true);
    expect(result.contacts.length).toBe(1);
  });

  // TEST 15: cover line 118 (updateContact returns firm if no contact list exists)
  test('Mutation: updateContact should return firm if contacts array is missing', () => {
    const tempFirm = resolvers.Mutation.addFirm(null, { name: "No Contacts Corp", email: "nc@test.com" });
    delete tempFirm.contacts;

    const result = resolvers.Mutation.updateContact(null, { 
      firmId: tempFirm.id, 
      contactId: "123", 
      name: "Updated" 
    });

    expect(result.id).toBe(tempFirm.id);
  });

  // TEST 16: cover line 133 (deleteContact returns firm if no contact list exists)
  test('Mutation: deleteContact should return firm if contacts array is missing', () => {
    const tempFirm = resolvers.Mutation.addFirm(null, { name: "No Contacts Corp", email: "nc@test.com" });
    delete tempFirm.contacts;

    const result = resolvers.Mutation.deleteContact(null, { 
      firmId: tempFirm.id, 
      contactId: "123" 
    });

    expect(result.id).toBe(tempFirm.id);
  });
  // TEST 17: cover line 71 (Empty database case)
  test('Mutation: addFirm should handle empty database for ID generation', () => {
    // We temporarily empty the firms array to trigger the "0" case in the ternary operator
    const originalFirms = [...firms];
    firms.length = 0; 

    const result = resolvers.Mutation.addFirm(null, { name: "First Firm", email: "first@test.com" });
    
    expect(result.id).toBe(1); // Should trigger the ": 1" part of line 71
    
    // Restore the database for other tests
    firms.push(...originalFirms);
  });

  // TEST 18: cover lines 53-64 (Query with missing arguments)
  test('Query: getFirms should use default pagination values', () => {
    // Calling without page/limit to trigger the default values (= 1, = 50)
    const result = resolvers.Query.getFirms(null, {});
    
    expect(result.currentPage).toBe(1);
    expect(result.data.length).toBeLessThanOrEqual(50);
  });

  // TEST 19: cover line 117 (updateContact with non-existent firm)
  test('Mutation: updateContact should throw error if firmId is invalid', () => {
    expect(() => {
      resolvers.Mutation.updateContact(null, { 
        firmId: 99999, 
        contactId: "1", 
        name: "Fail" 
      });
    }).toThrow("Firm not found");
  });
});