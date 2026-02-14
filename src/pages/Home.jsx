import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
// import AdvancedAnalytics from '../components/AdvancedAnalytics';
import AddPlayerModal from '../components/AddPlayerModal';
import Header from '../components/Header';
import { months, CURRENT_YEAR } from '../data/constants';
import { ChevronLeft, ChevronRight, Phone, Trash2, Plus } from 'lucide-react';

const Home = ({ role, sections, payments, totalExpected, totalCollected, totalRemaining, totalExpenses, extraIncome, onAddPlayer, onDeletePlayer, currentMonthId, setCurrentMonthId, currentYear, setCurrentYear }) => {
    // console.log("Home Render Props:", { currentMonthId, currentYear, sectionsCount: sections ? sections.length : 'null' });
    const navigate = useNavigate();
    const [expandedSection, setExpandedSection] = useState(null);
    const [addingToSection, setAddingToSection] = useState(null); // section object
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
        if (pin === '2003') {
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

        if (section.players) {
            section.players.forEach(player => {
                const price = Number(player.price || 0);
                if (price > 0) {
                    totalCount++;
                    totalAmount += price;

                    // Updated key format: YEAR_MONTH_PLAYERID
                    const paymentKey = `${currentYear}_${monthId}_${player.id}`;
                    const isPaid = payments && payments[paymentKey];

                    if (isPaid) {
                        paidCount++;
                        paidAmount += price;
                    }
                }
            });
        }
        return { paidCount, totalCount, paidAmount, totalAmount };
    };

    // Sort sections: "Junior" appears first, then others alphabetically or by default order
    const sortedSections = [...(sections || [])].sort((a, b) => {
        const titleA = (a.title || '').toLowerCase();
        const titleB = (b.title || '').toLowerCase();

        // Helper to check for keywords (Greek/English coverage)
        const has = (t, ...words) => words.every(w => t.includes(w));

        const getPriority = (t) => {
            if (t.includes('junior')) return 1;
            // "Under 12" logic (Boys first, then Girls)
            if (has(t, '12') && (has(t, 'αγόρια') || has(t, 'boys'))) return 2;
            if (has(t, '12') && (has(t, 'κορίτσια') || has(t, 'girls'))) return 3;
            // "Under 14" logic
            if (has(t, '14') && (has(t, 'αγόρια') || has(t, 'boys'))) return 4;

            return 100; // Others come last
        };

        const pA = getPriority(titleA);
        const pB = getPriority(titleB);

        if (pA !== pB) return pA - pB;
        return 0; // Maintain original order for others
    });

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: '"Segoe UI", sans-serif' }}>
            <Header />
            <header>
                <div className="header-brand">
                    <img src="/logo.png" alt="GAOP Logo" className="logo" />
                    <div className="header-titles">
                        <h1>Γ.Α.Ο. ΠΕΙΡΑΙΑ<span>ΤΜΗΜΑ ΚΑΛΑΘΟΣΦΑΙΡΙΣΗΣ</span></h1>
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
            <h2 className="section-h2">Συνδρομές</h2>
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
                                    {section.players && section.players.map(player => (
                                        <div key={player.id} className="player-row roster-row">
                                            <div className="player-info">
                                                <span className="player-name">{player.name}</span>
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

                                            {/* Action Row: Delete Button */}
                                            <div className="player-action">
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
                                    value={pin}
                                    onChange={(e) => { setPin(e.target.value); setDeleteError(''); }}
                                    placeholder="Κωδικός Ασφαλείας"
                                    autoFocus
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
