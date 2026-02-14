import mongoose from 'mongoose';
import { Section } from './models/Section.js';
import { Payment } from './models/Payment.js';

import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function verifyFlow() {
    try {
        console.log("1. Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("   Connected!");

        // --- TEST 1: Add Player ---
        console.log("\n2. Testing Add Player...");
        // Find first section
        const section = await Section.findOne();
        if (!section) throw new Error("No sections found to test with!");

        const testPlayerId = "TEST_PLAYER_" + Date.now();
        const testPlayer = {
            id: testPlayerId,
            name: "Test Player For Verification",
            parent: "Test Parent",
            phone: "6900000000",
            price: 50
        };

        section.players.push(testPlayer);
        await section.save();
        console.log(`   Player added to section '${section.name}'.`);

        // Verify in DB
        const updatedSection = await Section.findOne({ "players.id": testPlayerId });
        if (updatedSection) {
            console.log("   VERIFIED: Player found in DB.");
        } else {
            throw new Error("   FAILED: Player not found after save!");
        }

        // --- TEST 2: Add Payment ---
        console.log("\n3. Testing Add Payment...");
        const testPaymentKey = testPlayerId + "_Oct";
        await Payment.findOneAndUpdate(
            { key: testPaymentKey },
            { key: testPaymentKey, isPaid: true, amount: 50, date: new Date() },
            { upsert: true, new: true }
        );
        console.log("   Payment saved.");

        // Verify Payment
        const savedPayment = await Payment.findOne({ key: testPaymentKey });
        if (savedPayment) {
            console.log("   VERIFIED: Payment found in DB.");
        } else {
            throw new Error("   FAILED: Payment not found!");
        }

        // --- TEST 3: Cleanup (Delete) ---
        console.log("\n4. Cleaning up (Delete Test Data)...");

        // Remove Payment
        await Payment.deleteOne({ key: testPaymentKey });
        console.log("   Payment deleted.");

        // Remove Player
        await Section.findOneAndUpdate(
            { id: section.id },
            { $pull: { players: { id: testPlayerId } } }
        );
        console.log("   Player deleted.");

        console.log("\n✅ ALL API FLOWS VERIFIED SUCCESSFULLY!");
        process.exit(0);

    } catch (err) {
        console.error("\n❌ VERIFICATION FAILED:", err);
        process.exit(1);
    }
}

verifyFlow();
