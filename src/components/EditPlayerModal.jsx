import React, { useState, useEffect } from 'react';

const EditPlayerModal = ({ player, onClose, onSave }) => {
    const [name, setName] = useState(player.name || '');
    const [parent, setParent] = useState(player.parent || '');
    const [phone, setPhone] = useState(player.phone || '');
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (name && parent) {
            onSave({
                name,
                parent,
                phone
            });
            setShowSuccess(true);
        } else {
            setError('Παρακαλώ συμπληρώστε τα υποχρεωτικά πεδία');
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '12px',
        fontSize: '1rem',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        marginTop: '6px',
        outline: 'none',
        color: '#1E293B',
        backgroundColor: '#F8FAFC'
    };

    const labelStyle = {
        fontWeight: '600',
        fontSize: '0.85rem',
        color: '#64748B',
        display: 'block',
        textAlign: 'left',
        marginTop: '16px'
    };

    if (showSuccess) {
        return (
            <div className="modal-overlay" onClick={onClose} style={{ alignItems: 'center' }}>
                <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '32px', maxWidth: '300px', borderRadius: '16px', textAlign: 'center', animation: 'slideUp 0.3s' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>✅</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10B981', marginBottom: '8px' }}>
                        Επιτυχία
                    </div>
                    <div style={{ color: '#64748B', fontSize: '1rem', fontWeight: '500', marginBottom: '28px' }}>
                        Οι αλλαγές αποθηκεύτηκαν επιτυχώς.
                    </div>
                    <button 
                         type="button"
                         onClick={onClose}
                         style={{
                             background: '#10B981', color: 'white', padding: '14px', borderRadius: '10px', border: 'none', fontWeight: '700', cursor: 'pointer', width: '100%', fontSize: '1rem'
                         }}>
                         ΟΚ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose} style={{ alignItems: 'flex-start', paddingTop: '40px', paddingBottom: '40px' }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '24px', maxWidth: '400px', borderRadius: '16px', marginBottom: '20px' }}>
                <div className="modal-title" style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1E293B', fontWeight: '800' }}>Επεξεργασία Στοιχείων</div>
                <div style={{ marginBottom: '24px', fontSize: '0.9rem', color: '#64748B' }}>
                    Ενημερώστε τα στοιχεία για τον/την <strong>{player.name}</strong>.
                </div>

                <form onSubmit={handleSubmit}>
                    <div>
                        <label style={{ ...labelStyle, marginTop: 0 }}>Ονοματεπώνυμο Αθλητή</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Ονοματεπώνυμο Γονέα</label>
                        <input
                            type="text"
                            value={parent}
                            onChange={(e) => setParent(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Τηλέφωνο Επικοινωνίας</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    {error && <div style={{ color: '#EF4444', marginTop: '12px', fontSize: '0.9rem', fontWeight: '600', textAlign: 'center' }}>{error}</div>}

                    <div className="modal-buttons" style={{ marginTop: '32px', gap: '12px' }}>
                        <button
                            type="button"
                            className="btn btn-cancel"
                            onClick={onClose}
                            style={{ flex: 1, padding: '14px', borderRadius: '10px', fontWeight: '700' }}
                        >
                            Ακύρωση
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{
                                flex: 1,
                                background: '#1E293B',
                                color: 'white',
                                padding: '14px',
                                borderRadius: '10px',
                                fontWeight: '700',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            Αποθήκευση
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPlayerModal;
