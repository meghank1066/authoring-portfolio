require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();

app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);

let sightings;

// Get all the saved visitor cards
app.get('/api/sightings', async (req, res) => {
    try {
        const items = await sightings
            .find()
            .sort({ createdAt: -1 })
            .toArray();

        res.json({ items });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not load sightings' });
    }
});

// saves a new visitor card
app.post('/api/sightings', async (req, res) => {
    try {
        const { name, insect, insectName, color, strokes } = req.body;


        const colours = [
            'red', 'yellow', 'purple', 'blue',
            'green', 'pink', 'moss', 'meg'
        ];

        const insects = [
            'ladybug', 'bee', 'butterfly', 'dragonfly',
            'grasshopper', 'spider', 'firefly', 'meg'
        ];

        if (
            typeof name !== 'string' ||
            !name.trim() ||
            !colours.includes(color) ||
            !insects.includes(insect) ||
            typeof insectName !== 'string' ||
            !Array.isArray(strokes) ||
            strokes.length > 40
        ) {
            return res.status(400).json({ error: 'Invalid visitor card' });
        }

        const card = {
            name: name.trim().slice(0, 28),
            insect,
            insectName,
            color,
            strokes,
            createdAt: new Date().toISOString()
        };

        const result = await sightings.insertOne(card);

        res.status(201).json({
            ...card,
            _id: result.insertedId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not save visitor card' });
    }
});

// deletes a visitor card by its ID
app.delete('/api/sightings/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                error: 'Invalid visitor card ID'
            });
        }

        const result = await sightings.deleteOne({
            _id: new ObjectId(id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                error: 'Visitor card not found'
            });
        }

        res.json({ message: 'Visitor card deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'Could not delete visitor card'
        });
    }
});

// serve the website files
app.use(express.static(path.join(__dirname, '..')));

// connects to mongo and starts the server
async function startServer() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is missing from your .env file');
        }

        await client.connect();

        const db = client.db(process.env.DB_NAME || 'portfolio');
        sightings = db.collection('sightings');

        const port = process.env.PORT || 3000;

        app.listen(port, () => {
            console.log(`Website running at http://localhost:${port}/playground.html`);
        });
    } catch (err) {
        console.error('Could not start server:', err.message);
    }
}

startServer();