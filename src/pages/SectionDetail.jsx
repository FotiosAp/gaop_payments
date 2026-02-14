import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { months, CURRENT_YEAR } from '../data/constants';
import { ArrowLeft, Phone, Check, Edit2 } from 'lucide-react';

const SectionDetail = ({ sections, payments, onSetPayment, onUpdatePlayer, currentYear }) => {
    const { monthId, id: sectionId } = useParams(); // 'id' from router is sectionId
    const navigate = useNavigate();

    // Modals state
    const [modalOpen, setModalOpen] = useState(false); // Pay Confirm
    const [authModalOpen, setAuthModalOpen] = useState(false); // Unpay Auth
    const [editPriceModalOpen, setEditPriceModalOpen] = useState(false); // Edit Price Modal

    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    // Scroll to top on mount
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    const [newPrice, setNewPrice] = useState(''); // For price editing

    const [copiedId, setCopiedId] = useState(null); // To track which phone was copied

    const section = sections.find(s => s.id === sectionId);
    const month = months.find(m => m.id === monthId);

    if (!section || !month) {
        return <div className="app-container">Not found</div>;
    }

    // Helper to check payment status
    const isPaid = (playerId) => payments && !!payments[`${currentYear}_${monthId}_${playerId}`];

    // Calculate local stats
    let totalPaid = 0;
    let amountPaid = 0;
    let totalAmount = 0;

    section.players.forEach(p => {
        const price = Number(p.price || 0);
        totalAmount += price;
        if (isPaid(p.id)) {
            totalPaid++;
            amountPaid += price;
        }
    });


    const handleCheckboxClick = (player) => {
        setSelectedPlayer(player);
        if (isPaid(player.id)) {
            // Already paid -> Move to Unpay Auth
            setPin('');
            setError('');
            setAuthModalOpen(true);
        } else {
            // Not paid -> Standard confirm
            setModalOpen(true);
            setPin('');
            setError('');
        }
    };

    const handleEditPriceClick = (player) => {
        setSelectedPlayer(player);
        setNewPrice(player.price); // Pre-fill current price
        setPin('');
        setError('');
        setEditPriceModalOpen(true);
    };

    const confirmPayment = () => {
        if (pin === '2003') {
            if (selectedPlayer) {
                onSetPayment(monthId, selectedPlayer.id, true); // true = paid
                setModalOpen(false);
                setSelectedPlayer(null);
                setPin('');
            }
        } else {
            setError('Λάθος κωδικός ασφαλείας');
        }
    };

    const confirmUnpay = () => {
        if (pin === '2003') {
            onSetPayment(monthId, selectedPlayer.id, false); // false = unpaid
            setAuthModalOpen(false);
            setSelectedPlayer(null);
            setPin('');
        } else {
            setError('Λάθος κωδικός');
        }
    };

    const confirmPriceUpdate = () => {
        if (pin === '2003') {
            if (selectedPlayer && onUpdatePlayer) {
                // Update player manual price
                onUpdatePlayer(sectionId, selectedPlayer.id, { manualPrice: Number(newPrice) });
                setEditPriceModalOpen(false);
                setSelectedPlayer(null);
                setPin('');
            }
        } else {
            setError('Λάθος κωδικός');
        }
    };

    const cancelPayment = () => {
        setModalOpen(false);
        setAuthModalOpen(false);
        setEditPriceModalOpen(false);
        setSelectedPlayer(null);
        setPin('');
        setError('');
        setNewPrice('');
    };

    const handleCopyPhone = (e, phone, playerId) => {
        e.stopPropagation();
        navigator.clipboard.writeText(phone);
        setCopiedId(playerId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Prevent closing when clicking modal content
    const handleModalClick = (e) => e.stopPropagation();

    return (
        <div className="app-container">
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                marginBottom: '32px',
                padding: '24px',
                background: 'white',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid rgba(0,0,0,0.05)'
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: '#F1F5F9', // Light gray
                        border: 'none',
                        cursor: 'pointer',
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        display: 'flex', // Centered
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#334155',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#E2E8F0';
                        e.currentTarget.style.transform = 'translateX(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#F1F5F9';
                        e.currentTarget.style.transform = 'none';
                    }}
                >
                    <ArrowLeft size={24} strokeWidth={2.5} />
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {/* Section Selector */}
                    <select
                        value={section.id}
                        onChange={(e) => navigate(`/month/${monthId}/section/${e.target.value}`)}
                        style={{
                            fontSize: '1.5rem',
                            fontWeight: '800',
                            color: '#1E293B',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            outline: 'none',
                            padding: '4px 0',
                            width: '100%',
                            fontFamily: 'inherit',
                            appearance: 'none', // Remove default arrow in some browsers if desired, or keep it
                            marginBottom: '4px'
                        }}
                    >
                        {sections.map(s => (
                            <option key={s.id} value={s.id}>{s.title}</option>
                        ))}
                    </select>

                    <div style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#64748B',
                    }}>
                        {month.name} {currentYear}
                    </div>
                </div>
            </div>

            {/* Top Summary (Static -> Sticky) */}
            <div className="section-summary-header sticky-summary" style={{
                marginBottom: '24px',
                background: '#1E293B', // Dark Slate
                color: 'white',
                padding: '20px',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 100 // Ensure it stays on top
            }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Πληρωμές</span>
                    <span style={{ fontWeight: '800', fontSize: '1.25rem' }}>{totalPaid} / {section.players.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '0.85rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Έσοδα</span>
                    <span style={{ fontWeight: '800', fontSize: '1.4rem', color: '#4ADE80' }}>
                        {amountPaid}€ <span className="total-amount-mini" style={{ fontSize: '0.9rem', color: '#94A3B8', fontWeight: '500' }}>/ {totalAmount}€</span>
                    </span>
                </div>
            </div>

            <div className="player-list">
                {section.players.map((player) => {
                    const paid = isPaid(player.id);
                    return (
                        <div
                            key={player.id}
                            className={`player-row ${paid ? 'paid' : ''}`}
                        >
                            <div className="player-info">
                                <span className="player-name">
                                    <span style={{ fontWeight: 'normal', fontSize: '0.85em', color: '#64748B', marginRight: '6px' }}>Παιδί:</span>
                                    {player.name}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                    <span className="parent-name" style={{ marginBottom: 0 }}>
                                        <span style={{ fontWeight: '500', marginRight: '6px', color: '#64748B', fontSize: '0.85em' }}>Γονιός:</span>
                                        {player.parent}
                                    </span>

                                    {player.phone && (
                                        <button
                                            onClick={(e) => handleCopyPhone(e, player.phone, player.id)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: copiedId === player.id ? '#10B981' : '#3B82F6',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                fontSize: '0.85em',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                transition: 'background 0.2s',
                                                fontWeight: '600'
                                            }}
                                            title="Αντιγραφή"
                                            onMouseEnter={e => e.currentTarget.style.background = '#F0F9FF'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                        >
                                            {copiedId === player.id ? <Check size={14} /> : <Phone size={14} />}
                                            {player.phone}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="player-action">
                                <div className="price" style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {player.originalPrice && player.originalPrice !== player.price && player.manualPrice === undefined && (
                                        <span className="original-price">{player.originalPrice}€</span>
                                    )}
                                    {/* Show edit button */}
                                    {player.price}€
                                    <button
                                        onClick={() => handleEditPriceClick(player)}
                                        style={{
                                            background: '#F1F5F9',
                                            border: 'none',
                                            borderRadius: '4px',
                                            padding: '4px',
                                            cursor: 'pointer',
                                            color: '#64748B',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                        title="Αλλαγή Συνδρομής"
                                    >
                                        <Edit2 size={12} />
                                    </button>
                                </div>

                                <button
                                    className={`pay-btn ${paid ? 'paid' : 'unpaid'}`}
                                    onClick={() => handleCheckboxClick(player)}
                                >
                                    {paid ? (
                                        <>
                                            <span style={{ fontWeight: '700' }}>ΠΛΗΡΩΣΕ</span>
                                            <span className="check-icon">✔</span>
                                        </>
                                    ) : (
                                        <span style={{ fontWeight: '600' }}>Εξόφληση</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>


            {/* Custom Confirmation Modal (Pay) */}
            {modalOpen && selectedPlayer && (
                <div className="modal-overlay" onClick={cancelPayment}>
                    <div className="modal-content" onClick={handleModalClick}>
                        <div className="modal-title">Επιβεβαίωση Πληρωμής ({month.name})</div>
                        <div className="modal-body">
                            Είστε σίγουροι ότι θέλετε να επιβεβαιώσετε την πληρωμή για τον/την <strong>{selectedPlayer.name}</strong>;
                            <div style={{ marginTop: '8px', fontSize: '1rem', color: '#1E293B' }}>Ποσό: <strong>{selectedPlayer.price}€</strong></div>

                            <div style={{ marginTop: '20px' }}>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    value={pin}
                                    onChange={(e) => { setPin(e.target.value); setError(''); }}
                                    placeholder="Κωδικός Ασφαλείας"
                                    className="input-field"
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
                        <div className="modal-buttons">
                            <button className="btn btn-cancel" onClick={cancelPayment}>Ακύρωση</button>
                            <button className="btn btn-confirm" onClick={confirmPayment}>Πληρωμή</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Unpay Modal */}
            {authModalOpen && selectedPlayer && (
                <div className="modal-overlay" onClick={cancelPayment}>
                    <div className="modal-content" onClick={handleModalClick}>
                        <div className="modal-title">Άρση Πληρωμής</div>
                        <div className="modal-body">
                            {/* ... same as before */}
                            Για να ακυρώσετε την πληρωμή του/της <strong>{selectedPlayer.name}</strong>, πληκτρολογήστε τον κωδικό ασφαλείας.
                            <div style={{ marginTop: '20px' }}>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    placeholder="Κωδικός Ασφαλείας"
                                    className="input-field"
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
                        <div className="modal-buttons">
                            <button className="btn btn-cancel" onClick={cancelPayment}>Ακύρωση</button>
                            <button className="btn btn-confirm" style={{ background: '#EF4444' }} onClick={confirmUnpay}>Άρση Πληρωμής</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Price Modal */}
            {editPriceModalOpen && selectedPlayer && (
                <div className="modal-overlay" onClick={cancelPayment}>
                    <div className="modal-content" onClick={handleModalClick}>
                        <div className="modal-title">Αλλαγή Συνδρομής</div>
                        <div className="modal-body">
                            Ορίστε νέο ποσό συνδρομής για τον/την <strong>{selectedPlayer.name}</strong>.

                            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <label style={{ fontSize: '0.9rem', color: '#555' }}>Νέα Συνδρομή (€):</label>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    value={newPrice}
                                    onChange={(e) => setNewPrice(e.target.value)}
                                    placeholder="Ποσό (π.χ. 30)"
                                    className="input-field"
                                    style={{
                                        padding: '12px',
                                        fontSize: '1.2rem',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        width: '100%',
                                        textAlign: 'center'
                                    }}
                                />

                                <label style={{ fontSize: '0.9rem', color: '#555', marginTop: '8px' }}>Κωδικός Ασφαλείας:</label>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    value={pin}
                                    onChange={(e) => { setPin(e.target.value); setError(''); }}
                                    placeholder="PIN"
                                    className="input-field"
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
                        <div className="modal-buttons">
                            <button className="btn btn-cancel" onClick={cancelPayment}>Ακύρωση</button>
                            <button className="btn btn-confirm" onClick={confirmPriceUpdate}>Αποθήκευση</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SectionDetail;
