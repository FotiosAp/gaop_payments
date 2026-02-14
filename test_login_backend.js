
async function testLogin() {
    const creds = {
        username: "GaopAdmin2022!",
        password: "Karakostas1914!"
    };

    console.log("Testing login with:", creds);

    try {
        const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(creds)
        });

        if (res.ok) {
            const data = await res.json();
            console.log("LOGIN SUCCESS! Token:", data.token.substring(0, 20) + "...");
        } else {
            console.log("LOGIN FAILED. Status:", res.status);
            const err = await res.text();
            console.log("Error:", err);
        }
    } catch (e) {
        console.error("Request Failed:", e.message);
    }
}

testLogin();
