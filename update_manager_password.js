import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from './models/User.js';

dotenv.config();

const updateManagerPassword = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("MONGO_URI is missing in .env");
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const username = 'GaopAdmin2021!';
        const newPassword = 'Arianos1914!';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const user = await User.findOne({ username });
        if (user) {
            user.password = hashedPassword;
            user.role = 'manager'; // Ensure role is manager
            await user.save();
            console.log(`Password updated for user: ${username}`);
            console.log(`Role ensured as: ${user.role}`);
        } else {
            console.log(`User ${username} not found. Creating it...`);
            const newUser = new User({
                username,
                password: hashedPassword,
                role: 'manager'
            });
            await newUser.save();
            console.log(`Created new manager user: ${username}`);
        }

        await mongoose.disconnect();
        console.log('Disconnected');
    } catch (error) {
        console.error('Error:', error);
        await mongoose.disconnect();
    }
};

updateManagerPassword();
