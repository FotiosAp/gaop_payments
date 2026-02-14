import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { months } from '../data/constants';
import { ArrowLeft } from 'lucide-react';

const DepartmentMonths = ({ sections, payments, currentYear }) => {
    const { sectionId } = useParams();
    const navigate = useNavigate();

    const section = sections.find(s => s.id === sectionId);

    if (!section) return <div className="app-container">Department not found</div>;

    const getMonthStats = (monthId) => {
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
                    const isPaid = payments && payments[`${currentYear}_${monthId}_${player.id}`];
                    if (isPaid) {
                        paidCount++;
                        paidAmount += price;
                    }
                }
            });
        }

        return { paidCount, totalCount, paidAmount, totalAmount };
    };

    // Scroll to top on mount
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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
                        {section.title}
                    </div>
                    <div style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#64748B',
                        marginTop: '4px'
                    }}>
                        Διαχείριση Συνδρομών {currentYear}
                    </div>
                </div>
            </div>

            <div className="department-grid">
                {months.map(month => {
                    const stats = getMonthStats(month.id);
                    const percent = stats.totalCount > 0 ? Math.round((stats.paidCount / stats.totalCount) * 100) : 0;

                    return (
                        <button
                            key={month.id}
                            className="dept-btn"
                            onClick={() => navigate(`/month/${month.id}/section/${sectionId}`)}
                            style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.1rem' }}>{month.name}</span>
                                <span className="dept-arrow">➜</span>
                            </div>

                            <div style={{ fontSize: '0.85rem', color: '#666', width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Πληρώθηκαν: <strong>{stats.paidCount}/{stats.totalCount}</strong></span>
                                    <span style={{ color: percent === 100 ? 'green' : '#666', fontWeight: 600 }}>{percent}%</span>
                                </div>
                                <div style={{ marginTop: '4px' }}>
                                    Έσοδα: <strong>{stats.paidAmount}€</strong> <span style={{ fontSize: '0.9em', color: '#888' }}>/ {stats.totalAmount}€</span>
                                </div>
                            </div>

                            <div style={{ width: '100%', height: '6px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden', marginTop: '8px' }}>
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

export default DepartmentMonths;
