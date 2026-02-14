import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { months, CURRENT_YEAR } from '../data/constants';
import { ArrowLeft } from 'lucide-react';

const MonthView = ({ sections, payments, currentYear }) => {
    const { monthId } = useParams();
    const navigate = useNavigate();
    const month = months.find(m => m.id === monthId);

    if (!month) return <div className="app-container">Month not found</div>;

    // Helper for Section Stats
    const getSectionStats = (section) => {
        let paidCount = 0;
        let totalCount = 0;
        let paidAmount = 0;
        let totalAmount = 0;

        section.players.forEach(player => {
            const price = Number(player.price || 0);
            totalAmount += price;
            totalCount++; // Always count player
            const isPaid = payments && payments[`${currentYear}_${monthId}_${player.id}`];
            if (isPaid) {
                paidCount++;
                paidAmount += price;
            }
        });

        return { paidCount, totalCount, paidAmount, totalAmount };
    };

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
                    onClick={() => navigate('/')}
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

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                        fontSize: '1.75rem',
                        fontWeight: '800',
                        color: '#1E293B',
                        lineHeight: '1.2',
                        letterSpacing: '-0.02em'
                    }}>
                        {month.name} {currentYear}
                    </div>
                    <div style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#64748B',
                        marginTop: '4px'
                    }}>
                        Επισκόπηση Τμημάτων
                    </div>
                </div>
            </div>

            <div className="department-grid">
                {sections.map(section => {
                    const stats = getSectionStats(section);
                    const percent = stats.totalCount > 0 ? Math.round((stats.paidCount / stats.totalCount) * 100) : 0;

                    return (
                        <button
                            key={section.id}
                            className="dept-btn"
                            onClick={() => navigate(`/month/${monthId}/section/${section.id}`)}
                            style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.1rem' }}>{section.title}</span>
                                <span className="dept-arrow">➜</span>
                            </div>

                            <div style={{ fontSize: '0.85rem', color: '#666', width: '100%', marginTop: '4px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{stats.paidCount} / {stats.totalCount} Πληρωμές</span>
                                    <strong style={{ color: percent === 100 ? '#15803d' : 'inherit' }}>{stats.paidAmount}€</strong>
                                </div>
                            </div>
                            {/* Progress Bar */}
                            <div style={{ width: '100%', height: '6px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden', marginTop: '4px' }}>
                                <div style={{
                                    width: `${percent}%`,
                                    height: '100%',
                                    background: percent === 100 ? '#2E7D32' : 'var(--primary)',
                                    transition: 'width 0.3s ease'
                                }}></div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MonthView;
