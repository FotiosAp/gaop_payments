import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import ProtectedRoute from '../auth/ProtectedRoute';

const MainLayout = () => {
  return (
    <ProtectedRoute>
      <div className="main-layout">
        <div className="app-container" style={{ paddingBottom: 0 }}>
          <Header />
        </div>
        <main className="app-container" style={{ paddingTop: 0 }}>
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default MainLayout;
