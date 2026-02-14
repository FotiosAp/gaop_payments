import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Trash2 } from 'lucide-react';
import { months } from '../data/constants';

const SubscriptionDetails = ({ sections = [], payments = {}, currentYear, records = [], onAddRecord, onDeleteRecord }) => {
    const navigate = useNavigate();
    const [selectedMonthId, setSelectedMonthId] = useState(null);

    // State for adding expense
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseReason, setExpenseReason] = useState('');

    // State for Confirmation Modals
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        type: null, // 'add' or 'delete'
        data: null
    });

    // Helper to calculate totals for a specific month
    const getMonthStats = (monthId) => {
        let collectedRaw = 0;

        sections.forEach(section => {
            if (section.players) {
                section.players.forEach(player => {
                    const paymentKey = `${currentYear}_${monthId}_${player.id}`;
                    const pmt = payments[paymentKey];
                    if (pmt === true || (pmt && pmt.isPaid)) {
                        const amount = (typeof pmt === 'object' && pmt.amount !== undefined) ? Number(pmt.amount) : Number(player.price || 0);
                        collectedRaw += amount;
                    }
                });
            }
        });

        // 80% of collected
        const collected80 = collectedRaw * 0.8;

        // Filter Subscription Expenses for this month using standard equality
        const monthExpenses = records.filter(r => {
            const d = new Date(r.date);
            // Relaxed check: Use loose equality for Year and Month to handle potential string/number mismatches
            return d.getFullYear() == currentYear && d.getMonth() == monthId && r.type === 'expense' && r.category === 'subscription';
        }).reduce((sum, r) => sum + Number(r.amount), 0);

        // Balance for 80% fund
        const remainingBalance = collected80 - monthExpenses;

        return { collected80, monthExpenses, remainingBalance };
    };

    // Get total annual stats (sum of 80% collected - sum of subscription expenses)
    const getAnnualStats = () => {
        let totalCollected80 = 0;
        let totalExpenses = 0;

        Object.keys(months).forEach(monthId => {
            const stats = getMonthStats(monthId);
            totalCollected80 += stats.collected80;
            totalExpenses += stats.monthExpenses;
        });

        return {
            collected80: totalCollected80,
            expenses: totalExpenses,
            balance: totalCollected80 - totalExpenses
        };
    };

    const annualStats = getAnnualStats();

    // Initiate Add Expense
    const initiateAddExpense = (e) => {
        e.preventDefault();
        // Validate inputs
        if (!expenseAmount || !expenseReason || selectedMonthId === null) return;

        setConfirmModal({
            open: true,
            type: 'add',
            data: { amount: expenseAmount, reason: expenseReason }
        });
    };

    // Initiate Delete Record
    const initiateDelete = (record) => {
        setConfirmModal({
            open: true,
            type: 'delete',
            data: record
        });
    };

    // Confirm Action
    const handleConfirm = async () => {
        const { type, data } = confirmModal;
        // Close modal first
        setConfirmModal({ ...confirmModal, open: false });

        try {
            if (type === 'add') {
                // Create date at NOON (12:00) to safely handle timezone shifts when converting to ISO
                // This ensures the record stays in the selected month for accounting/filtering
                const accountingDate = new Date(currentYear, Number(selectedMonthId), 1, 12, 0, 0).toISOString();

                // Real-time timestamp for display
                const realDate = new Date().toISOString();

                const newRecord = {
                    type: 'expense',
                    amount: Number(data.amount),
                    reason: data.reason,
                    date: accountingDate,
                    transactionDate: realDate,
                    category: 'subscription'
                };

                await onAddRecord(newRecord); // Await completion
                setExpenseAmount('');
                setExpenseReason('');
            } else if (type === 'delete') {
                await onDeleteRecord(data.id);
            }
        } catch (error) {
            console.error('Operation failed:', error);
            alert('Η ενέργεια απέτυχε. Παρακαλώ δοκιμάστε ξανά.');
        }
    };

    const handleMonthClick = (id) => {
        setSelectedMonthId(id);
        window.scrollTo(0, 0);
    };

    // Styles
    const cardStyle = {
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
    };

    // Render Month View
    const renderMonthView = () => {
        const { collected80, monthExpenses, remainingBalance } = getMonthStats(selectedMonthId);

        // Get list of expenses for this month
        const expensesList = records.filter(r => {
            const d = new Date(r.date);
            return d.getFullYear() == currentYear && d.getMonth() == selectedMonthId && r.type === 'expense' && r.category === 'subscription';
        });

        return (
            <div className="app-container">
                {/* Custom Confirmation Modal */}
                {confirmModal.open && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div className="card-glass" style={{
                            background: 'white',
                            padding: '24px',
                            width: '90%',
                            maxWidth: '400px',
                            borderRadius: '16px',
                            textAlign: 'center',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                        }}>
                            <h3 style={{ marginTop: 0, color: '#1e293b' }}>Επιβεβαίωση</h3>
                            <p style={{ color: '#64748B', margin: '16px 0', fontSize: '1.1rem' }}>
                                {confirmModal.type === 'add'
                                    ? 'Είστε σίγουροι ότι θέλετε να προσθέσετε αυτό το έξοδο;'
                                    : 'Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το έξοδο;'
                                }
                            </p>

                            {confirmModal.type === 'add' && (
                                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'left' }}>
                                    <div style={{ fontSize: '0.9rem', color: '#64748B' }}>Ποσό: <strong>{Number(confirmModal.data.amount).toLocaleString('el-GR')}€</strong></div>
                                    <div style={{ fontSize: '0.9rem', color: '#64748B' }}>Αιτιολογία: <strong>{confirmModal.data.reason}</strong></div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                <button
                                    onClick={() => setConfirmModal({ ...confirmModal, open: false })}
                                    style={{
                                        padding: '12px 24px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: '#E2E8F0',
                                        color: '#475569',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        fontSize: '1rem'
                                    }}
                                >
                                    Όχι, Ακύρωση
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    style={{
                                        padding: '12px 24px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: confirmModal.type === 'add' ? '#D32F2F' : '#EF4444',
                                        color: 'white',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        fontSize: '1rem',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                >
                                    Ναι, Συνέχεια
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <button
                        onClick={() => setSelectedMonthId(null)}
                        style={{
                            background: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            cursor: 'pointer'
                        }}
                    >
                        <ArrowLeft size={20} color="#333" />
                    </button>
                    <h1 className="section-title" style={{ margin: 0, fontSize: '1.2rem' }}>
                        {months[selectedMonthId].name} {currentYear} (80%)
                    </h1>
                </div>

                {/* 3 Top Cards */}
                <div className="stats-grid-custom" style={{
                    display: 'grid',
                    gap: '16px',
                    marginBottom: '32px'
                }}>
                    <div style={{ background: '#E3F2FD', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid #BBDEFB' }}>
                        <div style={{ fontSize: '0.9rem', color: '#1565C0', marginBottom: '8px' }}>Εισπράξεις (80%)</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1565C0' }}>
                            {collected80.toLocaleString('el-GR')}€
                        </div>
                    </div>

                    <div style={{ background: '#FFEBEE', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid #FFCDD2' }}>
                        <div style={{ fontSize: '0.9rem', color: '#C62828', marginBottom: '8px' }}>Έξοδα Συνδρομών</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#C62828' }}>
                            {monthExpenses.toLocaleString('el-GR')}€
                        </div>
                    </div>

                    <div style={{
                        background: '#E8F5E9',
                        padding: '20px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        border: '1px solid #C8E6C9',
                        gridColumn: '1 / -1'
                    }}>
                        <div style={{ fontSize: '0.9rem', color: '#2E7D32', marginBottom: '8px' }}>Καθαρό Υπόλοιπο (80%)</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#2E7D32' }}>
                            {remainingBalance.toLocaleString('el-GR')}€
                        </div>
                    </div>
                </div>

                {/* Add Expense Form */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '32px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', color: '#D32F2F' }}>
                        <div style={{ background: '#FFEBEE', padding: '8px', borderRadius: '50%' }}>
                            <Minus size={20} />
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>Εισαγωγή Εξόδων (Από Συνδρομές)</h2>
                    </div>
                    <form onSubmit={initiateAddExpense} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748B', fontWeight: '600' }}>Ποσό (€)</label>
                            <input
                                type="number"
                                value={expenseAmount}
                                onChange={(e) => setExpenseAmount(e.target.value)}
                                placeholder="0"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748B', fontWeight: '600' }}>Αιτιολογία</label>
                            <input
                                type="text"
                                value={expenseReason}
                                onChange={(e) => setExpenseReason(e.target.value)}
                                placeholder="π.χ. Πληρωμή Προπονητή"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            style={{
                                padding: '12px 24px',
                                background: '#D32F2F',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                height: '42px', // Match input height roughly
                                boxShadow: '0 2px 4px rgba(211, 47, 47, 0.3)'
                            }}
                        >
                            Προσθήκη
                        </button>
                    </form>
                </div>

                {/* Expenses List */}
                <h3 style={{ marginBottom: '16px', color: '#333' }}>Αναλυτική Λίστα Εξόδων</h3>
                <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    {/* Header */}
                    <div className="payment-header" style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 2fr 1fr',
                        padding: '16px',
                        background: '#F8FAFC',
                        borderBottom: '1px solid #E2E8F0',
                        fontWeight: '600',
                        color: '#64748B',
                        fontSize: '0.9rem'
                    }}>
                        <div>Ποσό (€)</div>
                        <div>Αιτιολογία</div>
                        <div style={{ textAlign: 'right' }}>Ημερομηνία</div>
                    </div>

                    {/* List */}
                    {expensesList.length > 0 ? expensesList.map(exp => (
                        <div key={exp.id} className="payment-row" style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 2fr 1fr',
                            padding: '16px',
                            borderBottom: '1px solid #F1F5F9',
                            alignItems: 'center',
                            fontSize: '0.95rem'
                        }}>
                            <div style={{ fontWeight: '700', color: '#C62828' }}>
                                -{Number(exp.amount).toLocaleString('el-GR')}€
                            </div>
                            <div style={{ color: '#334155', fontWeight: '500' }}>
                                {exp.reason}
                            </div>
                            <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: '#64748B', fontSize: '0.85rem' }}>
                                    {exp.transactionDate
                                        ? new Date(exp.transactionDate).toLocaleDateString('el-GR')
                                        : new Date(exp.date).toLocaleDateString('el-GR')
                                    }
                                </span>
                                <button
                                    onClick={() => initiateDelete(exp)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#EF4444',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div style={{ padding: '32px', textAlign: 'center', color: '#94A3B8' }}>Δεν υπάρχουν έξοδα για αυτόν τον μήνα.</div>
                    )}
                </div>

                {/* Mobile Styles Injection */}
                <style>{`
          @media (max-width: 768px) {
            .payment-header { display: none !important; }
            .payment-row { 
                display: flex !important; 
                flex-direction: column; 
                gap: 8px; 
                align-items: flex-start !important;
                position: relative;
            }
            .payment-row > div { text-align: left !important; width: 100%; }
            .payment-row > div:first-child { 
                font-size: 1.1rem; 
                color: #C62828;
            }
            
            /* Better mobile cards for payment row */
            .payment-row {
               background: #fff;
               margin-bottom: 8px;
               border-radius: 8px;
               box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            }
          }

          /* Custom Grid for 3 Cards (2 Top, 1 Bottom spanning full width) */
          .stats-grid-custom {
            grid-template-columns: 1fr 1fr; /* Always 2 columns (Desktop & Mobile) */
          }
        `}</style>
            </div>
        );
    };

    if (selectedMonthId !== null) {
        return renderMonthView();
    }

    // Render Year Grid View
    return (
        <div className="app-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        background: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        cursor: 'pointer'
                    }}
                >
                    <ArrowLeft size={20} color="#333" />
                </button>
                <h1 className="section-title" style={{ margin: 0, fontSize: '1.2rem' }}>
                    Ανάλυση Συνδρομών {currentYear} (80%)
                </h1>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', // Responsive Grid
                gap: '16px',
                marginBottom: '32px'
            }}>
                {Object.entries(months).map(([id, m]) => {
                    const stats = getMonthStats(id);
                    return (
                        <div
                            key={id}
                            onClick={() => handleMonthClick(id)}
                            style={cardStyle}
                            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '8px', color: '#334155' }}>{m.name}</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0EA5E9' }}>
                                {stats.remainingBalance.toLocaleString('el-GR')}€
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>
                                (Εισπ: {stats.collected80}€)
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Annual Summary Card (Subscription Specific) */}
            <div className="card-glass" style={{
                padding: '24px',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: 'white',
                textAlign: 'center'
            }}>
                <div style={{ opacity: 0.9, marginBottom: '8px' }}>Συνολικό Υπόλοιπο Ταμείου Συνδρομών (80%)</div>
                <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>
                    {annualStats.balance.toLocaleString('el-GR')}€
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px', opacity: 0.9 }}>
                    <div>
                        <div style={{ fontSize: '0.85rem' }}>Σύνολο Εισπράξεων</div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{annualStats.collected80.toLocaleString('el-GR')}€</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem' }}>Σύνολο Εξόδων</div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{annualStats.expenses.toLocaleString('el-GR')}€</div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default SubscriptionDetails;
