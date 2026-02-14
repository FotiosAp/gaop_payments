import mongoose from 'mongoose';
import { User } from './models/User.js';

import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function listUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB.');

        const users = await User.find({});
        console.log('Found users:', users.length);

        users.forEach(u => {
            console.log(`- Username: ${u.username}, Password (hash start): ${u.password.substring(0, 10)}...`);
        });

        process.exit(0);
    } catch (err) {
        console.error('List failed:', err);
        process.exit(1);
    }
}

listUsers();
