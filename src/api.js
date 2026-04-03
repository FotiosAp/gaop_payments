import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Keep logic mostly similar to avoid large rewrites,
// we just redirect the actual fetching to Supabase instead of `/api/*`
export const api = {
    // Official Supabase Authentication
    login: async (email, password) => {
        console.log('Attempting login for user:', email);
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            console.error('Supabase Auth Error:', error);
            throw new Error(error.message || 'Λάθος email ή κωδικός');
        }

        // We can store user role in user_metadata in Supabase Dashboard
        // under 'Authentication' > 'Users' > 'User Metadata'
        const role = data.user?.user_metadata?.role || 'manager';

        console.log('Login successful, role:', role);

        return {
            user: data.user,
            session: data.session,
            role: role
        };
    },

    logout: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    getSession: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    },

    onAuthStateChange: (callback) => {
        return supabase.auth.onAuthStateChange(callback);
    },

    // Fetch all data
    init: async () => {
        try {
            // Fetch Settings
            const { data: settingsData, error: setErr } = await supabase.from('settings').select('*');
            if (setErr) throw setErr;

            const settings = {};
            settingsData.forEach(s => {
                settings[s.key] = s.value;
            });

            // Fetch Sections
            const { data: sectionsData, error: secErr } = await supabase.from('sections').select('*');
            if (secErr) throw secErr;

            // Fetch Players (to attach to sections)
            const { data: playersData, error: plErr } = await supabase.from('players').select('*');
            if (plErr) throw plErr;

            // Map players into their sections
            const enrichedSections = sectionsData.map(sec => ({
                id: sec.id,
                title: sec.title,
                players: playersData.filter(p => p.section_id === sec.id).map(p => ({
                    id: p.id,
                    name: p.name,
                    parent: p.parent,
                    phone: p.phone,
                    price: Number(p.price)
                }))
            }));

            // Use Order from Settings if available, otherwise use a fallback
            const sectionOrder = settings.section_order || [
                'junior',
                'u11_boys',
                'u12_boys',
                'u14_boys',
                'u14_girls',
                'paidiko',
                'korasides',
                'efiviko'
            ];

            enrichedSections.sort((a, b) => {
                const indexA = sectionOrder.indexOf(a.id);
                const indexB = sectionOrder.indexOf(b.id);
                // If an id is not in the list, send it to the back
                return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
            });

            // Fetch Payments
            const { data: paymentsData, error: payErr } = await supabase.from('payments').select('*');
            if (payErr) throw payErr;

            // Convert list of payments to object dictionary by key
            const paymentsMap = {};
            paymentsData.forEach(p => {
                paymentsMap[p.key] = {
                    isPaid: p.is_paid,
                    amount: p.amount,
                    athleteName: p.athlete_name,
                    parentName: p.parent_name,
                    department: p.department
                };
            });

            // Fetch Records
            const { data: recordsData, error: recErr } = await supabase.from('records').select('*');
            if (recErr) throw recErr;

            // Return shape matching what the App.jsx expects
            return {
                sections: enrichedSections,
                payments: paymentsMap,
                records: recordsData,
                settings: settings
            };
        } catch (e) {
            console.error("Supabase Init Error:", e);
            throw e;
        }
    },

    // Sections (handles adding/updating/deleting players since App.jsx sends the whole section object)
    updateSection: async (section) => {
        try {
            // Getting existing players for this section to see what to delete
            const { data: existingPlayers } = await supabase.from('players').select('id').eq('section_id', section.id);
            const existingIds = existingPlayers?.map(p => p.id) || [];

            const incomingIds = section.players.map(p => p.id);
            const idsToDelete = existingIds.filter(id => !incomingIds.includes(id));

            // Execute deletes
            if (idsToDelete.length > 0) {
                await supabase.from('players').delete().in('id', idsToDelete);
            }

            // Execute upserts (inserts/updates)
            const upsertPayload = section.players.map(p => ({
                id: p.id,
                section_id: section.id,
                name: p.name,
                parent: p.parentName || p.parent,
                phone: p.phone || null,
                price: Number(p.price || 50)
            }));

            if (upsertPayload.length > 0) {
                const { error: upsertErr } = await supabase.from('players').upsert(upsertPayload);
                if (upsertErr) throw upsertErr;
            }

            return section;
        } catch (e) {
            console.error("Supabase Update Section Error:", e);
            throw e;
        }
    },

    // Payments
    setPayment: async (paymentData) => {
        try {
            if (paymentData.isPaid) {
                const { error } = await supabase.from('payments').upsert({
                    key: paymentData.key,
                    is_paid: paymentData.isPaid,
                    athlete_name: paymentData.athleteName || 'Unknown',
                    parent_name: paymentData.parentName || 'Unknown',
                    department: paymentData.department || 'Unknown',
                    amount: Number(paymentData.amount || 0),
                    payment_date: new Date().toISOString()
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.from('payments').delete().eq('key', paymentData.key);
                if (error) throw error;
            }
            return { success: true };
        } catch (e) {
            console.error("Supabase Payment Error:", e);
            throw e;
        }
    },

    // Add Record
    addRecord: async (record) => {
        try {
            const newId = Date.now().toString(); // Use timestamp as ID string
            const payload = {
                id: newId,
                type: record.type,
                category: record.category || 'admin',
                amount: Number(record.amount || 0),
                reason: record.reason || record.category || 'Άλλο',
                date: record.date || new Date().toISOString()
            };

            const { error } = await supabase.from('records').insert([payload]);
            if (error) throw error;

            // App.jsx expects the ID included
            return { ...record, id: newId };
        } catch (e) {
            console.error("Supabase Add Record Error:", e);
            throw e;
        }
    },

    // Delete Record
    deleteRecord: async (id) => {
        try {
            const { error } = await supabase.from('records').delete().eq('id', String(id));
            if (error) throw error;
            return { success: true };
        } catch (e) {
            console.error("Supabase Delete Record Error:", e);
            throw e;
        }
    }
};
