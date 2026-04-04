import React from 'react';
import { Phone, Edit2, Trash2 } from 'lucide-react';
import { getPlayerDebtStatus } from '../../../utils/playerHelpers';
import styles from './HomeComponents.module.css';

const PlayerRow = ({ 
    player, 
    section, 
    payments, 
    currentMonthId, 
    currentYear, 
    onEdit, 
    onDelete, 
    onCopyPhone, 
    copiedPhoneId 
}) => {
    const debtStats = getPlayerDebtStatus(player, section, payments, currentMonthId, currentYear);

    return (
        <div key={player.id} className={styles.playerRow}>
            <div className={styles.playerInfo}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span className={styles.playerName}>{player.name}</span>
                    {debtStats && (
                        <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            color: debtStats.color,
                            background: debtStats.bgColor,
                            display: 'inline-block'
                        }}>
                            {debtStats.status === 'debt' ? `Οφείλει ${debtStats.text}` : 'Εξοφλημένος'}
                        </span>
                    )}
                </div>
                <span className={styles.parentName}>Γονιός: {player.parent}</span>
                {player.phone && (
                    <div style={{ position: 'relative', display: 'inline-block', marginTop: '4px' }}>
                        {copiedPhoneId === player.id && (
                            <div style={{
                                position: 'absolute',
                                bottom: '100%',
                                left: '0',
                                background: '#333',
                                color: 'white',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                marginBottom: '4px',
                                zIndex: 10
                            }}>
                                Αντιγράφηκε
                            </div>
                        )}
                        <span
                            onClick={(e) => onCopyPhone(player.phone, player.id, e)}
                            style={{
                                fontSize: '0.8rem',
                                color: '#0288d1',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <Phone size={12} /> {player.phone}
                        </span>
                    </div>
                )}
            </div>

            {/* Action Row: Edit & Delete Buttons */}
            <div className={styles.playerAction}>
                <button
                    onClick={(e) => onEdit(section.id, player, e)}
                    className="btn-manage"
                    style={{ padding: '6px', minWidth: 'auto', background: '#F1F5F9', color: '#64748B' }}
                    title="Επεξεργασία Στοιχείων"
                >
                    <Edit2 size={18} />
                </button>
                <button
                    onClick={(e) => onDelete(section.id, player, e)}
                    className="btn-delete"
                    title="Διαγραφή Αθλητή"
                >
                    <Trash2 size={24} />
                </button>
            </div>
        </div>
    );
};

export default PlayerRow;
