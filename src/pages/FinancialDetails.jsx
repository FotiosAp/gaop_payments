import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Trash2, Calendar } from 'lucide-react';
import { months } from '../data/constants';

const FinancialDetails = ({ records, onAddRecord, onDeleteRecord, currentYear, sections, payments, totalAnnualSubscriptionIncome }) => {
    const navigate = useNavigate();
    const [selectedMonthId, setSelectedMonthId] = useState(null);

    // Scroll to Top on Mount
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);

    // Form States
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseReason, setExpenseReason] = useState('');

    const [incomeAmount, setIncomeAmount] = useState('');
    const [incomeReason, setIncomeReason] = useState('');

    const currentRecords = selectedMonthId !== null ? records.filter(r => {
        const d = new Date(r.date);
        return d.getMonth() === Number(selectedMonthId) &&
            d.getFullYear() === currentYear &&
            r.category !== 'subscription'; // Exclude subscription expenses from this view
    }) : [];

    // Calculate Subscription Income and Count for Selected Month
    const { subscriptionIncome, subscriptionCount } = React.useMemo(() => {
        if (!selectedMonthId || !sections || !payments) return { subscriptionIncome: 0, subscriptionCount: 0 };
        let total = 0;
        let count = 0;
        sections.forEach(section => {
            if (section.players) {
                section.players.forEach(player => {
                    const paymentKey = `${currentYear}_${selectedMonthId}_${player.id}`;
                    const pmt = payments[paymentKey];
                    if (pmt === true || (pmt && pmt.isPaid)) {
                        const amount = (typeof pmt === 'object' && pmt.amount !== undefined) ? Number(pmt.amount) : Number(player.price || 0);
                        total += (amount * 0.2); // Only counts 20%
                        count++;
                    }
                });
            }
        });
        return { subscriptionIncome: total, subscriptionCount: count };
    }, [selectedMonthId, sections, payments, currentYear]);


    // Handlers
    const handleAddExpense = (e) => {
        e.preventDefault();
        if (!expenseAmount || !expenseReason) return;

        const date = new Date(currentYear, Number(selectedMonthId), 1).toISOString();

        onAddRecord({
            type: 'expense',
            amount: Number(expenseAmount),
            reason: expenseReason,
            date: date
        });

        setExpenseAmount('');
        setExpenseReason('');
    };

    const handleAddIncome = (e) => {
        e.preventDefault();
        if (!incomeAmount || !incomeReason) return;

        const date = new Date(currentYear, Number(selectedMonthId), 1).toISOString();

        onAddRecord({
            type: 'income',
            amount: Number(incomeAmount),
            reason: incomeReason,
            date: date
        });

        setIncomeAmount('');
        setIncomeReason('');
    };

    // Delete Confirmation Handlers
    const initiateDelete = (record) => {
        setRecordToDelete(record);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (recordToDelete) {
            onDeleteRecord(recordToDelete.id);
            setRecordToDelete(null);
            setDeleteModalOpen(false);
        }
    };

    const cancelDelete = () => {
        setRecordToDelete(null);
        setDeleteModalOpen(false);
    };

    // Calculate totals for month grid preview (including subscriptions)
    const getMonthTotals = (monthId) => {
        const monthRecords = records.filter(r => {
            const d = new Date(r.date);
            return d.getMonth() === Number(monthId) && d.getFullYear() === currentYear;
        });

        const expense = monthRecords.filter(r => r.type === 'expense' && r.category !== 'subscription').reduce((s, r) => s + Number(r.amount), 0);
        let manualIncome = monthRecords.filter(r => r.type === 'income').reduce((s, r) => s + Number(r.amount), 0);

        // Add Subscription Income for that month
        let subsIncome = 0;
        if (sections && payments) {
            sections.forEach(section => {
                if (section.players) {
                    section.players.forEach(player => {
                        const paymentKey = `${currentYear}_${monthId}_${player.id}`;
                        const pmt = payments[paymentKey];
                        if (pmt === true || (pmt && pmt.isPaid)) {
                            const amount = (typeof pmt === 'object' && pmt.amount !== undefined) ? Number(pmt.amount) : Number(player.price || 0);
                            subsIncome += (amount * 0.2); // Only counts 20%
                        }
                    });
                }
            });
        }

        const totalIncome = manualIncome + subsIncome;
        return { expense, income: totalIncome, profit: totalIncome - expense };
    };

    // Render Month Selection Grid
    if (selectedMonthId === null) {
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
                            boxShadow: 'var(--shadow-sm)',
                            cursor: 'pointer'
                        }}
                    >
                        <ArrowLeft size={20} color="#333" />
                    </button>
                    <h1 className="section-title" style={{ margin: 0, fontSize: '1.2rem' }}>
                        Οικονομική Επισκόπηση {currentYear}
                    </h1>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: '16px',
                    paddingBottom: '20px'
                }}>
                    {Object.entries(months).map(([id, m]) => {
                        const { expense, income, profit } = getMonthTotals(id);
                        return (
                            <div
                                key={id}
                                onClick={() => {
                                    setSelectedMonthId(id);
                                    window.scrollTo(0, 0);
                                }}
                                className="card-glass"
                                style={{
                                    padding: '20px',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                                    color: 'white',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                }}
                            >
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '8px', color: 'white', opacity: 0.9 }}>
                                    {m.name}
                                </div>
                                <div style={{
                                    fontSize: '1.4rem',
                                    fontWeight: '800',
                                    color: profit >= 0 ? '#4ADE80' : '#F87171',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px'
                                }}>
                                    {profit > 0 ? '+' : ''}{Number(profit).toLocaleString('el-GR')}€
                                </div>
                            </div>
                        );
                    })}

                    {/* Year Total Card */}
                    <div
                        onClick={() => navigate('/financial-analysis/year')}
                        className="card-glass"
                        style={{
                            gridColumn: '1 / -1',
                            padding: '24px',
                            borderRadius: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                            color: 'white',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                            marginTop: '16px',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <div style={{ fontSize: '1.2rem', fontWeight: '500', marginBottom: '4px', opacity: 0.9 }}>
                            Οικονομικός Απολογισμός {currentYear}
                        </div>
                        <div style={{
                            fontSize: '2rem',
                            fontWeight: '900',
                            color: (() => {
                                // Calculate Annual Totals using the Props & Records
                                const yearRecords = records.filter(r => new Date(r.date).getFullYear() === currentYear);
                                const totalYearManualIncome = yearRecords.filter(r => r.type === 'income').reduce((s, r) => s + Number(r.amount), 0);
                                const totalYearExpenses = yearRecords.filter(r => r.type === 'expense' && r.category !== 'subscription').reduce((s, r) => s + Number(r.amount), 0);

                                const totalAnnualSubs20 = (totalAnnualSubscriptionIncome || 0) * 0.2;

                                // Total Annual Profit = (Manual Income + 20% Subs) - Expenses
                                const totalAnnualProfit = (totalYearManualIncome + totalAnnualSubs20) - totalYearExpenses;

                                return totalAnnualProfit >= 0 ? '#4ADE80' : '#EF5350';
                            })(),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}>
                            {(() => {
                                const yearRecords = records.filter(r => new Date(r.date).getFullYear() === currentYear);
                                const totalYearManualIncome = yearRecords.filter(r => r.type === 'income').reduce((s, r) => s + Number(r.amount), 0);
                                const totalYearExpenses = yearRecords.filter(r => r.type === 'expense' && r.category !== 'subscription').reduce((s, r) => s + Number(r.amount), 0);
                                const totalAnnualSubs20 = (totalAnnualSubscriptionIncome || 0) * 0.2;
                                const totalAnnualProfit = (totalYearManualIncome + totalAnnualSubs20) - totalYearExpenses;

                                return `${totalAnnualProfit > 0 ? '+' : ''}${Number(totalAnnualProfit).toLocaleString('el-GR')}€`;
                            })()}
                        </div>
                        <div style={{ fontSize: '0.9rem', marginTop: '8px', opacity: 0.7, fontStyle: 'italic' }}>
                            Πατήστε για λεπτομέρειες
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Manual Income Total
    const manualIncomeTotal = currentRecords.filter(r => r.type === 'income').reduce((s, r) => s + Number(r.amount), 0);
    // Total Income = Manual + Subscriptions
    const totalIncome = manualIncomeTotal + subscriptionIncome;
    // Manual Expense Total
    const totalExpenses = currentRecords.filter(r => r.type === 'expense' && r.category !== 'subscription').reduce((s, r) => s + Number(r.amount), 0);
    // Final Balance
    const balance = totalIncome - totalExpenses;

    // Render Details for Selected Month
    return (
        <div className="app-container">
            {/* Delete Confirmation Modal */}
            {deleteModalOpen && recordToDelete && (
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
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}>
                        <h3 style={{ marginTop: 0, color: '#1e293b' }}>Επιβεβαίωση Διαγραφής</h3>
                        <p style={{ color: '#64748B', margin: '16px 0' }}>
                            Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το{' '}
                            <strong>{recordToDelete.type === 'income' ? 'έσοδο' : 'έξοδο'}</strong>;
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={cancelDelete}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: '#E2E8F0',
                                    color: '#475569',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Ακύρωση
                            </button>
                            <button
                                onClick={confirmDelete}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: '#EF4444',
                                    color: 'white',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Διαγραφή
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '24px'
            }}>
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
                        boxShadow: 'var(--shadow-sm)',
                        cursor: 'pointer'
                    }}
                >
                    <ArrowLeft size={20} color="#333" />
                </button>
                <div style={{ flex: 1 }}>
                    <h1 className="section-title" style={{ margin: 0, fontSize: '1.2rem' }}>
                        {months[selectedMonthId]?.name} {currentYear}
                    </h1>
                </div>
            </div>


            {/* Forms Container with Responsive Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
            }}>

                {/* Add Expense Form */}
                <div className="card-glass" style={{ padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', color: '#D32F2F' }}>
                        <div style={{ background: '#FFEBEE', padding: '8px', borderRadius: '50%' }}>
                            <Minus size={20} />
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>Εισαγωγή Εξόδων</h2>
                    </div>
                    <form onSubmit={handleAddExpense} style={{ display: 'grid', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95rem', color: '#64748B', fontWeight: '500' }}>Ποσό (€)</label>
                            <input
                                type="number"
                                value={expenseAmount}
                                onChange={(e) => setExpenseAmount(e.target.value)}
                                placeholder="0"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid #E2E8F0',
                                    background: '#F8FAFC',
                                    fontSize: '1rem',
                                    transition: 'all 0.2s',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#D32F2F'}
                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95rem', color: '#64748B', fontWeight: '500' }}>Αιτιολογία</label>
                            <input
                                type="text"
                                value={expenseReason}
                                onChange={(e) => setExpenseReason(e.target.value)}
                                placeholder="π.χ. Επισκευή στέγης"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid #E2E8F0',
                                    background: '#F8FAFC',
                                    fontSize: '1rem',
                                    transition: 'all 0.2s',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#D32F2F'}
                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            style={{
                                background: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
                                color: '#B71C1C',
                                border: 'none',
                                padding: '14px',
                                borderRadius: '12px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                marginTop: '8px',
                                fontSize: '1rem',
                                transition: 'transform 0.1s',
                                boxShadow: '0 2px 4px rgba(211, 47, 47, 0.1)'
                            }}
                            onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
                            onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                        >
                            Προσθήκη Εξόδου
                        </button>
                    </form>
                </div>

                {/* Add Income Form */}
                <div className="card-glass" style={{ padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', color: '#2E7D32' }}>
                        <div style={{ background: '#E8F5E9', padding: '8px', borderRadius: '50%' }}>
                            <Plus size={20} />
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>Εισαγωγή Εσόδων</h2>
                    </div>
                    <form onSubmit={handleAddIncome} style={{ display: 'grid', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95rem', color: '#64748B', fontWeight: '500' }}>Ποσό (€)</label>
                            <input
                                type="number"
                                value={incomeAmount}
                                onChange={(e) => setIncomeAmount(e.target.value)}
                                placeholder="0"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid #E2E8F0',
                                    background: '#F8FAFC',
                                    fontSize: '1rem',
                                    transition: 'all 0.2s',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#2E7D32'}
                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95rem', color: '#64748B', fontWeight: '500' }}>Αιτιολογία</label>
                            <input
                                type="text"
                                value={incomeReason}
                                onChange={(e) => setIncomeReason(e.target.value)}
                                placeholder="π.χ. Χορηγία Α"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid #E2E8F0',
                                    background: '#F8FAFC',
                                    fontSize: '1rem',
                                    transition: 'all 0.2s',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#2E7D32'}
                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            style={{
                                background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
                                color: '#1B5E20',
                                border: 'none',
                                padding: '14px',
                                borderRadius: '12px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                marginTop: '8px',
                                fontSize: '1rem',
                                transition: 'transform 0.1s',
                                boxShadow: '0 2px 4px rgba(46, 125, 50, 0.1)'
                            }}
                            onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
                            onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                        >
                            Προσθήκη Εσόδου
                        </button>
                    </form>
                </div>

            </div>

            {/* Section Breakdown Card */}
            <div className="card-glass" style={{ padding: '24px', borderRadius: '16px', marginBottom: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.2rem', color: '#1e293b', fontWeight: '700' }}>
                    Ανάλυση Εσόδων ανά Τμήμα (20%)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                    {sections && sections.map(section => {
                        let sectionTotal = 0;
                        if (section.players) {
                            section.players.forEach(player => {
                                const paymentKey = `${currentYear}_${selectedMonthId}_${player.id}`;
                                const pmt = payments[paymentKey];
                                if (pmt === true || (pmt && pmt.isPaid)) {
                                    const amount = (typeof pmt === 'object' && pmt.amount !== undefined) ? Number(pmt.amount) : Number(player.price || 0);
                                    sectionTotal += amount;
                                }
                            });
                        }

                        if (sectionTotal === 0) return null;

                        const clubShare = sectionTotal * 0.2;

                        return (
                            <div key={section.id} style={{
                                padding: '16px',
                                borderRadius: '12px',
                                background: '#F8FAFC',
                                border: '1px solid #E2E8F0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontWeight: '600', color: '#334155' }}>{section.title}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Σύνολο: {sectionTotal.toLocaleString('el-GR')}€</div>
                                </div>
                                <div style={{ fontWeight: '700', color: '#15803d', fontSize: '1.1rem' }}>
                                    +{clubShare.toLocaleString('el-GR')}€
                                </div>
                            </div>
                        );
                    })}
                </div>
                {(!sections || sections.every(s => {
                    let t = 0;
                    if (s.players) {
                        s.players.forEach(p => {
                            const k = `${currentYear}_${selectedMonthId}_${p.id}`;
                            const v = payments[k];
                            if (v === true || (v && v.isPaid)) t++;
                        });
                    }
                    return t === 0;
                })) && (
                        <div style={{ textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', padding: '10px' }}>
                            Δεν υπάρχουν εισπράξεις συνδρομών για αυτόν τον μήνα.
                        </div>
                    )}
            </div>

            {/* Recent Transactions List & Summary */}
            <div className="card-glass" style={{ padding: '24px', borderRadius: '16px', marginBottom: '40px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.2rem', color: '#1e293b', fontWeight: '700' }}>
                    Αναλυτική Κίνηση {months[selectedMonthId]?.name}
                </h3>

                {currentRecords.length > 0 ? (
                    <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
                        {currentRecords.map(record => (
                            <div key={record.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '16px',
                                background: '#f8fafc',
                                borderRadius: '12px',
                                borderLeft: `5px solid ${record.type === 'income' ? '#4CAF50' : '#F44336'}`,
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}>
                                <div>
                                    <div style={{ fontWeight: '600', color: '#333', fontSize: '1rem' }}>{record.reason}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>
                                        {new Date(record.date).toLocaleDateString('el-GR')}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <span style={{
                                        fontWeight: '800',
                                        fontSize: '1.1rem',
                                        color: record.type === 'income' ? '#2E7D32' : '#C62828'
                                    }}>
                                        {record.type === 'income' ? '+' : '-'}{Number(record.amount).toLocaleString('el-GR')}€
                                    </span>
                                    <button
                                        onClick={() => initiateDelete(record)}
                                        style={{
                                            background: '#FEF2F2',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            marginLeft: '12px'
                                        }}
                                    >
                                        <Trash2 size={16} color="#EF4444" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', fontStyle: 'italic' }}>
                        Δεν υπάρχουν καταχωρήσεις για αυτόν τον μήνα.
                    </div>
                )}

                {/* Monthly Summary Footer - Refined Layout */}
                <div style={{
                    marginTop: '24px',
                    paddingTop: '24px',
                    borderTop: '2px solid #e2e8f0',
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '32px'
                    }}>
                        {/* Income Section */}
                        <div style={{ background: '#F0FDF4', padding: '16px', borderRadius: '12px', border: '1px solid #DCFCE7' }}>
                            <h4 style={{ margin: '0 0 12px 0', color: '#166534', fontSize: '1rem', borderBottom: '1px solid #BBF7D0', paddingBottom: '8px' }}>
                                Ανάλυση Εσόδων
                            </h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#15803d' }}>
                                <span>Από Συνδρομές ({subscriptionCount}) - (20%):</span>
                                <span>{subscriptionIncome.toLocaleString('el-GR')}€</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#15803d' }}>
                                <span>Άλλες Πηγές:</span>
                                <span>{manualIncomeTotal.toLocaleString('el-GR')}€</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: '12px',
                                paddingTop: '8px',
                                borderTop: '1px dashed #86EFAC',
                                fontWeight: '700',
                                color: '#14532D',
                                fontSize: '1.1rem'
                            }}>
                                <span>Σύνολο Εσόδων:</span>
                                <span>+{totalIncome.toLocaleString('el-GR')}€</span>
                            </div>
                        </div>

                        {/* Expenses Section */}
                        <div style={{ background: '#FEF2F2', padding: '16px', borderRadius: '12px', border: '1px solid #FECACA' }}>
                            <h4 style={{ margin: '0 0 12px 0', color: '#991B1B', fontSize: '1rem', borderBottom: '1px solid #FECACA', paddingBottom: '8px' }}>
                                Ανάλυση Εξόδων
                            </h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#B91C1C' }}>
                                <span>Λειτουργικά & Άλλα:</span>
                                <span>{totalExpenses.toLocaleString('el-GR')}€</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: 'auto',
                                paddingTop: '36px', // Push to match height roughly or just spaced
                                borderTop: '1px dashed #FCA5A5',
                                fontWeight: '700',
                                color: '#7F1D1D',
                                fontSize: '1.1rem'
                            }}>
                                <span>Σύνολο Εξόδων:</span>
                                <span>-{totalExpenses.toLocaleString('el-GR')}€</span>
                            </div>
                        </div>

                        {/* Net Result Section */}
                        <div style={{
                            background: '#F8FAFC',
                            padding: '16px',
                            borderRadius: '12px',
                            border: '1px solid #E2E8F0',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '1rem', color: '#64748B', marginBottom: '8px', fontWeight: '600' }}>
                                Τελικό Υπόλοιπο Μήνα
                            </div>
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: '900',
                                color: balance >= 0 ? '#166534' : '#DC2626',
                                textShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}>
                                {balance > 0 ? '+' : ''}{balance.toLocaleString('el-GR')}€
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '4px' }}>
                                (Έσοδα - Έξοδα)
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialDetails;
