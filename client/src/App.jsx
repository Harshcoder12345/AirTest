import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import ManagerDashboard from './pages/ManagerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AuditLogTable from './components/AuditLogTable';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <p>Initializing CertiVoucher Portal...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main>
        {activeTab === 'history' ? (
          <AuditLogTable />
        ) : user.role === 'manager' ? (
          <ManagerDashboard />
        ) : (
          <EmployeeDashboard />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
