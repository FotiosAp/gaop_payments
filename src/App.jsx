import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import MonthView from './pages/MonthView';
import SectionDetail from './pages/SectionDetail';
import DepartmentMonths from './pages/DepartmentMonths';
import FinancialDetails from './pages/FinancialDetails';
import AnnualFinancialReport from './pages/AnnualFinancialReport';
import SubscriptionDetails from './pages/SubscriptionDetails';
import LoginPage from './pages/LoginPage';
import MainLayout from './components/layout/MainLayout';
import { useAppContext } from './context/AppContext';

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
  const { loading } = useAppContext();

  if (loading) return <div>Loading App...</div>;

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes inside MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/month/:monthId" element={<MonthView />} />
            <Route path="/month/:monthId/section/:id" element={<SectionDetail />} />
            <Route path="/month/:monthId/year/:year/section/:id" element={<SectionDetail />} />
            <Route path="/department/:sectionId/months" element={<DepartmentMonths />} />
            <Route path="/financial-analysis" element={<FinancialDetails />} />
            <Route path="/financial-analysis/year" element={<AnnualFinancialReport />} />
            <Route path="/subscription-analysis" element={<SubscriptionDetails />} />
          </Route>

          <Route path="*" element={<div>Page Not Found <a href="/">Home</a></div>} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
