import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const data = await api.login(username, password);
            localStorage.setItem('gaop_token', data.token);
            localStorage.setItem('gaop_username', data.username);
            localStorage.setItem('gaop_role', data.role || 'manager'); // Default to manager if undefined
            window.location.href = '/'; // Full reload to reset app state/api headers
        } catch (err) {
            setError('Λάθος όνομα χρήστη ή κωδικός');
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            fontFamily: '"Segoe UI", sans-serif'
        }}>
            <form className="card-glass" onSubmit={handleLogin} style={{
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '40px 24px',
                borderRadius: '24px',
                width: '90%',
                maxWidth: '420px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                {/* Logo Section */}
                <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                    <img
                        src="/logo.png"
                        alt="GAOP Logo"
                        style={{
                            width: '100px',
                            height: 'auto',
                            marginBottom: '16px',
                            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
                        }}
                    />
                    <h2 style={{
                        margin: 0,
                        color: '#1E293B',
                        fontSize: '1.75rem',
                        fontWeight: '800',
                        letterSpacing: '-0.025em',
                        textTransform: 'uppercase'
                    }}>
                        ΓΑΟΠ BASKETBALL
                    </h2>
                    <p style={{ marginTop: '8px', color: '#64748B', fontSize: '0.95rem' }}>
                        Διαχείριση Εσόδων Εξόδων
                    </p>
                </div>

                {error && (
                    <div style={{
                        width: '100%',
                        background: '#FEF2F2',
                        color: '#B91C1C',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        fontSize: '0.9rem',
                        textAlign: 'center',
                        border: '1px solid #FECACA'
                    }}>
                        {error}
                    </div>
                )}

                <div style={{ width: '100%', marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.9rem', fontWeight: '600' }}>Όνομα Χρήστη</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Εισάγετε όνομα χρήστη"
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '12px',
                            border: '2px solid #E2E8F0',
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            background: '#F8FAFC'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                        required
                    />
                </div>

                <div style={{ width: '100%', marginBottom: '32px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.9rem', fontWeight: '600' }}>Κωδικός</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Εισάγετε κωδικό"
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '12px',
                            border: '2px solid #E2E8F0',
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            background: '#F8FAFC'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                        required
                    />
                </div>

                <button type="submit" style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#2563EB',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
                    transition: 'transform 0.1s active'
                }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    Είσοδος
                </button>
            </form>
        </div>
    );
};

export default LoginPage;
