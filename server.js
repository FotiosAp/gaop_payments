import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Section } from './models/Section.js';
import { Payment } from './models/Payment.js';
import { Record } from './models/Record.js';
import { User } from './models/User.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;
const MONGO_URI = process.env.MONGO_URI;

if (!JWT_SECRET || !MONGO_URI) {
    console.error("FATAL ERROR: JWT_SECRET and MONGO_URI must be defined in the environment (.env).");
    process.exit(1);
}

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        seedDatabase();
    })
    .catch(err => console.error('MongoDB connection error:', err));

// --- HELPER FUNCTIONS ---

const seedDatabase = async () => {
    try {
        const sectionCount = await Section.countDocuments();
        if (sectionCount === 0) {
            console.log('Database appears empty. Seeding from db.json...');
            const dbPath = path.join(__dirname, 'db.json');
            if (fs.existsSync(dbPath)) {
                const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

                // Seed Sections
                if (data.sections && data.sections.length > 0) {
                    await Section.insertMany(data.sections);
                    console.log(`Seeded ${data.sections.length} sections.`);
                }

                // Seed Payments
                if (data.payments) {
                    const paymentArray = Object.values(data.payments);
                    if (paymentArray.length > 0) {
                        await Payment.insertMany(paymentArray);
                        console.log(`Seeded ${paymentArray.length} payments.`);
                    }
                }

                // Seed Records
                if (data.records && data.records.length > 0) {
                    await Record.insertMany(data.records);
                    console.log(`Seeded ${data.records.length} records.`);
                }

                // Seed Users
                if (data.users && data.users.length > 0) {
                    await User.insertMany(data.users);
                    console.log(`Seeded ${data.users.length} users.`);
                } else {
                    // Ensure admin exists if no users in db.json
                    const adminExists = await User.findOne({ username: 'admin' });
                    if (!adminExists) {
                        // Default admin/admin hash would go here if needed, but for now rely on hardcode fallback or create one
                    }
                }
            }
        }
    } catch (err) {
        console.error('Seeding error:', err);
    }
};

// --- MIDDLEWARE ---

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- API ROUTES ---

// Login
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        let validPassword = false;
        // Check if password looks like a bcrypt hash (starts with $2a$, $2b$, or $2y$)
        if (user.password.match(/^\$2[aby]\$/)) {
            validPassword = await bcrypt.compare(password, user.password);
        } else {
            validPassword = (password === user.password);
        }

        if (!validPassword) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
        res.json({ token, username: user.username, role: user.role });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Init Data
app.get('/api/init', authenticateToken, async (req, res) => {
    try {
        const sections = await Section.find();
        const payments = await Payment.find();
        const records = await Record.find().sort({ date: -1 });

        // Convert payments array back to object map for frontend if it expects that structure
        const paymentMap = {};
        payments.forEach(p => {
            paymentMap[p.key] = p;
        });

        res.json({
            sections,
            payments: paymentMap,
            records
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Sections Update
app.put('/api/sections/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // updateOne with upsert: true seems appropriate, but let's strictly follow the PUT semantics
        // findOneAndUpdate returns the document.
        const updatedSection = await Section.findOneAndUpdate(
            { id: id },
            updateData,
            { new: true, upsert: true } // upsert creates if not exists
        );

        res.json(updatedSection);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Payments - Create/Update
app.post('/api/payments', authenticateToken, async (req, res) => {
    try {
        const paymentData = req.body;
        const { key, isPaid } = paymentData;

        console.log("Processing Payment (Mongo):", paymentData);

        if (isPaid) {
            await Payment.findOneAndUpdate(
                { key: key },
                { ...paymentData, paymentDate: new Date() },
                { upsert: true, new: true }
            );
        } else {
            await Payment.deleteOne({ key: key });
        }

        res.json({ success: true });
    } catch (err) {
        console.error("Payment Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Financial Records
app.post('/api/records', authenticateToken, async (req, res) => {
    try {
        const recordData = req.body;
        if (!recordData.id) recordData.id = Date.now().toString();

        const newRecord = new Record(recordData);
        await newRecord.save();

        res.json(newRecord);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/records/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await Record.deleteOne({ id: id });
        res.json({ success: true, id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Helper for resetting sections (keep strictly for seeding/admin usage if needed)
app.post('/api/sections/reset', authenticateToken, async (req, res) => {
    try {
        // Security check can be added here if needed, or rely on auth token
        const { sections } = req.body;

        // Clear all sections
        await Section.deleteMany({});

        // Insert new ones
        if (sections && sections.length > 0) {
            await Section.insertMany(sections);
        }

        res.json({ success: true, count: sections.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'dist')));

// --- API ROUTES ---

// ... (API definitions remain the same, ensure they are above the catch-all) ...

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT} (MongoDB Mode)`));
}

export default app;


