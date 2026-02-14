
import React from 'react';
import { LogOut, User } from 'lucide-react';

const Header = () => {
    const username = localStorage.getItem('gaop_username') || 'Admin';

    const handleLogout = () => {
        localStorage.removeItem('gaop_token');
        localStorage.removeItem('gaop_username');
        window.location.href = '/login';
    };

    return (
        <div className="card-glass header-container" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            borderRadius: '16px',
            marginBottom: '24px',
            gap: '12px'
        }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1E293B', fontWeight: 'bold' }}>
                    Γ.Α.Ο.Π / Εσοδα-Εξοδα
                </h2>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#64748B',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    marginTop: '4px'
                }}>
                    <User size={14} />
                    <span>{username}</span>
                </div>
            </div>

            <button
                onClick={handleLogout}
                title="Αποσύνδεση"
                style={{
                    background: '#FEF2F2',
                    color: '#EF4444',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    marginLeft: 'auto' /* Force right alignment */
                }}
            >
                <LogOut size={16} />
                <span className="logout-text">Έξοδος</span>
            </button>

            <style>{`
                @media (max-width: 480px) {
                    .logout-text {
                        display: none;
                    }
                    .header-container {
                        padding: 12px 12px !important; /* Reduced padding to push closer to edge */
                        margin-bottom: 16px !important;
                    }
                    h2 {
                        font-size: 1.1rem !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Header;
