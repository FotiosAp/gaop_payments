import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = 'https://scafyrzberachdaebplv.supabase.co';
const supabaseKey = 'sb_publishable_4o1wssibUe_GuTwSK1o2Rw_uBoqd7bk'; // from .env
const supabase = createClient(supabaseUrl, supabaseKey);

const playersToAdd = [
    { name: 'Τομάζος Α', price: 35 },
    { name: 'Φλυτζάνης', price: 35 },
    { name: 'Μπαραά', price: 35 },
    { name: 'Μαριόλης', price: 30 },
    { name: 'Πέππας Α', price: 30 },
    { name: 'Λεωτσάκος Β', price: 35 },
    { name: 'Χαμζάς Γ', price: 35 },
    { name: 'Παππάς', price: 30 },
    { name: 'Πολυζωγόπουλος', price: 35 },
    { name: 'Μπεσλεμής', price: 35 },
    { name: 'Μαρούσης', price: 30 },
    { name: 'Κώστας', price: 35 }
];

async function addPlayers() {
    try {
        const payload = playersToAdd.map(p => ({
            id: crypto.randomUUID(), // Assuming UUID or string ID. SectionDetail probably does Date.now().toString(). Let's use crypto.randomUUID().
            section_id: 'u11_boys',
            name: p.name,
            parent: '',
            phone: '',
            price: p.price
        }));

        const { data, error } = await supabase.from('players').insert(payload);

        if (error) {
            console.error('Error adding players:', error);
            return;
        }

        console.log('Successfully added players!');
    } catch (err) {
        console.error('Exception:', err);
    }
}

addPlayers();
