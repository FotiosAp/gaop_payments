import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import PlayerRow from './PlayerRow';
import { getSectionStats } from '../../../utils/playerHelpers';
import styles from './HomeComponents.module.css';

const SectionCard = ({ 
    section, 
    currentMonthId, 
    currentYear, 
    payments,
    isExpanded, 
    onToggle, 
    onAddPlayer, 
    onEditPlayer, 
    onDeletePlayer,
    onUpdateSection,
    onCopyPhone,
    copiedPhoneId
}) => {
    const navigate = useNavigate();
    const stats = getSectionStats(section, currentMonthId, payments, currentYear);
    const isFullyPaid = stats.totalCount > 0 && stats.paidCount === stats.totalCount;
    const checkCount = section.players ? section.players.length : 0;

    return (
        <div className={styles.sectionCard}>
            <div
                onClick={() => onToggle(section.id)}
                className={styles.sectionHeaderRow}
            >
                <div className={styles.sectionInfo}>
                    <h4>{section.title}</h4>
                    <div className={styles.sectionMeta}>
                        <span className={styles.metaPill}>{checkCount} αθλητές</span>
                        {isFullyPaid && <span className={`${styles.metaPill} ${styles.pillSuccess}`}>Εξοφλήθηκε</span>}
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '8px' }}>
                        <span style={{ fontWeight: 600, color: isFullyPaid ? '#2E7D32' : '#334155' }}>
                            {stats.paidCount}/{stats.totalCount} Πληρωμές
                        </span>
                        <span style={{ margin: '0 8px', color: '#CBD5E1' }}>|</span>
                        <span>{stats.paidAmount}€ / {stats.totalAmount}€</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/department/${section.id}/months`);
                        }}
                        className="btn-manage"
                    >
                        Διαχείριση
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="player-list-container">
                    {(currentMonthId === '6' || currentMonthId === '7') && (
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fff9e6' }}>
                            <input
                                type="checkbox"
                                id={`summer-prep-${section.id}`}
                                checked={!!section.hasSummerPrep}
                                onChange={(e) => {
                                    onUpdateSection({ ...section, hasSummerPrep: e.target.checked });
                                }}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <label htmlFor={`summer-prep-${section.id}`} style={{ fontWeight: '600', color: '#B7791F', cursor: 'pointer', margin: 0 }}>
                                Το τμήμα κάνει Θερινή Προετοιμασία
                            </label>
                        </div>
                    )}

                    {section.players && section.players.map(player => (
                        <PlayerRow 
                            key={player.id}
                            player={player}
                            section={section}
                            payments={payments}
                            currentMonthId={currentMonthId}
                            currentYear={currentYear}
                            onEdit={onEditPlayer}
                            onDelete={onDeletePlayer}
                            onCopyPhone={onCopyPhone}
                            copiedPhoneId={copiedPhoneId}
                        />
                    ))}

                    <div style={{ padding: '16px', textAlign: 'center', background: '#f8f9fa' }}>
                        <button
                            onClick={(e) => onAddPlayer(section, e)}
                            style={{
                                background: '#1976D2',
                                color: 'white',
                                border: 'none',
                                padding: '10px 24px',
                                borderRadius: '24px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 2px 4px rgba(25, 118, 210, 0.3)'
                            }}
                        >
                            <Plus size={18} /> Προσθήκη Αθλητή
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SectionCard;
