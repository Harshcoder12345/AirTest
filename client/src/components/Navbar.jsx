import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Award, LogOut, User, ShieldCheck, History, LayoutDashboard } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  return (
    <header className="glass-panel navbar">
      <div className="brand">
        <div className="brand-icon">
          <Award size={22} />
        </div>
        <span>CertiVoucher</span>
      </div>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <nav style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <LayoutDashboard size={15} />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <History size={15} />
              Audit Log
            </button>
          </nav>

          <div className="user-badge">
            <User size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{user.name}</span>
            <span className={`role-pill ${user.role}`}>
              {user.role === 'manager' ? 'Manager' : 'Employee'}
            </span>
          </div>

          <button onClick={logout} className="btn btn-secondary" title="Sign Out">
            <LogOut size={15} />
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
