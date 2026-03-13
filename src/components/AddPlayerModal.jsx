import React, { useState } from 'react';

const AddPlayerModal = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [parent, setParent] = useState('');
    const [phone, setPhone] = useState('');
    const [price, setPrice] = useState('50'); // Default 50
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate PIN
        if (pin !== '2003') {
            setError('Λάθος κωδικός ασφαλείας');
            return;
        }

        if (name && parent && price) {
            onSave({
                name,
                parent,
                phone,
                price: Number(price)
            });
            onClose();
        } else {
            setError('Παρακαλώ συμπληρώστε όλα τα πεδία');
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '8px 12px', // Reduced padding
        fontSize: '0.95rem', // Slightly smaller font
        border: '1px solid #E2E8F0',
        borderRadius: '6px', // Tighter radius
        marginTop: '2px', // Closer to label
        transition: 'border-color 0.2s',
        outline: 'none',
        color: '#1E293B',
        backgroundColor: '#F8FAFC'
    };

    const labelStyle = {
        fontWeight: '600',
        fontSize: '0.8rem', // Smaller label
        color: '#64748B',
        display: 'block',
        textAlign: 'left',
        marginTop: '10px', // Reduced spacing
        marginBottom: '0px'
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{ alignItems: 'flex-start', paddingTop: '40px', paddingBottom: '40px' }}>
            {/* Align to top with some padding so it's not centered vertically if screen is small */}
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '24px', maxWidth: '360px', borderRadius: '12px', marginBottom: '20px' }}>
                <div className="modal-title" style={{ fontSize: '1.25rem', marginBottom: '16px', color: '#1E293B' }}>Προσθήκη Αθλητή</div>

                <form onSubmit={handleSubmit}>
                    <div>
                        <label style={{ ...labelStyle, marginTop: 0 }}>Ονοματεπώνυμο Παιδιού</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="π.χ. Γιώργος Παπαδόπουλος"
                            required
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = '#3B82F6'}
                            onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Ονοματεπώνυμο Γονέα</label>
                        <input
                            type="text"
                            value={parent}
                            onChange={(e) => setParent(e.target.value)}
                            placeholder="π.χ. Νίκος Παπαδόπουλος"
                            required
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = '#3B82F6'}
                            onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Τηλέφωνο Γονέα</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="π.χ. 6912345678"
                                style={{ ...inputStyle, paddingLeft: '32px' }}
                                onFocus={e => e.target.style.borderColor = '#3B82F6'}
                                onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                            />
                            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-40%)', fontSize: '1rem', opacity: 0.7 }}>📞</span>
                        </div>
                    </div>

                    <div style={{ marginTop: '10px' }}>
                        <label style={labelStyle}>Ποσό Συνδρομής (€)</label>
                        <input
                            type="number"
                            inputMode="numeric"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="50"
                            required
                            style={{ ...inputStyle, fontWeight: '700', color: '#0F172A', fontSize: '1rem', width: '50%', textAlign: 'center' }}
                            onFocus={e => e.target.style.borderColor = '#3B82F6'}
                            onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                        />
                    </div>

                    <div style={{ marginTop: '16px', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                        <label style={{ ...labelStyle, color: '#DC2626', marginTop: 0, textAlign: 'center' }}>PIN Ασφαλείας</label>
                        <input
                            type="password"
                            inputMode="numeric"
                            value={pin}
                            onChange={(e) => { setPin(e.target.value); setError(''); }}
                            placeholder="••••"
                            autoComplete="new-password"
                            pattern="[0-9]*"
                            style={{
                                ...inputStyle,
                                textAlign: 'center',
                                letterSpacing: '4px',
                                fontSize: '1.25rem',
                                fontWeight: 'bold',
                                marginTop: '4px'
                            }}
                            onFocus={e => e.target.style.borderColor = '#DC2626'}
                            onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                        />
                    </div>

                    {error && <div style={{ color: '#EF4444', marginTop: '8px', fontSize: '0.8rem', fontWeight: '500' }}>{error}</div>}

                    <div className="modal-buttons" style={{ marginTop: '20px', gap: '8px' }}>
                        <button
                            type="button"
                            className="btn btn-cancel"
                            onClick={onClose}
                            style={{ padding: '10px 20px', borderRadius: '6px', fontWeight: '600', fontSize: '0.9rem' }}
                        >
                            Ακύρωση
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{
                                background: '#1E293B',
                                color: 'white',
                                padding: '10px 24px',
                                borderRadius: '6px',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                        >
                            Προσθήκη
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPlayerModal;
