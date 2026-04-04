import React, { useState } from 'react';
import styles from '../../common/Modal.module.css';

const AddPlayerModal = ({ onClose, onSave, settings }) => {
    const [name, setName] = useState('');
    const [parent, setParent] = useState('');
    const [phone, setPhone] = useState('');
    const [price, setPrice] = useState(String(settings?.default_price || '50'));
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name && parent && price) {
            onSave({ name, parent, phone, price: Number(price) });
            onClose();
        } else {
            setError('Παρακαλώ συμπληρώστε όλα τα πεδία');
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '8px 12px',
        fontSize: '0.95rem',
        border: '1px solid #E2E8F0',
        borderRadius: '6px',
        marginTop: '2px',
        outline: 'none',
        color: '#1E293B',
        backgroundColor: '#F8FAFC'
    };

    const labelStyle = {
        fontWeight: '600',
        fontSize: '0.8rem',
        color: '#64748B',
        display: 'block',
        textAlign: 'left',
        marginTop: '10px'
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.content} onClick={e => e.stopPropagation()} style={{ maxWidth: '360px' }}>
                <div className={styles.title}>Προσθήκη Αθλητή</div>

                <form onSubmit={handleSubmit}>
                    <div>
                        <label style={{ ...labelStyle, marginTop: 0 }}>Ονοματεπώνυμο Παιδιού</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="π.χ. Γιώργος Παπαδόπουλος" required style={inputStyle} />
                    </div>

                    <div>
                        <label style={labelStyle}>Ονοματεπώνυμο Γονέα</label>
                        <input type="text" value={parent} onChange={(e) => setParent(e.target.value)} placeholder="π.χ. Νίκος Παπαδόπουλος" required style={inputStyle} />
                    </div>

                    <div>
                        <label style={labelStyle}>Τηλέφωνο Γονέα</label>
                        <div style={{ position: 'relative' }}>
                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="π.χ. 6912345678" style={{ ...inputStyle, paddingLeft: '32px' }} />
                            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-40%)', fontSize: '1rem', opacity: 0.7 }}>📞</span>
                        </div>
                    </div>

                    <div style={{ marginTop: '10px' }}>
                        <label style={labelStyle}>Ποσό Συνδρομής (€)</label>
                        <input type="number" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} required style={{ ...inputStyle, fontWeight: '700', width: '50%', textAlign: 'center' }} />
                    </div>

                    {error && <div style={{ color: '#EF4444', marginTop: '8px', fontSize: '0.8rem' }}>{error}</div>}

                    <div className={styles.buttons} style={{ marginTop: '20px' }}>
                        <button type="button" className="btn btn-cancel" onClick={onClose}>Ακύρωση</button>
                        <button type="submit" className="btn btn-primary" style={{ background: '#1E293B', color: 'white' }}>Προσθήκη</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPlayerModal;
