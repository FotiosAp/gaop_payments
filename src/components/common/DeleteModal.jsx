import React from 'react';
import styles from './Modal.module.css';

const DeleteModal = ({ isOpen, onClose, onConfirm, itemName, title = "Διαγραφή", message = "", error = "", pin, setPin }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.content} onClick={e => e.stopPropagation()}>
                <h3 className={styles.title} style={{ color: '#D32F2F' }}>{title}</h3>
                <div className={styles.body}>
                    {message || (
                        <>
                            Είστε σίγουροι ότι θέλετε να διαγράψετε τον/την <strong>{itemName}</strong>;
                            <br />
                            <span style={{ fontSize: '0.9rem', color: '#666' }}>Η ενέργεια αυτή είναι μη αναστρέψιμη και θα διαγραφούν όλα τα δεδομένα πληρωμών.</span>
                        </>
                    )}

                    <div style={{ marginTop: '16px' }}>
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
                                textAlign: 'center',
                                outline: 'none'
                            }}
                        />
                        {error && <div style={{ color: 'red', marginTop: '8px', fontSize: '0.9rem' }}>{error}</div>}
                    </div>
                </div>
                <div className={styles.buttons}>
                    <button className="btn btn-cancel" onClick={onClose}>Ακύρωση</button>
                    <button className="btn btn-confirm" style={{ background: '#D32F2F' }} onClick={onConfirm}>Διαγραφή</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;
