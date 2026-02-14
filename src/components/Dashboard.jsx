import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ totalExpected, totalCollected, totalRemaining, totalExpenses = 0, extraIncome = 0 }) => {
    const navigate = useNavigate();

    // Calculate Total Income (20% of Subscriptions + Extra Manual Income)
    const subscriptionContribution = totalCollected * 0.2;
    const totalIncome = subscriptionContribution + extraIncome;
    const profit = totalIncome - totalExpenses;

    // Subscription Stats (80% View)
    const collected80 = totalCollected * 0.8;
    const remaining80 = totalRemaining * 0.8;
    const expected80 = totalExpected * 0.8;

    // Calculate percentages (Percentages remain the same mathematically)
    const paidPercentage = totalExpected > 0
        ? Math.round((totalCollected / totalExpected) * 100)
        : 0;

    // For visualization, remaining % relative to total
    const remainingPercentage = totalExpected > 0
        ? Math.round((totalRemaining / totalExpected) * 100)
        : 0;

    return (
        <div className="dashboard">
            {/* Left Card: Financial Analysis (With 3 circles for all metrics) */}
            <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ marginBottom: '20px', fontWeight: '600', color: '#555', fontSize: '1rem' }}>
                    Οικονομική Ανάλυση Συνδρομών (80%)
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', gap: '12px' }}>

                    {/* Circle 1: Collected */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div
                            className="circular-chart"
                            style={{
                                '--percent': `${paidPercentage}%`,
                                '--color-primary': '#4CAF50', // Green
                                width: '70px',
                                height: '70px'
                            }}
                        >
                            <div className="circular-content" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                                {paidPercentage}%
                            </div>
                        </div>
                        <div style={{ fontWeight: '700', fontSize: '1.1rem', marginTop: '8px', color: '#2E7D32' }}>
                            {Number(collected80).toLocaleString('el-GR')}€
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Εισπράξεις</div>
                    </div>

                    {/* Circle 2: Remaining */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div
                            className="circular-chart"
                            style={{
                                '--percent': `${remainingPercentage}%`,
                                '--color-primary': '#D32F2F', // Red
                                width: '70px',
                                height: '70px'
                            }}
                        >
                            <div className="circular-content" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                                {remainingPercentage}%
                            </div>
                        </div>
                        <div style={{ fontWeight: '700', fontSize: '1.1rem', marginTop: '8px', color: '#C62828' }}>
                            {Number(remaining80).toLocaleString('el-GR')}€
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Υπόλοιπο</div>
                    </div>

                    {/* Circle 3: Total (Always 100%) */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div
                            className="circular-chart"
                            style={{
                                '--percent': '100%',
                                '--color-primary': '#1976D2', // Blue
                                width: '70px',
                                height: '70px'
                            }}
                        >
                            <div className="circular-content" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                                100%
                            </div>
                        </div>
                        <div style={{ fontWeight: '700', fontSize: '1.1rem', marginTop: '8px', color: '#1565C0' }}>
                            {Number(expected80).toLocaleString('el-GR')}€
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Σύνολο</div>
                    </div>

                </div>

                <div style={{ marginTop: '20px', marginBottom: '10px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <button
                        onClick={() => navigate('/subscription-analysis')}
                        style={{
                            background: '#1976D2', // Blue
                            border: 'none',
                            borderRadius: '20px',
                            padding: '8px 20px', // Larger padding
                            fontSize: '0.9rem', // Larger font
                            color: 'white',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 4px rgba(25, 118, 210, 0.3)'
                        }}
                    >
                        Λεπτομέρειες
                    </button>
                </div>
            </div>

            {/* Right Card: Main Percentage (Overview) */}
            <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ marginBottom: '20px', fontWeight: '600', color: '#555', fontSize: '1rem' }}>
                    Οικονομική Ανάλυση Γενικών Εσόδων / Εξόδων
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', alignItems: 'center', padding: '10px 0' }}>

                    {/* General Income */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '4px' }}>Έσοδα</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#2E7D32' }}>
                            {Number(totalIncome).toLocaleString('el-GR')}€
                        </div>
                    </div>

                    <div style={{ width: '1px', height: '40px', background: '#E2E8F0' }}></div>

                    {/* Expenses */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '4px' }}>Έξοδα</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#D32F2F' }}>
                            {Number(totalExpenses).toLocaleString('el-GR')}€
                        </div>
                    </div>

                    <div style={{ width: '1px', height: '40px', background: '#E2E8F0' }}></div>

                    {/* Profit */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '4px' }}>Ταμείο</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '800', color: profit >= 0 ? '#2E7D32' : '#D32F2F' }}>
                            {Number(profit).toLocaleString('el-GR')}€
                        </div>
                    </div>

                </div>

                <div style={{ marginTop: '20px', marginBottom: '10px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <button
                        onClick={() => navigate('/financial-analysis')}
                        style={{
                            background: '#1976D2', // Blue
                            border: 'none',
                            borderRadius: '20px',
                            padding: '8px 20px', // Larger padding
                            fontSize: '0.9rem', // Larger font
                            color: 'white',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 4px rgba(25, 118, 210, 0.3)'
                        }}
                    >
                        Λεπτομέρειες
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
