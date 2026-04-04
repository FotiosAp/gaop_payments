import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

// New Components
import Dashboard from '../components/features/dashboard/Dashboard';
import SectionCard from '../components/features/home/SectionCard';
import AddPlayerModal from '../components/features/home/AddPlayerModal';
import EditPlayerModal from '../components/features/home/EditPlayerModal';
import DeleteModal from '../components/common/DeleteModal';

// Utils
import { getSectionStats } from '../utils/playerHelpers';

// Styles
import styles from './Home.module.css';

const Home = () => {
    const { 
        sections, payments, 
        onAddPlayer, onDeletePlayer, onUpdatePlayer, onUpdateSection, 
        currentMonthId, setCurrentMonthId, currentYear, setCurrentYear, 
        settings, months 
    } = useAppContext();

    // Local State
    const [expandedSection, setExpandedSection] = useState(null);
    const [addingToSection, setAddingToSection] = useState(null);
    const [editingPlayer, setEditingPlayer] = useState(null);
    const [copiedPhoneId, setCopiedPhoneId] = useState(null);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [playerToDelete, setPlayerToDelete] = useState(null);
    const [pin, setPin] = useState('');
    const [deleteError, setDeleteError] = useState('');

    // --- Action Handlers ---

    const handleConfirmDelete = () => {
        if (pin === (settings.delete_pin || '1234')) {
            onDeletePlayer(playerToDelete.sectionId, playerToDelete.player.id);
            closeDeleteModal();
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

    const handleDeleteClick = (sectionId, player, e) => {
        e.stopPropagation();
        setPlayerToDelete({ sectionId, player });
        setDeleteModalOpen(true);
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
        }
    };

    const handleOpenEditModal = (sectionId, player, e) => {
        e.stopPropagation();
        setEditingPlayer({ sectionId, player });
    };

    const handleCopyPhone = (phone, id, e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(phone);
        setCopiedPhoneId(id);
        setTimeout(() => setCopiedPhoneId(null), 2000);
    };

    const toggleSection = (id) => {
        setExpandedSection(expandedSection === id ? null : id);
    };

    const handleOpenAddModal = (section, e) => {
        e.stopPropagation();
        setAddingToSection(section);
    };

    // --- Statistics ---

    const sortedSections = sections || [];
    const totalAthletes = sortedSections.reduce((sum, section) => sum + (section.players ? section.players.length : 0), 0);

    const globalStats = sortedSections.reduce((acc, section) => {
        const stats = getSectionStats(section, currentMonthId, payments, currentYear);
        acc.paidCount += stats.paidCount;
        acc.totalCount += stats.totalCount;
        return acc;
    }, { paidCount: 0, totalCount: 0 });

    const currentMonthName = (months || []).find(m => m.id === currentMonthId)?.name || 'Άγνωστος';

    const changeMonth = (direction) => {
        const mIds = (months || []).map(m => m.id);
        const idx = mIds.indexOf(currentMonthId);
        if (direction === 'next' && idx < mIds.length - 1) setCurrentMonthId(mIds[idx + 1]);
        if (direction === 'prev' && idx > 0) setCurrentMonthId(mIds[idx - 1]);
    };

    return (
        <div>
            <header>
                <div className={styles.headerBrand}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <img src="/logo.png" alt="GAOP Logo" style={{ height: '60px', width: 'auto' }} />
                        <div className={styles.headerTitles}>
                            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#000000', margin: 0 }}>Γ.Α.Ο. ΠΕΙΡΑΙΑ</h1>
                            <span style={{ fontSize: '0.9rem', color: '#B71C1C', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.02em', display: 'block', marginTop: '2px' }}>
                                ΤΜΗΜΑ ΚΑΛΑΘΟΣΦΑΙΡΙΣΗΣ
                            </span>
                        </div>
                    </div>

                    <div className={styles.athleteBadge}>
                        <span className={styles.badgeLabel}>ενεργοί αθλητές</span>
                        <span className={styles.badgeValue}>{totalAthletes}</span>
                    </div>
                </div>
            </header>

            <div className={styles.monthNav}>
                <button 
                  onClick={() => changeMonth('prev')} 
                  className="nav-btn" 
                  disabled={months?.indexOf(months.find(m => m.id === currentMonthId)) === 0}
                >
                    <ChevronLeft size={24} />
                </button>
                <div className={styles.currentDate}>
                    <div className={styles.month}>{currentMonthName}</div>
                    <div className={styles.yearLabel}>{currentYear}</div>
                </div>
                <button 
                  onClick={() => changeMonth('next')} 
                  className="nav-btn"
                  disabled={months?.indexOf(months.find(m => m.id === currentMonthId)) === months?.length - 1}
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            <Dashboard />

            <div className={styles.sectionList}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Συνδρομές</h2>
                    <span style={{ 
                        background: '#EFF6FF', 
                        color: '#2563EB', 
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        fontSize: '0.85rem', 
                        fontWeight: '700' 
                    }}>
                        {globalStats.paidCount} / {globalStats.totalCount}
                    </span>
                </div>
                
                {sortedSections.map(section => (
                    <SectionCard 
                        key={section.id}
                        section={section}
                        currentMonthId={currentMonthId}
                        currentYear={currentYear}
                        payments={payments}
                        isExpanded={expandedSection === section.id}
                        onToggle={toggleSection}
                        onAddPlayer={handleOpenAddModal}
                        onEditPlayer={handleOpenEditModal}
                        onDeletePlayer={handleDeleteClick}
                        onUpdateSection={onUpdateSection}
                        onCopyPhone={handleCopyPhone}
                        copiedPhoneId={copiedPhoneId}
                    />
                ))}
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

            <DeleteModal 
                isOpen={deleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleConfirmDelete}
                itemName={playerToDelete?.player?.name}
                pin={pin}
                setPin={setPin}
                error={deleteError}
            />
        </div>
    );
};

export default Home;
