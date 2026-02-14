
import { initialSections } from './src/data/initialData.js';

async function seed() {
    console.log("Seeding data...");
    try {
        const res = await fetch('http://localhost:5000/api/sections/reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-seed-secret': 'gaop-secure-seed-2026'
            },
            body: JSON.stringify({ sections: initialSections })
        });
        const data = await res.json();
        console.log("Seed result:", data);
    } catch (e) {
        console.error("Seed error:", e);
    }
}

seed();
