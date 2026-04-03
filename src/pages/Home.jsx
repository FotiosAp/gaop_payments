import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
// import AdvancedAnalytics from '../components/AdvancedAnalytics';
import AddPlayerModal from '../components/AddPlayerModal';
import EditPlayerModal from '../components/EditPlayerModal';
import Header from '../components/Header';
import { ChevronLeft, ChevronRight, Phone, Trash2, Plus, Edit2 } from 'lucide-react';

const Home = ({ role, sections, payments, totalExpected, totalCollected, totalRemaining, totalExpenses, extraIncome, subscriptionExpenses, onAddPlayer, onDeletePlayer, onUpdatePlayer, onUpdateSection, currentMonthId, setCurrentMonthId, currentYear, setCurrentYear, settings, session, months }) => {
    // console.log("Home Render Props:", { currentMonthId, currentYear, sectionsCount: sections ? sections.length : 'null' });
    const navigate = useNavigate();
    const [expandedSection, setExpandedSection] = useState(null);
    const [addingToSection, setAddingToSection] = useState(null); // section object
    const [editingPlayer, setEditingPlayer] = useState(null); // { sectionId, player }
    const [copiedPhoneId, setCopiedPhoneId] = useState(null);

    // Month Navigation Handlers
    const handlePrevMonth = () => {
        const prev = parseInt(currentMonthId) - 1;
        if (prev >= 0) {
            setCurrentMonthId(String(prev));
        } else {
            // Go to December of previous year
            setCurrentMonthId('11');
            setCurrentYear(prevYear => prevYear - 1);
        }
    };

    const handleNextMonth = () => {
        const next = parseInt(currentMonthId) + 1;
        if (next < months.length) {
            setCurrentMonthId(String(next));
        } else {
            // Go to January of next year
            setCurrentMonthId('0');
            setCurrentYear(prevYear => prevYear + 1);
        }
    };

    const currentMonthName = months.find(m => m.id === currentMonthId)?.name || 'Unknown';

    // Delete State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [playerToDelete, setPlayerToDelete] = useState(null); // { sectionId, player }
    const [pin, setPin] = useState('');
    const [deleteError, setDeleteError] = useState('');

    // Delete Handlers
    const handleDeleteClick = (sectionId, player, e) => {
        e.stopPropagation();
        setPlayerToDelete({ sectionId, player });
        setDeleteModalOpen(true);
        setPin('');
        setDeleteError('');
    };

    const confirmDelete = () => {
        const correctPin = settings?.delete_pin || '2003';
        if (pin === correctPin) {
            onDeletePlayer(playerToDelete.sectionId, playerToDelete.player.id);
            setDeleteModalOpen(false);
            setPlayerToDelete(null);
            setPin('');
        } else {
            setDeleteError('Λάθος κωδικός ασφαλείας');
        }
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setPlayerToDelete(null);
        setPin('');
        setDeleteError('');
    };

    const handleSavePlayer = (playerData) => {
        if (addingToSection) {
            onAddPlayer(addingToSection.id, playerData);
            setAddingToSection(null);
        }
    };

    const handleUpdatePlayerDetails = (playerData) => {
        if (editingPlayer && onUpdatePlayer) {
            onUpdatePlayer(editingPlayer.sectionId, editingPlayer.player.id, playerData);
            // setEditingPlayer(null) removed so the modal can show its success pop-up before calling onClose()
        }
    };

    const handleOpenEditModal = (sectionId, player, e) => {
        e.stopPropagation();
        setEditingPlayer({ sectionId, player });
    };

    const copyPhone = (phone, id, e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(phone);
        setCopiedPhoneId(id);
        setTimeout(() => setCopiedPhoneId(null), 2000);
    };

    const toggleSection = (id) => {
        if (expandedSection === id) {
            setExpandedSection(null);
        } else {
            setExpandedSection(id);
        }
    };

    const handleOpenAddModal = (section, e) => {
        e.stopPropagation();
        setAddingToSection(section);
    };

    // Helper to calculate stats for a specific section and month
    const getSectionStats = (section, monthId) => {
        let paidCount = 0;
        let totalCount = 0;
        let paidAmount = 0;
        let totalAmount = 0;

        const isSummerMonth = monthId === '6' || monthId === '7';
        const skipExpected = isSummerMonth && !section.hasSummerPrep;

        if (section.players) {
            section.players.forEach(player => {
                const price = Number(player.price || 0);
                if (price > 0) {
                    if (!skipExpected) {
                        totalCount++;
                        totalAmount += price;
                    }

                    // Updated key format: YEAR_MONTH_PLAYERID
                    const paymentKey = `${currentYear}_${monthId}_${player.id}`;
                    const isPaid = payments && payments[paymentKey];

                    if (isPaid === true || (isPaid && isPaid.isPaid)) {
                        paidCount++;
                        paidAmount += price;
                    }
                }
            });
        }
        return { paidCount, totalCount, paidAmount, totalAmount };
    };

    // Calculate unpaid months for a player up to the current selected month within the current season
    const getPlayerDebtStatus = (player, section) => {
        if (!player || !player.price || Number(player.price) === 0) return null;
        let unpaidCount = 0;
        const currentM = parseInt(currentMonthId);

        if (isNaN(currentM)) return null;

        // Season months sequence starting from September (8) to August (7)
        const seasonMonths = [8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7];
        const currentMonthIndex = seasonMonths.indexOf(currentM);

        // If current month is Jan-Aug (0-7), the season started in previous year
        // If current month is Sep-Dec (8-11), the season started in current year
        const seasonStartYear = currentM >= 8 ? currentYear : currentYear - 1;

        for (let i = 0; i <= currentMonthIndex; i++) {
            const m = seasonMonths[i];
            const yearForMonth = m >= 8 ? seasonStartYear : seasonStartYear + 1;

            // Skip July (6) and August (7) unless the section explicitly has summer prep
            // Or if we define a property 'hasSummerPrep' on the section.
            // For now, let's assume if hasSummerPrep is true, we count them. Otherwise skip.
            if ((m === 6 || m === 7) && (!section || !section.hasSummerPrep)) {
                continue;
            }

            const key = `${yearForMonth}_${m}_${player.id}`;
            const pmt = payments && payments[key];
            const isPaid = pmt === true || (pmt && pmt.isPaid);
            if (!isPaid) {
                unpaidCount++;
            }
        }

        if (unpaidCount > 0) {
            return {
                status: 'debt',
                text: `${unpaidCount} ${unpaidCount === 1 ? 'μήνας' : 'μήνες'}`,
                color: '#D32F2F', // Red text
                bgColor: '#FFEBEE' // Light red background
            };
        } else {
            return {
                status: 'paid',
                text: 'Εξοφλημένος',
                color: '#2E7D32', // Green text
                bgColor: '#E8F5E9' // Light green background
            };
        }
    };

    // Sections are already sorted in the correct API order
    const sortedSections = sections || [];

    // Calculate total active athletes across all sections
    const totalAthletes = sortedSections.reduce((sum, section) => sum + (section.players ? section.players.length : 0), 0);

    // Calculate global payment stats for the current month
    const globalStats = sortedSections.reduce((acc, section) => {
        const stats = getSectionStats(section, currentMonthId);
        acc.paidCount += stats.paidCount;
        acc.totalCount += stats.totalCount;
        return acc;
    }, { paidCount: 0, totalCount: 0 });

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: '"Segoe UI", sans-serif' }}>
            <Header session={session} />
            <header>
                <div className="header-brand">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                        <img src="/logo.png" alt="GAOP Logo" className="logo" />
                        <div className="header-titles">
                            <h1>Γ.Α.Ο. ΠΕΙΡΑΙΑ<span>ΤΜΗΜΑ ΚΑΛΑΘΟΣΦΑΙΡΙΣΗΣ</span></h1>
                        </div>
                    </div>
                    <div className="athlete-badge">
                        <span className="badge-label">Ενεργοί Αθλητές</span>
                        <span className="badge-value">{totalAthletes}</span>
                    </div>
                </div>
            </header>

            {/* Month Navigation */}
            <div className="month-nav">
                <button onClick={handlePrevMonth} className="nav-btn">
                    <ChevronLeft size={24} />
                </button>
                <div className="current-date">
                    <div className="month">{currentMonthName}</div>
                    <div className="year-label">{currentYear}</div>
                </div>
                <button onClick={handleNextMonth} className="nav-btn">
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Main Stats Dashboard */}
            {/* Main Stats Dashboard - Only for Admin */}
            {role === 'admin' && (
                <Dashboard
                    totalExpected={totalExpected}
                    totalCollected={totalCollected}
                    totalRemaining={totalRemaining}
                    totalExpenses={totalExpenses}
                    extraIncome={extraIncome}
                    subscriptionExpenses={subscriptionExpenses}
                />
            )}

            {/* NEW: Advanced Analytics Section (Temporarily Disabled due to white screen) */}
            {/* 
            <h2 className="section-h2">Στατιστικά & Ανάλυση</h2>
            <AdvancedAnalytics 
                sections={sections}
                payments={payments}
                currentYear={currentYear}
            />
            */}

            {/* Roster Management Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <h2 className="section-h2" style={{ margin: 0 }}>Συνδρομές</h2>
                <div className="payment-summary-badge">
                    <span className="summary-value">{globalStats.paidCount}</span>
                    <span className="summary-separator">/</span>
                    <span className="summary-total">{globalStats.totalCount}</span>
                </div>
            </div>
            <div style={{ marginBottom: '32px' }}>
                {sortedSections.map(section => {
                    const checkCount = section.players ? section.players.length : 0;
                    const isExpanded = expandedSection === section.id;
                    const stats = getSectionStats(section, currentMonthId);
                    const isFullyPaid = stats.totalCount > 0 && stats.paidCount === stats.totalCount;

                    return (
                        <div key={section.id} className="section-card">
                            {/* Section Header (Clickable) */}
                            <div
                                onClick={() => toggleSection(section.id)}
                                className="section-header-row"
                            >
                                <div className="section-info">
                                    <h4>{section.title}</h4>
                                    <div className="section-meta">
                                        <span className="meta-pill">{checkCount} αθλητές</span>
                                        {isFullyPaid && <span className="meta-pill pill-success">Εξοφλήθηκε</span>}
                                    </div>

                                    {/* Monthly Stats Summary */}
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

                            {/* Expanded Player List */}
                            {isExpanded && (
                                <div className="player-list-container">
                                    {(currentMonthId === '6' || currentMonthId === '7') && (
                                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fff9e6' }}>
                                            <input
                                                type="checkbox"
                                                id={`summer-prep-${section.id}`}
                                                checked={!!section.hasSummerPrep}
                                                onChange={(e) => {
                                                    if (onUpdateSection) {
                                                        onUpdateSection({ ...section, hasSummerPrep: e.target.checked });
                                                    }
                                                }}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <label htmlFor={`summer-prep-${section.id}`} style={{ fontWeight: '600', color: '#B7791F', cursor: 'pointer', margin: 0 }}>
                                                Το τμήμα κάνει Θερινή Προετοιμασία
                                            </label>
                                        </div>
                                    )}

                                    {section.players && section.players.map(player => (
                                        <div key={player.id} className="player-row roster-row">
                                            <div className="player-info">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                                    <span className="player-name">{player.name}</span>
                                                    {(() => {
                                                        const debtStats = getPlayerDebtStatus(player, section);
                                                        if (!debtStats) return null;
                                                        return (
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
                                                        );
                                                    })()}
                                                </div>
                                                <span className="parent-name">Γονιός: {player.parent}</span>
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
                                                            onClick={(e) => copyPhone(player.phone, player.id, e)}
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
                                            <div className="player-action" style={{ gap: '8px' }}>
                                                <button
                                                    onClick={(e) => handleOpenEditModal(section.id, player, e)}
                                                    className="btn-manage"
                                                    style={{ padding: '6px', minWidth: 'auto', background: '#F1F5F9', color: '#64748B' }}
                                                    title="Επεξεργασία Στοιχείων"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteClick(section.id, player, e)}
                                                    className="btn-delete"
                                                    title="Διαγραφή Αθλητή"
                                                >
                                                    <Trash2 size={24} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Add Button */}
                                    <div style={{ padding: '16px', textAlign: 'center', background: '#f8f9fa' }}>
                                        <button
                                            onClick={(e) => handleOpenAddModal(section, e)}
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
                })}
            </div>


            {addingToSection && (
                <AddPlayerModal
                    section={addingToSection}
                    onClose={() => setAddingToSection(null)}
                    onSave={handleSavePlayer}
                    settings={settings}
                />
            )}

            {editingPlayer && (
                <EditPlayerModal
                    player={editingPlayer.player}
                    onClose={() => setEditingPlayer(null)}
                    onSave={handleUpdatePlayerDetails}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && playerToDelete && (
                <div className="modal-overlay" onClick={closeDeleteModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3 className="modal-title" style={{ color: '#D32F2F' }}>Διαγραφή Αθλητή</h3>
                        <div className="modal-body">
                            Είστε σίγουροι ότι θέλετε να διαγράψετε τον/την <strong>{playerToDelete.player.name}</strong>;
                            <br />
                            <span style={{ fontSize: '0.9rem', color: '#666' }}>Η ενέργεια αυτή είναι μη αναστρέψιμη και θα διαγραφούν όλα τα δεδομένα πληρωμών.</span>

                            <div style={{ marginTop: '16px' }}>
                                <input
                                    type="password"
                                    inputMode="numeric"
                                    value={pin}
                                    onChange={(e) => { setPin(e.target.value); setDeleteError(''); }}
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
                                {deleteError && <div style={{ color: 'red', marginTop: '8px', fontSize: '0.9rem' }}>{deleteError}</div>}
                            </div>
                        </div>
                        <div className="modal-buttons">
                            <button className="btn btn-cancel" onClick={closeDeleteModal}>Ακύρωση</button>
                            <button className="btn btn-confirm" style={{ background: '#D32F2F' }} onClick={confirmDelete}>Διαγραφή</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
