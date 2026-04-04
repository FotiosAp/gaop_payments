import React from 'react';
import styles from '../../common/Modal.module.css';

const EditPriceModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    playerName, 
    newPrice, 
    setNewPrice, 
    pin, 
    setPin, 
    error 
}) => {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.content} onClick={e => e.stopPropagation()}>
                <div className={styles.title}>Αλλαγή Συνδρομής</div>
                <div className={styles.body}>
                    Ορίστε νέο ποσό συνδρομής για τον/την <strong>{playerName}</strong>.

                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <label style={{ fontSize: '0.9rem', color: '#555', textAlign: 'left' }}>Νέα Συνδρομή (€):</label>
                        <input
                            type="number"
                            inputMode="numeric"
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                            placeholder="Ποσό (π.χ. 30)"
                            style={{
                                padding: '12px',
                                fontSize: '1.2rem',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                width: '100%',
                                textAlign: 'center'
                            }}
                        />

                        <label style={{ fontSize: '0.9rem', color: '#555', marginTop: '8px', textAlign: 'left' }}>Κωδικός Ασφαλείας:</label>
                        <input
                            type="password"
                            inputMode="numeric"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            placeholder="PIN"
                            pattern="[0-9]*"
                            style={{
                                padding: '12px',
                                fontSize: '1.2rem',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                width: '100%',
                                textAlign: 'center'
                            }}
                        />

                        {error && <div style={{ color: '#EF4444', marginTop: '8px', fontSize: '0.9rem' }}>{error}</div>}
                    </div>
                </div>
                <div className={styles.buttons}>
                    <button className="btn btn-cancel" onClick={onClose}>Ακύρωση</button>
                    <button className="btn btn-confirm" onClick={onConfirm} style={{ background: '#1E293B', color: 'white' }}>Αποθήκευση</button>
                </div>
            </div>
        </div>
    );
};

export default EditPriceModal;
