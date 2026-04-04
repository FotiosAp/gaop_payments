import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Check, Edit2 } from 'lucide-react';

import { useAppContext } from '../context/AppContext';

// Feature Components
import PaymentConfirmModal from '../components/features/section/PaymentConfirmModal';
import EditPriceModal from '../components/features/section/EditPriceModal';
import DeleteModal from '../components/common/DeleteModal';

const SectionDetail = () => {
    const { 
        sections, payments, onSetPayment, onUpdatePlayer, 
        currentYear, settings, months 
    } = useAppContext();
    const { monthId, year, id: sectionId } = useParams(); // 'id' from router is sectionId
    const navigate = useNavigate();

    const targetYear = year ? parseInt(year) : currentYear;

    // Modals state
    const [modalOpen, setModalOpen] = useState(false); // Pay Confirm
    const [authModalOpen, setAuthModalOpen] = useState(false); // Unpay Auth
    const [editPriceModalOpen, setEditPriceModalOpen] = useState(false); // Edit Price Modal
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [newPrice, setNewPrice] = useState('');

    const section = (sections || []).find(s => s.id === sectionId);
    if (!section) return <div className="app-container">Section not found</div>;

    const month = (months || []).find(m => m.id === monthId);
    if (!month) return <div className="app-container">Month not found</div>;

    const handlePlayerClick = (player) => {
        const key = `${targetYear}_${monthId}_${player.id}`;
        const isPaid = payments && payments[key];

        setSelectedPlayer(player);
        setPin('');
        setError('');

        if (isPaid) {
            setAuthModalOpen(true);
        } else {
            setModalOpen(true);
        }
    };

    const confirmPayment = async () => {
        if (pin === (settings.delete_pin || '1234')) {
            try {
                await onSetPayment(monthId, targetYear, selectedPlayer.id, true);
                setModalOpen(false);
                setSelectedPlayer(null);
                setPin('');
            } catch (err) {
                setError('Σφάλμα κατά την αποθήκευση');
            }
        } else {
            setError('Λάθος κωδικός ασφαλείας');
        }
    };

    const confirmUnpay = async () => {
        if (pin === (settings.delete_pin || '1234')) {
            try {
                await onSetPayment(monthId, targetYear, selectedPlayer.id, false);
                setAuthModalOpen(false);
                setSelectedPlayer(null);
                setPin('');
            } catch (err) {
                setError('Σφάλμα κατά την αποθήκευση');
            }
        } else {
            setError('Λάθος κωδικός ασφαλείας');
        }
    };

    const handleEditPriceClick = (player, e) => {
        e.stopPropagation();
        setSelectedPlayer(player);
        setNewPrice(player.price || 50);
        setPin('');
        setError('');
        setEditPriceModalOpen(true);
    };

    const confirmPriceUpdate = async () => {
        if (pin === (settings.delete_pin || '1234')) {
            try {
                await onUpdatePlayer(sectionId, selectedPlayer.id, { manualPrice: Number(newPrice) });
                setEditPriceModalOpen(false);
                setSelectedPlayer(null);
                setPin('');
                setNewPrice('');
            } catch (err) {
                setError('Σφάλμα κατά την αποθήκευση');
            }
        } else {
            setError('Λάθος κωδικός ασφαλείας');
        }
    };

    const cancelPayment = () => {
        setModalOpen(false);
        setAuthModalOpen(false);
        setEditPriceModalOpen(false);
        setSelectedPlayer(null);
        setPin('');
        setError('');
    };

    const copyPhone = (phone, e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(phone);
        alert('Το τηλέφωνο αντιγράφηκε');
    };

    return (
        <div className="app-container">
            <div className="month-nav">
                <button onClick={() => navigate(-1)} className="nav-btn">
                    <ArrowLeft size={20} />
                </button>
                <div className="current-date">
                    <div className="month">{section.title}</div>
                    <div className="year-label">{month.name} {targetYear}</div>
                </div>
                <div style={{ width: '40px' }}></div>
            </div>

            <div className="player-list">
                {section.players && section.players.map(player => {
                    const key = `${targetYear}_${monthId}_${player.id}`;
                    const isPaid = payments && payments[key];

                    return (
                        <div
                            key={player.id}
                            className={`player-row ${isPaid ? 'paid' : ''}`}
                            onClick={() => handlePlayerClick(player)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="player-info">
                                <span className="player-name">{player.name}</span>
                                <span className="parent-name">Γονιός: {player.parent}</span>
                                {player.phone && (
                                    <span
                                        onClick={(e) => copyPhone(player.phone, e)}
                                        style={{ fontSize: '0.8rem', color: '#0288d1', cursor: 'pointer', marginTop: '4px', display: 'block' }}
                                    >
                                        📞 {player.phone}
                                    </span>
                                )}
                            </div>

                            <div className="player-action">
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                    <span className="price">
                                        {player.price}€
                                        <button
                                            onClick={(e) => handleEditPriceClick(player, e)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#94a3b8',
                                                cursor: 'pointer',
                                                padding: '4px',
                                                marginLeft: '4px'
                                            }}
                                            title="Αλλαγή ποσού συνδρομής"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                    </span>
                                </div>
                                <button className={`pay-btn ${isPaid ? 'paid' : 'unpaid'}`}>
                                    {isPaid ? <Check size={18} /> : 'Πληρωμή'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <PaymentConfirmModal 
                isOpen={modalOpen}
                onClose={cancelPayment}
                onConfirm={confirmPayment}
                playerName={selectedPlayer?.name}
                monthName={month.name}
                price={selectedPlayer?.price}
                pin={pin}
                setPin={setPin}
                error={error}
            />

            <DeleteModal 
                isOpen={authModalOpen}
                onClose={cancelPayment}
                onConfirm={confirmUnpay}
                itemName={selectedPlayer?.name}
                title={`Ακύρωση Πληρωμής (${month.name})`}
                message={`Για να ακυρώσετε την πληρωμή του/της ${selectedPlayer?.name}, πληκτρολογήστε τον κωδικό ασφαλείας.`}
                pin={pin}
                setPin={setPin}
                error={error}
            />

            <EditPriceModal 
                isOpen={editPriceModalOpen}
                onClose={cancelPayment}
                onConfirm={confirmPriceUpdate}
                playerName={selectedPlayer?.name}
                newPrice={newPrice}
                setNewPrice={setNewPrice}
                pin={pin}
                setPin={setPin}
                error={error}
            />
        </div>
    );
};

export default SectionDetail;
