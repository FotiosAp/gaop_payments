import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppContext } from '../../../context/AppContext';
import styles from './Dashboard.module.css';

const Dashboard = () => {
    const { 
        totalExpected, totalCollected, totalRemaining, 
        totalExpenses, extraIncome, subscriptionExpenses 
    } = useAppContext();
    const navigate = useNavigate();

    // Calculate Total Income (20% of Subscriptions + Extra Manual Income)
    const subscriptionContribution = totalCollected * 0.2;
    const totalIncome = subscriptionContribution + extraIncome;
    const profit = totalIncome - totalExpenses;

    // Subscription Stats (80% View)
    const collected80 = totalCollected * 0.8;
    const remaining80 = totalRemaining * 0.8;

    // Calculate percentages
    const paidPercentage = totalExpected > 0
        ? Math.round((totalCollected / totalExpected) * 100)
        : 0;

    const remainingPercentage = totalExpected > 0
        ? Math.round((totalRemaining / totalExpected) * 100)
        : 0;

    // Calculate Profit for 80% View
    const profit80 = collected80 - subscriptionExpenses;
    const profit80Percentage = collected80 > 0
        ? Math.max(0, Math.round((profit80 / collected80) * 100))
        : 0;

    return (
        <div className={styles.dashboard}>
            {/* Left Card: Financial Analysis */}
            <div className={styles.statCard}>
                <div style={{ marginBottom: '20px', fontWeight: '600', color: '#555', fontSize: '1rem' }}>
                    Οικονομική Ανάλυση Συνδρομών (80%)
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', gap: '12px' }}>

                    {/* Circle 1: Collected */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div
                            className={styles.circularChart}
                            style={{
                                '--percent': `${paidPercentage}%`,
                                '--color-primary': '#4CAF50', // Green
                                width: '70px',
                                height: '70px'
                            }}
                        >
                            <div className={styles.circularContent} style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
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
                            className={styles.circularChart}
                            style={{
                                '--percent': `${remainingPercentage}%`,
                                '--color-primary': '#D32F2F', // Red
                                width: '70px',
                                height: '70px'
                            }}
                        >
                            <div className={styles.circularContent} style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                                {remainingPercentage}%
                            </div>
                        </div>
                        <div style={{ fontWeight: '700', fontSize: '1.1rem', marginTop: '8px', color: '#C62828' }}>
                            {Number(remaining80).toLocaleString('el-GR')}€
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Υπόλοιπο</div>
                    </div>

                    {/* Circle 3: Profit */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div
                            className={styles.circularChart}
                            style={{
                                '--percent': `${profit80Percentage}%`,
                                '--color-primary': profit80 >= 0 ? '#1976D2' : '#D32F2F',
                                width: '70px',
                                height: '70px'
                            }}
                        >
                            <div className={styles.circularContent} style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                                {profit80Percentage}%
                            </div>
                        </div>
                        <div style={{ fontWeight: '700', fontSize: '1.1rem', marginTop: '8px', color: profit80 >= 0 ? '#1565C0' : '#C62828' }}>
                            {Number(profit80).toLocaleString('el-GR')}€
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Κέρδος</div>
                    </div>

                </div>

                <div style={{ marginTop: '20px', marginBottom: '10px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <button
                        onClick={() => navigate('/subscription-analysis', { state: { category: 'trainer' } })}
                        style={{
                            background: '#1976D2',
                            border: 'none',
                            borderRadius: '20px',
                            padding: '8px 20px',
                            fontSize: '0.9rem',
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

            {/* Right Card: Overview */}
            <div className={styles.statCard}>
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
                        onClick={() => navigate('/financial-analysis', { state: { category: 'admin' } })}
                        style={{
                            background: '#1976D2',
                            border: 'none',
                            borderRadius: '20px',
                            padding: '8px 20px',
                            fontSize: '0.9rem',
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
