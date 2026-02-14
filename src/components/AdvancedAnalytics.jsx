import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Award, DollarSign } from 'lucide-react';
import { months } from '../data/constants';

const AdvancedAnalytics = ({ sections, payments, currentYear }) => {

    // 1. Calculate Monthly Revenue for the entire year
    const monthlyRevenueData = useMemo(() => {
        // Initialize months 0-11 with 0 revenue
        const data = months.map((m, index) => ({
            name: m.name.substring(0, 3), // Short name
            fullName: m.name,
            monthId: String(index),
            amount: 0,
            expected: 0
        }));

        if (!sections) return data;

        // Calculate Totals
        sections.forEach(section => {
            if (!section.players) return;
            section.players.forEach(player => {
                const price = Number(player.price || 0);
                // For each month, check payment
                monthlyRevenueData.forEach(monthData => {
                    // key: YEAR_MONTH_PLAYERID
                    const key = `${currentYear}_${monthData.monthId}_${player.id}`;
                    if (payments[key]) {
                        monthData.amount += price;
                    }
                    monthData.expected += price;
                });
            });
        });

        return data;
    }, [sections, payments, currentYear]);

    // 2. Calculate Section Performance (Percentage Paid for CURRENT MONTH? Or Annual?)
    // Let's do Annual Average for "Best Section" award
    const sectionPerformance = useMemo(() => {
        if (!sections) return [];

        return sections.map(section => {
            let totalPaid = 0;
            let totalExpected = 0;

            if (section.players) {
                section.players.forEach(player => {
                    const price = Number(player.price || 0);
                    // Check all 12 months
                    for (let m = 0; m < 12; m++) {
                        const key = `${currentYear}_${m}_${player.id}`;
                        if (payments[key]) {
                            totalPaid += price;
                        }
                        totalExpected += price;
                    }
                });
            }

            const percentage = totalExpected > 0 ? (totalPaid / totalExpected) * 100 : 0;
            return {
                id: section.id,
                name: section.title,
                percentage,
                totalPaid
            };
        }).sort((a, b) => b.percentage - a.percentage); // Descending
    }, [sections, payments, currentYear]);

    const topSection = sectionPerformance.length > 0 ? sectionPerformance[0] : null;

    return (
        <div className="analytics-container">
            <div className="chart-card">
                <div className="card-header">
                    <TrendingUp size={20} className="icon-blue" />
                    <h3>Ετήσια Πρόοδος Εσόδων ({currentYear})</h3>
                </div>
                <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#888', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#888', fontSize: 12 }}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                                {monthlyRevenueData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.amount > 0 ? '#1976D2' : '#E0E0E0'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="stats-grid">
                {/* Top Section Card */}
                <div className="stat-highlight-card">
                    <div className="icon-circle bg-orange">
                        <Award size={24} color="#F57C00" />
                    </div>
                    <div className="stat-content">
                        <span className="label">Κορυφαίο Τμήμα</span>
                        <span className="value">{topSection ? topSection.name : '-'}</span>
                        <span className="sub">{topSection ? `${topSection.percentage.toFixed(1)}% Εξόφληση` : ''}</span>
                    </div>
                </div>

                {/* Total Annual Revenue */}
                <div className="stat-highlight-card">
                    <div className="icon-circle bg-green">
                        <DollarSign size={24} color="#388E3C" />
                    </div>
                    <div className="stat-content">
                        <span className="label">Σύνολο Έτους</span>
                        <span className="value">
                            {monthlyRevenueData.reduce((acc, curr) => acc + curr.amount, 0)}€
                        </span>
                        <span className="sub">Εισπράξεις {currentYear}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedAnalytics;
