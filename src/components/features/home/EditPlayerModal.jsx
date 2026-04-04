import React, { useState } from 'react';
import styles from '../../common/Modal.module.css';

const EditPlayerModal = ({ player, onClose, onSave }) => {
    const [name, setName] = useState(player.name || '');
    const [parent, setParent] = useState(player.parent || '');
    const [phone, setPhone] = useState(player.phone || '');
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name && parent) {
            onSave({ name, parent, phone });
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
            <div className={styles.overlay} onClick={onClose} style={{ alignItems: 'center' }}>
                <div className={styles.content} style={{ maxWidth: '300px' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>✅</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10B981', marginBottom: '8px' }}>
                        Επιτυχία
                    </div>
                    <div className={styles.body}>
                        Οι αλλαγές αποθηκεύτηκαν επιτυχώς.
                    </div>
                    <button type="button" onClick={onClose} className="btn btn-confirm" style={{ background: '#10B981', width: '100%' }}>ΟΚ</button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.content} onClick={e => e.stopPropagation()}>
                <div className={styles.title}>Επεξεργασία Στοιχείων</div>
                <div className={styles.body}>
                    Ενημερώστε τα στοιχεία για τον/την <strong>{player.name}</strong>.
                </div>

                <form onSubmit={handleSubmit}>
                    <div>
                        <label style={{ ...labelStyle, marginTop: 0 }}>Ονοματεπώνυμο Αθλητή</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
                    </div>

                    <div>
                        <label style={labelStyle}>Ονοματεπώνυμο Γονέα</label>
                        <input type="text" value={parent} onChange={(e) => setParent(e.target.value)} required style={inputStyle} />
                    </div>

                    <div>
                        <label style={labelStyle}>Τηλέφωνο Επικοινωνίας</label>
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
                    </div>

                    {error && <div style={{ color: '#EF4444', marginTop: '12px', fontSize: '0.9rem', fontWeight: '600' }}>{error}</div>}

                    <div className={styles.buttons} style={{ marginTop: '32px' }}>
                        <button type="button" className="btn btn-cancel" onClick={onClose}>Ακύρωση</button>
                        <button type="submit" className="btn btn-primary" style={{ background: '#1E293B' }}>Αποθήκευση</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPlayerModal;
