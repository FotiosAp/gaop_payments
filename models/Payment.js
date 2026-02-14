import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true }, // e.g., '2026_0_j2'
    isPaid: { type: Boolean, required: true },
    athleteName: String,
    parentName: String,
    department: String,
    amount: Number,
    paymentDate: Date
});

export const Payment = mongoose.model('Payment', paymentSchema);
