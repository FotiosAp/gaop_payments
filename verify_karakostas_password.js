
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function checkPassword() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB.');

        const user = await User.findOne({ username: 'Karakostas' });
        if (!user) {
            console.log('User Karakostas not found.');
            process.exit(0);
        }

        console.log('User found. Verifying password "password123"...');
        const isMatch = await bcrypt.compare('password123', user.password);

        if (isMatch) {
            console.log('SUCCESS: Password is "password123"');
        } else {
            console.log('FAILURE: Password is NOT "password123"');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkPassword();
