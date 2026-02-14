import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'manager'], default: 'manager' }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

const swapRoles = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Set Gaop to 'admin' (Full Access)
        const gaopKeyUser = await User.findOne({ username: 'Gaop' });
        if (gaopKeyUser) {
            gaopKeyUser.role = 'admin';
            await gaopKeyUser.save();
            console.log('User "Gaop" is now ADMIN (Full Access).');
        } else {
            console.log('User "Gaop" not found.');
        }

        // 2. Set GaopAdmin2021! to 'manager' (Restricted Access)
        const secondaryUser = await User.findOne({ username: 'GaopAdmin2021!' });
        if (secondaryUser) {
            secondaryUser.role = 'manager';
            await secondaryUser.save();
            console.log('User "GaopAdmin2021!" is now MANAGER (Restricted Access).');
        } else {
            console.log('User "GaopAdmin2021!" not found.');
        }

        await mongoose.disconnect();
        console.log('Disconnected.');
    } catch (error) {
        console.error('Error:', error);
        await mongoose.disconnect();
    }
};

swapRoles();
