
async function testLogin() {
    try {
        const username = 'Karakostas';
        const password = 'password123';

        console.log(`Testing login for user: ${username} with password: ${password} on http://localhost:5000/api/auth/login`);

        const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (res.ok) {
            const data = await res.json();
            console.log('Login SUCCESS!');
            console.log('Token received:', data.token ? 'Yes' : 'No');
            console.log('Username:', data.username);
        } else {
            const text = await res.text();
            console.error('Login FAILED.');
            console.error('Status:', res.status);
            console.error('Response:', text);
        }

    } catch (err) {
        console.error('Network Error (Is server running?):', err.message);
    }
}

testLogin();
