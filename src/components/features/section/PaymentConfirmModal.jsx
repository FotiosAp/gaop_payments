import React from 'react';
import styles from '../../common/Modal.module.css';

const PaymentConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    playerName, 
    monthName, 
    price, 
    pin, 
    setPin, 
    error 
}) => {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.content} onClick={e => e.stopPropagation()}>
                <div className={styles.title}>Επιβεβαίωση Πληρωμής ({monthName})</div>
                <div className={styles.body}>
                    Είστε σίγουροι ότι θέλετε να επιβεβαιώσετε την πληρωμή για τον/την <strong>{playerName}</strong>;
                    <div style={{ marginTop: '8px', fontSize: '1rem', color: '#1E293B' }}>Ποσό: <strong>{price}€</strong></div>

                    <div style={{ marginTop: '20px' }}>
                        <input
                            type="password"
                            inputMode="numeric"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            placeholder="Κωδικός Ασφαλείας"
                            autoFocus
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
                    <button className="btn btn-confirm" onClick={onConfirm}>Πληρωμή</button>
                </div>
            </div>
        </div>
    );
};

export default PaymentConfirmModal;
