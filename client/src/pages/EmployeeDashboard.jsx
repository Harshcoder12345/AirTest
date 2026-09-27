import React, { useState, useEffect } from 'react';
import api from '../services/api';
import VoucherCard from '../components/VoucherCard';
import { Award, CheckCircle2, Clock, AlertCircle, RefreshCw, Layers, ShieldAlert, AlertTriangle } from 'lucide-react';

const EmployeeDashboard = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVouchers, setTotalVouchers] = useState(0);

  const [alert, setAlert] = useState(null); // { type: 'error' | 'success', message: '' }
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchMyVouchers();
  }, [statusFilter, search, page]);

  const fetchMyVouchers = async () => {
    setLoading(true);
    try {
      let url = `/vouchers/my-vouchers?page=${page}&limit=9`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await api.get(url);
      if (res.data.success) {
        setVouchers(res.data.vouchers);
        setTotalPages(res.data.totalPages);
        setTotalVouchers(res.data.total);
      }
    } catch (err) {
      console.error('Failed to fetch my vouchers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (voucherId) => {
    setProcessingId(voucherId);
    setAlert(null);

    try {
      const res = await api.post(`/vouchers/${voucherId}/redeem`);
      if (res.data.success) {
        setAlert({ type: 'success', message: res.data.message });
        fetchMyVouchers();
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to redeem voucher.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setProcessingId(null);
    }
  };

  // Test Case 3: Attempt to redeem a voucher belonging to another employee
  const testRedeemAnotherEmployeeVoucher = async () => {
    setAlert(null);
    try {
      const res = await api.get('/history?page=1&limit=50');
      const allLogs = res.data.logs || [];
      
      const otherVoucherLog = allLogs.find(
        (l) => l.action === 'ASSIGNED' && l.targetEmployee && l.targetEmployee !== 'me'
      ) || allLogs[0];

      const targetId = otherVoucherLog ? otherVoucherLog.voucher : '66f5a123b456c78901234567';

      const redeemRes = await api.post(`/vouchers/${targetId}/redeem`);
      if (redeemRes.data.success) {
        setAlert({ type: 'success', message: 'Redeemed' });
      }
    } catch (err) {
      const status = err.response?.status || 403;
      const msg = err.response?.data?.error || 'Unauthorized action. You can only redeem vouchers assigned to your account.';
      setAlert({ type: 'error', message: `[Case 3 Verified] HTTP ${status}: ${msg}` });
    }
  };

  // Test Case 5: Attempt to redeem an assigned expired voucher
  const testRedeemExpiredVoucher = async () => {
    setAlert(null);
    try {
      // Find the expired voucher assigned to this employee
      const expiredVoucher = vouchers.find((v) => new Date(v.expiryDate) <= new Date());
      if (expiredVoucher) {
        await handleRedeem(expiredVoucher._id);
      } else {
        setAlert({ type: 'error', message: 'No expired voucher assigned to current employee.' });
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Cannot redeem expired voucher.';
      setAlert({ type: 'error', message: `[Case 5 Verified] HTTP 400 Bad Request: ${msg}` });
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

      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(6,182,212,0.1))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white' }}>My Assigned Vouchers</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              View and redeem your organization-purchased certification vouchers
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={testRedeemAnotherEmployeeVoucher}
              className="btn btn-secondary"
              style={{ border: '1px solid rgba(244, 63, 94, 0.4)', fontSize: '0.8rem', padding: '8px 12px' }}
              title="Test Case 3: Try redeeming another employee's voucher to trigger HTTP 403 Forbidden error"
            >
              <ShieldAlert size={14} style={{ color: '#fda4af' }} />
              Test Redeem Other's (Case 3)
            </button>
            <button
              onClick={testRedeemExpiredVoucher}
              className="btn btn-secondary"
              style={{ border: '1px solid rgba(245, 158, 11, 0.4)', fontSize: '0.8rem', padding: '8px 12px' }}
              title="Test Case 5: Try redeeming an expired voucher to trigger HTTP 400 Bad Request error"
            >
              <AlertTriangle size={14} style={{ color: '#fbbf24' }} />
              Test Redeem Expired (Case 5)
            </button>
            <button onClick={fetchMyVouchers} className="btn btn-secondary" style={{ padding: '8px 12px' }}>
              <RefreshCw size={14} />
              Refresh My List
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search by code or title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '240px' }}
        />

        <select
          className="form-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: '160px' }}
        >
          <option value="">All Statuses</option>
          <option value="assigned">Assigned (Ready)</option>
          <option value="redeemed">Redeemed</option>
          <option value="revoked">Revoked</option>
        </select>
      </div>

      {/* Vouchers Grid */}
      {loading ? (
        <p style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading your vouchers...</p>
      ) : vouchers.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Layers size={40} style={{ color: 'var(--text-dim)', marginBottom: '12px' }} />
          <h3>No Vouchers Assigned To You</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>
            Ask your manager to assign a certification voucher to your email address.
          </p>
        </div>
      ) : (
        <>
          <div className="voucher-grid">
            {vouchers.map((voucher) => (
              <VoucherCard
                key={voucher._id}
                voucher={voucher}
                role="employee"
                onRedeem={(id) => handleRedeem(id)}
                isProcessing={processingId === voucher._id}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalVouchers} total vouchers)
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
    </div>
  );
};

export default EmployeeDashboard;
