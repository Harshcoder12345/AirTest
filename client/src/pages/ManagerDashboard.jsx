import React, { useState, useEffect } from 'react';
import api from '../services/api';
import VoucherCard from '../components/VoucherCard';
import AssignModal from '../components/AssignModal';
import CreateVoucherModal from '../components/CreateVoucherModal';
import {
  Award,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Layers,
  Send,
  AlertTriangle,
} from 'lucide-react';

const ManagerDashboard = () => {
  const [stats, setStats] = useState({ total: 0, available: 0, assigned: 0, redeemed: 0, revoked: 0, expired: 0 });
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVouchers, setTotalVouchers] = useState(0);

  const [selectedVoucherForAssign, setSelectedVoucherForAssign] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [alert, setAlert] = useState(null); // { type: 'error' | 'success', message: '' }
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [statusFilter, categoryFilter, search, page]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/vouchers/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      let url = `/vouchers?page=${page}&limit=9`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (categoryFilter) url += `&category=${encodeURIComponent(categoryFilter)}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await api.get(url);
      if (res.data.success) {
        setVouchers(res.data.vouchers);
        setTotalPages(res.data.totalPages);
        setTotalVouchers(res.data.total);
      }
    } catch (err) {
      console.error('Failed to fetch vouchers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (voucherId) => {
    if (!window.confirm('Are you sure you want to revoke this voucher?')) return;
    setProcessingId(voucherId);
    setAlert(null);

    try {
      const res = await api.post(`/vouchers/${voucherId}/revoke`);
      if (res.data.success) {
        setAlert({ type: 'success', message: res.data.message });
        fetchStats();
        fetchVouchers();
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to revoke voucher.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setProcessingId(null);
    }
  };

  // Test Case 7: Send request with invalid voucher or employee ID format
  const testInvalidIdFormat = async () => {
    setAlert(null);
    try {
      await api.post('/vouchers/assign', {
        voucherId: 'invalid-object-id-12345',
        employeeId: 'invalid-employee-id-999',
      });
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid ID format.';
      setAlert({ type: 'error', message: `[Case 7 Verified] HTTP 400 Bad Request: ${msg}` });
    }
  };

  // Test Case 8: Send request with missing required information
  const testMissingFields = async () => {
    setAlert(null);
    try {
      const sampleVoucher = vouchers[0] || {};
      await api.post('/vouchers/assign', {
        voucherId: sampleVoucher._id,
        // employeeId missing on purpose
      });
    } catch (err) {
      const msg = err.response?.data?.error || 'Please provide both voucherId and employeeId.';
      setAlert({ type: 'error', message: `[Case 8 Verified] HTTP 400 Bad Request: ${msg}` });
    }
  };

  return (
    <div>
      {/* Top Banner Alert */}
      {alert && (
        <div className={`alert alert-${alert.type}`} style={{ marginBottom: '24px' }}>
          <AlertCircle size={18} />
          <div style={{ flex: 1 }}>{alert.message}</div>
          <button
            onClick={() => setAlert(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Stats Header Grid */}
      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <div className="stat-icon available">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="stat-val" style={{ color: '#34d399' }}>{stats.available}</div>
            <div className="stat-label">Available Vouchers</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon assigned">
            <Send size={22} />
          </div>
          <div>
            <div className="stat-val" style={{ color: '#818cf8' }}>{stats.assigned}</div>
            <div className="stat-label">Assigned</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon redeemed">
            <Award size={22} />
          </div>
          <div>
            <div className="stat-val" style={{ color: '#22d3ee' }}>{stats.redeemed}</div>
            <div className="stat-label">Redeemed</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon revoked">
            <XCircle size={22} />
          </div>
          <div>
            <div className="stat-val" style={{ color: '#f87171' }}>{stats.revoked}</div>
            <div className="stat-label">Revoked</div>
          </div>
        </div>
      </div>

      {/* Main Controls Header */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: 1, width: '100%' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search voucher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
            </div>

            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '150px', flexGrow: 1 }}
            >
              <option value="">All Statuses</option>
              <option value="available_valid">Available (Valid)</option>
              <option value="assigned">Assigned</option>
              <option value="redeemed">Redeemed</option>
              <option value="revoked">Revoked</option>
              <option value="expired">Expired</option>
            </select>

            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ width: '130px', flexGrow: 1 }}
            >
              <option value="">All Categories</option>
              <option value="Cloud">Cloud</option>
              <option value="DevOps">DevOps</option>
              <option value="Security">Security</option>
              <option value="Database">Database</option>
            </select>

            <button onClick={() => { fetchStats(); fetchVouchers(); }} className="btn btn-secondary" title="Refresh list">
              <RefreshCw size={15} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: '100%', justifyContent: 'flex-end' }}>
            <button
              onClick={testInvalidIdFormat}
              className="btn btn-secondary"
              style={{ border: '1px solid rgba(245, 158, 11, 0.4)', fontSize: '0.8rem', padding: '6px 10px' }}
              title="Test Case 7: Send an invalid ID format to trigger HTTP 400 Bad Request error"
            >
              <AlertTriangle size={13} style={{ color: '#fbbf24' }} />
              Test Invalid ID (Case 7)
            </button>
            <button
              onClick={testMissingFields}
              className="btn btn-secondary"
              style={{ border: '1px solid rgba(244, 63, 94, 0.4)', fontSize: '0.8rem', padding: '6px 10px' }}
              title="Test Case 8: Send request with missing fields to trigger HTTP 400 Bad Request error"
            >
              <AlertTriangle size={13} style={{ color: '#fda4af' }} />
              Test Missing Fields (Case 8)
            </button>
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary" style={{ padding: '6px 14px' }}>
              <Plus size={15} />
              + Create Vouchers
            </button>
          </div>
        </div>
      </div>

      {/* Vouchers Grid */}
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '14px' }}>
        Voucher Inventory ({totalVouchers})
      </h2>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading vouchers...</p>
      ) : vouchers.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Layers size={36} style={{ color: 'var(--text-dim)', marginBottom: '10px' }} />
          <h3>No Vouchers Found</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
            No vouchers match your selected filters.
          </p>
        </div>
      ) : (
        <>
          <div className="voucher-grid">
            {vouchers.map((voucher) => (
              <VoucherCard
                key={voucher._id}
                voucher={voucher}
                role="manager"
                onAssign={(v) => setSelectedVoucherForAssign(v)}
                onRevoke={(id) => handleRevoke(id)}
                isProcessing={processingId === voucher._id}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalVouchers} total)
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
              >
                Previous
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Assign Modal */}
      {selectedVoucherForAssign && (
        <AssignModal
          voucher={selectedVoucherForAssign}
          onClose={() => setSelectedVoucherForAssign(null)}
          onAssignSuccess={(msg) => {
            setAlert({ type: 'success', message: msg });
            fetchStats();
            fetchVouchers();
          }}
        />
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateVoucherModal
          onClose={() => setShowCreateModal(false)}
          onCreateSuccess={(msg) => {
            setAlert({ type: 'success', message: msg });
            fetchStats();
            fetchVouchers();
          }}
        />
      )}
    </div>
  );
};

export default ManagerDashboard;
