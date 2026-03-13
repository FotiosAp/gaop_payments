import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_local_dev_only';
const DB_FILE = path.join(__dirname, 'db.json');

// --- DATABASE HELPER FUNCTIONS ---

const readDB = async () => {
    try {
        const data = await fs.readFile(DB_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading database file:', err);
        return { sections: [], payments: {}, records: [], users: [] };
    }
};

const writeDB = async (data) => {
    try {
        await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
        console.error('Error writing to database file:', err);
    }
};

// Deprecated seed function for mongo, keeping simplified check to init file if needed.
const initLocalDB = async () => {
    try {
        await fs.access(DB_FILE);
    } catch {
        console.log("No db.json found, creating empty structure.");
        await writeDB({ sections: [], payments: {}, records: [], users: [] });
    }
};
initLocalDB();

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
        const db = await readDB();
        const user = db.users.find(u => u.username === username);

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
        const db = await readDB();

        res.json({
            sections: db.sections || [],
            payments: db.payments || {},
            records: db.records || []
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
        const db = await readDB();

        if (!db.sections) db.sections = [];

        const index = db.sections.findIndex(s => s.id === id);
        if (index !== -1) {
            db.sections[index] = { ...db.sections[index], ...updateData };
        } else {
            db.sections.push({ ...updateData, id });
        }

        await writeDB(db);

        // Find is just for returning
        const updatedSection = db.sections.find(s => s.id === id);
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

        console.log("Processing Payment (Local):", paymentData);

        const db = await readDB();
        if (!db.payments) db.payments = {};

        if (isPaid) {
            db.payments[key] = { ...paymentData, paymentDate: new Date() };
        } else {
            delete db.payments[key];
        }

        await writeDB(db);

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

        const db = await readDB();
        if (!db.records) db.records = [];

        db.records.push(recordData);
        await writeDB(db);

        res.json(recordData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/records/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const db = await readDB();

        if (db.records) {
            db.records = db.records.filter(r => r.id !== id || r.id !== Number(id));
            await writeDB(db);
        }

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

        const db = await readDB();
        db.sections = sections || [];
        await writeDB(db);

        res.json({ success: true, count: sections ? sections.length : 0 });
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
    app.listen(PORT, () => console.log(`Server running on port ${PORT} (Local FS Mode)`));
}

export default app;


