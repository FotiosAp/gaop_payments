import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';

dotenv.config();

const checkUsers = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("MONGO_URI is missing in .env");
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log('--- Users in Database ---');
        users.forEach(u => {
            console.log(`Username: ${u.username}, Role: ${u.role}, Password (hash/plain): ${u.password.substring(0, 10)}...`);
        });
        console.log('-------------------------');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        await mongoose.disconnect();
    }
};

checkUsers();
