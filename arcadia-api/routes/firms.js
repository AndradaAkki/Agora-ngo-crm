const { faker } = require('@faker-js/faker');
let generationInterval = null; // This will hold our asynchronous loop timer
const express = require('express');
const router = express.Router();
const { firms } = require('../data/memoryDb'); // Import our RAM database

// GET all firms (With Server-Side Pagination)
router.get('/', (req, res) => {
    // Read page and limit from the URL, or use defaults (Page 1, 2 items per page)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2; 
    
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Slice the array to get just the items for the current page
    const paginatedFirms = firms.slice(startIndex, endIndex);

    res.json({
        totalItems: firms.length,
        currentPage: page,
        totalPages: Math.ceil(firms.length / limit),
        data: paginatedFirms
    });
});

// POST a new firm (With Server-Side Validation)
router.post('/', (req, res) => {
    const { name, email, status } = req.body;

    // Server-Side Validation Rule
    if (!name || !email) {
        return res.status(400).json({ error: "Validation Failed: Name and email are required fields." });
    }

    const newFirm = {
        id: firms.length > 0 ? Math.max(...firms.map(f => f.id)) + 1 : 1, // Auto-increment ID
        name,
        email,
        status: status || 'In Progress'
    };

    firms.push(newFirm); // Save to RAM
    res.status(201).json(newFirm);
});
// ==========================================
// UPDATE a specific firm (PUT)
// Endpoint: PUT http://localhost:3000/api/firms/:id
// ==========================================
router.put('/:id', (req, res) => {
    // 1. Grab the ID from the URL and convert it to a number
    const firmId = parseInt(req.params.id);
    const { name, email, status } = req.body;

    // 2. Find the index of this firm in our RAM array
    const firmIndex = firms.findIndex(f => f.id === firmId);

    // 3. If it doesn't exist, return a 404 Not Found error
    if (firmIndex === -1) {
        return res.status(404).json({ error: "Firm not found." });
    }

    // 4. Server-Side Validation [cite: 29]
    if (!name || !email) {
        return res.status(400).json({ error: "Validation Failed: Name and email are required." });
    }

    // 5. Update the firm in the array
    firms[firmIndex] = { ...firms[firmIndex], name, email, status };
    
    // 6. Send the updated firm back to the user
    res.json(firms[firmIndex]);
});


// ==========================================
// DELETE a specific firm (DELETE)
// Endpoint: DELETE http://localhost:3000/api/firms/:id
// ==========================================
router.delete('/:id', (req, res) => {
    // 1. Grab the ID from the URL
    const firmId = parseInt(req.params.id);
    
    // 2. Find it in our RAM array
    const firmIndex = firms.findIndex(f => f.id === firmId);

    // 3. If it doesn't exist, return a 404
    if (firmIndex === -1) {
        return res.status(404).json({ error: "Firm not found." });
    }

    // 4. Remove it from the array using splice()
    const deletedFirm = firms.splice(firmIndex, 1);
    
    // 5. Send a success message
    res.json({ message: "Firm deleted successfully", deleted: deletedFirm[0] });
});
// ==========================================
// SILVER CHALLENGE: Start Faker Loop
// Endpoint: POST http://localhost:3000/api/firms/generate/start
// ==========================================
router.post('/generate/start', (req, res) => {
    // Prevent starting multiple loops
    if (generationInterval) {
        return res.status(400).json({ message: "Generation loop is already running." });
    }

    const io = req.app.get('socketio'); // Grab the WebSocket instance from server.js

    // Start an async loop every 5 seconds
    generationInterval = setInterval(() => {
        // Generate a random batch size (1 to 3 new firms at a time)
        const batchSize = Math.floor(Math.random() * 3) + 1;
        const newBatch = [];

        for (let i = 0; i < batchSize; i++) {
            const newFirm = {
                id: firms.length > 0 ? Math.max(...firms.map(f => f.id)) + 1 : 1,
                name: faker.company.name(),
                contactName: faker.person.fullName(),
                email: faker.internet.email(),
                status: faker.helpers.arrayElement(['Accepted', 'In Progress', 'Rejected'])
            };
            firms.push(newFirm);
            newBatch.push(newFirm);
        }

        console.log(`Faker generated ${batchSize} new firms.`);

        // USE WEBSOCKETS TO ALERT THE CLIENT [Silver Requirement]
        io.emit('new_firms_added', newBatch);

    }, 5000); // 5000 ms = 5 seconds

    res.json({ message: "Started generating fake firms every 5 seconds." });
});

// ==========================================
// SILVER CHALLENGE: Stop Faker Loop
// Endpoint: POST http://localhost:3000/api/firms/generate/stop
// ==========================================
router.post('/generate/stop', (req, res) => {
    if (generationInterval) {
        clearInterval(generationInterval); // Stop the timer
        generationInterval = null;
        console.log("Faker generation stopped.");
        res.json({ message: "Stopped generating fake firms." });
    } else {
        res.status(400).json({ message: "Generation is not currently running." });
    }
});
module.exports = router;