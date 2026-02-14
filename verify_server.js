
const testCheck = async () => {
    try {
        console.log("Testing Login...");
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin' })
        });

        if (!loginRes.ok) {
            console.error("Login Failed:", loginRes.status, await loginRes.text());
            return;
        }

        const loginData = await loginRes.json();
        console.log("Login Success, Token received.");
        const token = loginData.token;

        console.log("Testing Init...");
        const initRes = await fetch('http://localhost:5000/api/init', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!initRes.ok) {
            console.error("Init Failed:", initRes.status);
            return;
        }

        const initData = await initRes.json();
        console.log("Init Success. Sections count:", initData.sections.length);
        console.log("Verification Passed.");

    } catch (e) {
        console.error("Test Error:", e);
    }
};

testCheck();
