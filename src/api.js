
const API_BASE = '/api';

const getHeaders = () => {
    const token = localStorage.getItem('gaop_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

export const api = {
    // Login
    login: async (username, password) => {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) throw new Error('Invalid credentials');
        return await res.json();
    },

    // Init: Fetch all data + Merge with LocalStorage
    init: async () => {
        try {
            const res = await fetch(`${API_BASE}/init`, {
                headers: getHeaders()
            });

            if (res.status === 401) {
                console.warn("Unauthorized (401). Clearing token and redirecting to login.");
                localStorage.removeItem('gaop_token');
                localStorage.removeItem('gaop_username');
                window.location.href = '/login';
                return { sections: [], payments: {}, records: [] };
            }

            let serverData = { sections: [], payments: {}, records: [] };

            if (res.ok) {
                serverData = await res.json();
            } else {
                console.warn("Server Init Failed, using Local Storage fallback.");
            }

            // --- LOCAL STORAGE MERGE STRATEGY ---
            // We read local payments to ensure what the user just did isn't lost.
            const localPayments = JSON.parse(localStorage.getItem('gaop_payments_backup') || '{}');

            // Merge: Local takes precedence if server is empty? 
            // Or Union? Let's do Union.
            const mergedPayments = { ...serverData.payments, ...localPayments };

            return {
                ...serverData,
                payments: mergedPayments
            };

        } catch (e) {
            console.error("Init Error, falling back to local:", e);
            // Fallback Only
            return {
                sections: [], // Note: If sections fail, we might need initialData, but sections usually load fine.
                payments: JSON.parse(localStorage.getItem('gaop_payments_backup') || '{}'),
                records: []
            };
        }
    },

    // Sections
    updateSection: async (section) => {
        const res = await fetch(`${API_BASE}/sections/${section.id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(section)
        });
        if (!res.ok) throw new Error('Failed to update section');
        return await res.json();
    },

    // Payments: Save to Server AND LocalStorage
    setPayment: async (paymentData) => {
        // 1. Save Locally Logic
        try {
            const localStore = JSON.parse(localStorage.getItem('gaop_payments_backup') || '{}');
            if (paymentData.isPaid) {
                localStore[paymentData.key] = true;
            } else {
                delete localStore[paymentData.key];
            }
            localStorage.setItem('gaop_payments_backup', JSON.stringify(localStore));
        } catch (e) {
            console.error("Local Save Error", e);
        }

        // 2. Save to Server
        const res = await fetch(`${API_BASE}/payments`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(paymentData)
        });
        if (!res.ok) throw new Error('Failed to update payment');
        return await res.json();
    },

    // Financial Records: Add
    addRecord: async (record) => {
        const res = await fetch(`${API_BASE}/records`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(record)
        });
        if (!res.ok) throw new Error('Failed to add record');
        return await res.json();
    },

    // Financial Records: Delete
    deleteRecord: async (id) => {
        const res = await fetch(`${API_BASE}/records/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete record');
        return await res.json();
    }
};
