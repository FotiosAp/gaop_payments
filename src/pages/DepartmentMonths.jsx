import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { months } from '../data/constants';
import { ArrowLeft } from 'lucide-react';

const DepartmentMonths = ({ sections, payments, currentYear, currentMonthId }) => {
    const { sectionId } = useParams();
    const navigate = useNavigate();

    const section = sections.find(s => s.id === sectionId);

    if (!section) return <div className="app-container">Department not found</div>;

    const currentM = parseInt(currentMonthId);
    // If the selected month is Sep-Dec, we are in the starting year of the season
    // If Jan-Aug, we are in the ending year of the season
    const seasonStartYear = currentM >= 8 ? currentYear : currentYear - 1;
    const seasonEndYear = seasonStartYear + 1;

    // Build the season months array
    const seasonMonths = [
        { id: '8', name: 'Σεπτέμβριος', targetYear: seasonStartYear },
        { id: '9', name: 'Οκτώβριος', targetYear: seasonStartYear },
        { id: '10', name: 'Νοέμβριος', targetYear: seasonStartYear },
        { id: '11', name: 'Δεκέμβριος', targetYear: seasonStartYear },
        { id: '0', name: 'Ιανουάριος', targetYear: seasonEndYear },
        { id: '1', name: 'Φεβρουάριος', targetYear: seasonEndYear },
        { id: '2', name: 'Μάρτιος', targetYear: seasonEndYear },
        { id: '3', name: 'Απρίλιος', targetYear: seasonEndYear },
        { id: '4', name: 'Μάιος', targetYear: seasonEndYear },
        { id: '5', name: 'Ιούνιος', targetYear: seasonEndYear }
    ];

    if (section.hasSummerPrep) {
        seasonMonths.push({ id: '6', name: 'Ιούλιος', targetYear: seasonEndYear });
        seasonMonths.push({ id: '7', name: 'Αύγουστος', targetYear: seasonEndYear });
    }

    // Identify current month for highlighting
    const today = new Date();
    const currentRealMonth = today.getMonth();
    const currentRealYear = today.getFullYear();

    const getMonthStats = (monthId, targetYear) => {
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
                    const paymentKey = `${targetYear}_${monthId}_${player.id}`;
                    const pmt = payments && payments[paymentKey];
                    const isPaid = pmt === true || (pmt && pmt.isPaid);
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
                        Διαχείριση Συνδρομών Σεζόν {seasonStartYear}-{seasonEndYear}
                    </div>
                </div>
            </div>

            <div className="department-grid">
                {seasonMonths.map(month => {
                    const stats = getMonthStats(month.id, month.targetYear);
                    const percent = stats.totalCount > 0 ? Math.round((stats.paidCount / stats.totalCount) * 100) : 0;
                    const isCurrent = parseInt(month.id) === currentRealMonth && month.targetYear === currentRealYear;

                    return (
                        <button
                            key={month.id}
                            className="dept-btn"
                            onClick={() => navigate(`/month/${month.id}/year/${month.targetYear}/section/${sectionId}`)}
                            style={{ 
                                flexDirection: 'column', 
                                alignItems: 'flex-start', 
                                gap: '8px',
                                background: isCurrent ? '#E3F2FD' : 'white',
                                borderLeft: isCurrent ? '6px solid #1976D2' : '6px solid var(--primary)',
                                boxShadow: isCurrent ? '0 4px 12px rgba(25, 118, 210, 0.15)' : 'var(--shadow-sm)',
                                border: isCurrent ? '1px solid #BBDEFB' : 'none',
                                borderLeftWidth: '6px'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.1rem', color: isCurrent ? '#1565C0' : 'inherit', fontWeight: isCurrent ? '800' : '700' }}>
                                    {month.name}
                                    {isCurrent && (
                                        <span style={{ 
                                            fontSize: '0.65rem', 
                                            background: '#1976D2', 
                                            color: 'white', 
                                            padding: '2px 8px', 
                                            borderRadius: '10px', 
                                            marginLeft: '8px', 
                                            verticalAlign: 'middle',
                                            letterSpacing: '0.5px'
                                        }}>
                                            ΤΡΕΧΩΝ
                                        </span>
                                    )}
                                </span>
                                <span className="dept-arrow" style={{ color: isCurrent ? '#1976D2' : '#aaa' }}>➜</span>
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
