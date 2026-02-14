import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import MonthView from './pages/MonthView';
import SectionDetail from './pages/SectionDetail';
import DepartmentMonths from './pages/DepartmentMonths';

import FinancialDetails from './pages/FinancialDetails';
import AnnualFinancialReport from './pages/AnnualFinancialReport';
import SubscriptionDetails from './pages/SubscriptionDetails';

import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { api } from './api';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error(error, errorInfo); }
  render() {
    if (this.state.hasError) return <div style={{ color: 'red' }}><h1>App Error</h1><pre>{this.state.error?.toString()}</pre></div>;
    return this.props.children;
  }
}

function App() {
  const [sections, setSections] = useState([]);
  const [payments, setPayments] = useState({});
  const [financialRecords, setFinancialRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentMonthId, setCurrentMonthId] = useState(() => String(new Date().getMonth()));
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());

  useEffect(() => {
    if (window.location.pathname === '/login') {
      setLoading(false);
      return;
    }
    api.init()
      .then(data => {
        setSections(data.sections || []);
        setPayments(data.payments || {});
        setFinancialRecords(data.records || []);
        setLoading(false);
      })
      .catch(err => {
        console.warn("Init Error:", err);
        setLoading(false);
      });
  }, []);

  const updateSectionState = (updatedSection) => {
    setSections(prev => prev.map(sec => sec.id === updatedSection.id ? updatedSection : sec));
  };

  const enrichedSections = useMemo(() => {
    return (sections || []).map(section => ({
      ...section,
      players: (section.players || []).map(player => ({
        ...player,
        price: player.price !== undefined ? Number(player.price) : 50,
        parentName: player.parentName || player.parent
      }))
    }));
  }, [sections]);

  // Handlers
  const handleAddPlayer = (sectionId, playerData) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const newPlayer = {
      ...playerData,
      id: Date.now().toString(),
      price: Number(playerData.price || 50),
      parentName: playerData.parent
    };

    const updatedSection = {
      ...section,
      players: [...(section.players || []), newPlayer]
    };

    api.updateSection(updatedSection)
      .then(() => updateSectionState(updatedSection))
      .catch(e => console.error("Add failed", e));
  };

  const handleDeletePlayer = (sectionId, playerId) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    const updatedSection = {
      ...section,
      players: (section.players || []).filter(p => p.id !== playerId)
    };
    api.updateSection(updatedSection)
      .then(() => updateSectionState(updatedSection))
      .catch(e => console.error("Del failed", e));
  };

  const handleUpdatePlayer = (sectionId, playerId, updates) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    const updatedSection = {
      ...section,
      players: section.players.map(p => {
        if (p.id === playerId) {
          const newP = { ...p, ...updates };
          if (updates.manualPrice !== undefined) {
            newP.price = updates.manualPrice;
            delete newP.manualPrice;
          }
          return newP;
        }
        return p;
      })
    };
    api.updateSection(updatedSection)
      .then(() => updateSectionState(updatedSection))
      .catch(e => console.error(e));
  };

  const handleSetPayment = (monthId, playerId, status) => {
    const key = `${currentYear}_${monthId}_${playerId}`;

    // Calculate Amount (Default to Price if not in DB yet)
    let amountToSave = 0;
    if (status) {
      sections.forEach(s => {
        const p = s.players?.find(pl => pl.id === playerId);
        if (p) amountToSave = p.price || 50;
      });
    }

    setPayments(prev => {
      const n = { ...prev };
      if (status) {
        n[key] = { isPaid: true, amount: amountToSave };
      } else {
        delete n[key];
      }
      return n;
    });

    let payload = { key, isPaid: status };
    if (status) {
      for (const s of sections) {
        const p = s.players?.find(pl => pl.id === playerId);
        if (p) {
          payload = {
            key,
            isPaid: true,
            athleteName: p.name,
            parentName: p.parentName || p.parent || "Unknown",
            department: s.name || s.title,
            amount: p.price || 50
          };
          break;
        }
      }
    }
    api.setPayment(payload).catch(e => console.error(e));
  };

  const handleAddRecord = (r) => {
    return api.addRecord(r).then(newR => setFinancialRecords(p => [newR, ...p])).catch(console.error);
  };
  const handleDeleteRecord = (id) => {
    return api.deleteRecord(id).then(() => setFinancialRecords(p => p.filter(x => x.id !== id))).catch(console.error);
  };

  // --- STATS: ANNUAL (Real-Time DB Amount Sync) ---
  // --- STATS: MONTHLY (Real-Time DB Amount Sync) ---
  const { totalExpected, totalCollected, totalRemaining } = useMemo(() => {
    try {
      let expected = 0, collected = 0;

      if (enrichedSections) {
        enrichedSections.forEach(s => {
          if (s && s.players) {
            s.players.forEach(p => {
              if (!p) return;
              const price = Number(p.price || 0);

              if (price > 0 && p.id) {
                // Expected for THIS month
                expected += price;

                // Collected for THIS month
                const key = `${currentYear}_${currentMonthId}_${p.id}`;
                const pmt = payments && payments[key];

                if (pmt) {
                  // Use Actual DB Amount if available, otherwise fallback to price
                  const actualAmount = (typeof pmt === 'object' && pmt.amount !== undefined) ? Number(pmt.amount) : price;

                  // Only count as collected if isPaid is true (or object implies true)
                  if (pmt === true || pmt.isPaid) {
                    collected += actualAmount;
                  }
                }
              }
            });
          }
        });
      }
      return { totalExpected: expected, totalCollected: collected, totalRemaining: expected - collected };
    } catch (e) {
      console.warn("Stats Error:", e);
      return { totalExpected: 0, totalCollected: 0, totalRemaining: 0 };
    }
  }, [enrichedSections, payments, currentYear, currentMonthId]);

  const { totalExpenses, extraIncome } = useMemo(() => {
    try {
      if (!financialRecords) return { totalExpenses: 0, extraIncome: 0 };
      const monthRecords = financialRecords.filter(r => {
        const d = new Date(r.date);
        return d.getFullYear() === currentYear && d.getMonth() === Number(currentMonthId);
      });
      const exp = monthRecords.filter(r => r.type === 'expense' && r.category !== 'subscription').reduce((s, r) => s + Number(r.amount || 0), 0);
      const inc = monthRecords.filter(r => r.type === 'income').reduce((s, r) => s + Number(r.amount || 0), 0);
      return { totalExpenses: exp, extraIncome: inc };
    } catch (e) {
      console.warn("Financial Stats Error:", e);
      return { totalExpenses: 0, extraIncome: 0 };
    }
  }, [financialRecords, currentYear, currentMonthId]);

  // --- STATS: ANNUAL SUBSCRIPTIONS (For Financial Report) ---
  const totalAnnualSubscriptionIncome = useMemo(() => {
    try {
      if (!enrichedSections || !payments) return 0;
      let total = 0;
      for (let m = 0; m < 12; m++) {
        enrichedSections.forEach(s => {
          if (s.players) {
            s.players.forEach(p => {
              const key = `${currentYear}_${m}_${p.id}`;
              const pmt = payments[key];
              if (pmt === true || (pmt && pmt.isPaid)) {
                const actualAmount = (typeof pmt === 'object' && pmt.amount !== undefined) ? Number(pmt.amount) : Number(p.price || 0);
                total += actualAmount;
              }
            });
          }
        });
      }
      return total;
    } catch (e) {
      console.warn("Annual Subs Error:", e);
      return 0;
    }
  }, [enrichedSections, payments, currentYear]);


  if (loading) return <div>Loading App...</div>;

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Home
                role={localStorage.getItem('gaop_role')}
                sections={enrichedSections || []}
                payments={payments || {}}
                currentMonthId={currentMonthId}
                currentYear={currentYear}

                totalExpected={totalExpected}
                totalCollected={totalCollected}
                totalRemaining={totalRemaining}
                totalExpenses={totalExpenses}
                extraIncome={extraIncome}

                // Pass Debug Info to Home to Display
                // debugInfo={`Probe: `}

                setCurrentMonthId={setCurrentMonthId}
                setCurrentYear={setCurrentYear}
                onAddPlayer={handleAddPlayer}
                onDeletePlayer={handleDeletePlayer}
              />
            </ProtectedRoute>
          } />

          <Route path="/month/:monthId" element={
            <ProtectedRoute>
              <MonthView sections={enrichedSections} payments={payments} currentYear={currentYear} />
            </ProtectedRoute>
          } />

          <Route path="/month/:monthId/section/:id" element={
            <ProtectedRoute>
              <SectionDetail
                sections={enrichedSections}
                payments={payments}
                currentYear={currentYear}
                onSetPayment={handleSetPayment}
                onUpdatePlayer={handleUpdatePlayer}
              />
            </ProtectedRoute>
          } />

          <Route path="/department/:sectionId/months" element={
            <ProtectedRoute>
              <DepartmentMonths sections={enrichedSections} payments={payments} currentYear={currentYear} />
            </ProtectedRoute>
          } />

          <Route path="/financial-analysis" element={
            <ProtectedRoute>
              <FinancialDetails
                records={financialRecords}
                onAddRecord={handleAddRecord}
                onDeleteRecord={handleDeleteRecord}
                currentYear={currentYear}
                sections={enrichedSections}
                payments={payments}
                totalAnnualSubscriptionIncome={totalAnnualSubscriptionIncome}
              />
            </ProtectedRoute>
          } />

          <Route path="/financial-analysis/year" element={
            <ProtectedRoute>
              <AnnualFinancialReport
                records={financialRecords}
                financialRecords={financialRecords}
                payments={payments}
                sections={enrichedSections}
                currentYear={currentYear}
              />
            </ProtectedRoute>
          } />

          <Route path="/subscription-analysis" element={
            <ProtectedRoute>
              <SubscriptionDetails
                sections={enrichedSections || []}
                payments={payments || {}}
                currentYear={currentYear}
                records={financialRecords}
                onAddRecord={handleAddRecord}
                onDeleteRecord={handleDeleteRecord}
              />
            </ProtectedRoute>
          } />

          <Route path="*" element={<div>Page Not Found <a href="/">Home</a></div>} />

        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
