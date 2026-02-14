import mongoose from 'mongoose';
import { Section } from './models/Section.js';

import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function verify() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Successfully connected to MongoDB.');

        // Create a dummy section to verify write
        const testSection = new Section({
            id: 'test_conn_' + Date.now(),
            title: 'Test Connection',
            players: []
        });

        await testSection.save();
        console.log('Successfully wrote to MongoDB.');

        // Clean up
        await Section.deleteOne({ id: testSection.id });
        console.log('Successfully cleaned up.');

        process.exit(0);
    } catch (err) {
        console.error('Verification failed:', err);
        process.exit(1);
    }
}

verify();
