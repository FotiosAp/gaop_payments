import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { api } from '../api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [sections, setSections] = useState([]);
  const [payments, setPayments] = useState({});
  const [financialRecords, setFinancialRecords] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  const [currentMonthId, setCurrentMonthId] = useState(() => String(new Date().getMonth()));
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());

  const fetchData = async () => {
    try {
      const data = await api.init();
      setSections(data.sections || []);
      setPayments(data.payments || {});
      setFinancialRecords(data.records || []);
      setSettings(data.settings || {});
      setLoading(false);
    } catch (err) {
      console.warn("Init Error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Check current session on mount
    api.getSession().then(session => {
        setSession(session);
        if (session) {
            fetchData();
        } else {
            setLoading(false);
        }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = api.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session) {
            fetchData();
        }
    });

    return () => subscription.unsubscribe();
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
  const handleAddPlayer = async (sectionId, playerData) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const newPlayer = {
      ...playerData,
      id: Date.now().toString(),
      price: Number(playerData.price || settings.default_price || 50),
      parentName: playerData.parent
    };

    const updatedSection = {
      ...section,
      players: [...(section.players || []), newPlayer]
    };

    try {
      await api.updateSection(updatedSection);
      updateSectionState(updatedSection);
    } catch (e) {
      console.error("Add failed", e);
      throw e;
    }
  };

  const handleUpdateSection = async (updatedSection) => {
    try {
      await api.updateSection(updatedSection);
      updateSectionState(updatedSection);
    } catch (e) {
      console.error("Update section failed", e);
      throw e;
    }
  };

  const handleDeletePlayer = async (sectionId, playerId) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    const updatedSection = {
      ...section,
      players: (section.players || []).filter(p => p.id !== playerId)
    };
    try {
      await api.updateSection(updatedSection);
      updateSectionState(updatedSection);
    } catch (e) {
      console.error("Del failed", e);
      throw e;
    }
  };

  const handleUpdatePlayer = async (sectionId, playerId, updates) => {
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
    try {
      await api.updateSection(updatedSection);
      updateSectionState(updatedSection);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const handleSetPayment = async (monthId, targetYear, playerId, status) => {
    const key = `${targetYear}_${monthId}_${playerId}`;

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
    try {
      await api.setPayment(payload);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const handleAddRecord = async (r) => {
    try {
      const newR = await api.addRecord(r);
      setFinancialRecords(p => [newR, ...p]);
      return newR;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const handleDeleteRecord = async (id) => {
    try {
      await api.deleteRecord(id);
      setFinancialRecords(p => p.filter(x => x.id !== id));
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      setSession(null); // Force sync
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  // --- STATS: MONTHLY ---
  const stats = useMemo(() => {
    try {
      let expected = 0, collected = 0;

      if (enrichedSections) {
        enrichedSections.forEach(s => {
          if (s && s.players) {
            s.players.forEach(p => {
              if (!p) return;
              const price = Number(p.price || 0);

              if (price > 0 && p.id) {
                const isSummerMonth = currentMonthId === '6' || currentMonthId === '7';
                if (!(isSummerMonth && !s.hasSummerPrep)) {
                  expected += price;
                }

                const key = `${currentYear}_${currentMonthId}_${p.id}`;
                const pmt = payments && payments[key];

                if (pmt) {
                  const actualAmount = (typeof pmt === 'object' && pmt.amount !== undefined) ? Number(pmt.amount) : price;
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

  const financialStats = useMemo(() => {
    try {
      if (!financialRecords) return { totalExpenses: 0, extraIncome: 0, subscriptionExpenses: 0 };
      const monthRecords = financialRecords.filter(r => {
        const d = new Date(r.date);
        return d.getFullYear() === currentYear && d.getMonth() === Number(currentMonthId);
      });
      const exp = monthRecords.filter(r => r.type === 'expense' && r.category !== 'subscription').reduce((s, r) => s + Number(r.amount || 0), 0);
      const inc = monthRecords.filter(r => r.type === 'income').reduce((s, r) => s + Number(r.amount || 0), 0);
      const subExp = monthRecords.filter(r => r.type === 'expense' && r.category === 'subscription').reduce((s, r) => s + Number(r.amount || 0), 0);
      return { totalExpenses: exp, extraIncome: inc, subscriptionExpenses: subExp };
    } catch (e) {
      console.warn("Financial Stats Error:", e);
      return { totalExpenses: 0, extraIncome: 0, subscriptionExpenses: 0 };
    }
  }, [financialRecords, currentYear, currentMonthId]);

  const totalAnnualSubscriptionIncome = useMemo(() => {
    try {
      if (!enrichedSections || !payments) return 0;
      let total = 0;
      (settings.months || []).forEach(m => {
        enrichedSections.forEach(s => {
          if (s.players) {
            s.players.forEach(p => {
              const key = `${currentYear}_${m.id}_${p.id}`;
              const pmt = payments[key];
              if (pmt === true || (pmt && pmt.isPaid)) {
                const actualAmount = (typeof pmt === 'object' && pmt.amount !== undefined) ? Number(pmt.amount) : Number(p.price || 0);
                total += actualAmount;
              }
            });
          }
        });
      });
      return total;
    } catch (e) {
      console.warn("Annual Subs Error:", e);
      return 0;
    }
  }, [enrichedSections, payments, currentYear, settings.months]);

  const value = {
    sections: enrichedSections,
    payments,
    financialRecords,
    settings,
    loading,
    session,
    currentMonthId,
    setCurrentMonthId,
    currentYear,
    setCurrentYear,
    months: settings.months || [],
    role: session?.user?.user_metadata?.role || 'manager',
    
    // Stats
    ...stats,
    ...financialStats,
    totalAnnualSubscriptionIncome,

    // Handlers
    onAddPlayer: handleAddPlayer,
    onDeletePlayer: handleDeletePlayer,
    onUpdatePlayer: handleUpdatePlayer,
    onUpdateSection: handleUpdateSection,
    onSetPayment: handleSetPayment,
    onAddRecord: handleAddRecord,
    onDeleteRecord: handleDeleteRecord,
    onLogout: handleLogout
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
