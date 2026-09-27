import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { History, Search, Filter, RefreshCw, Clock } from 'lucide-react';

const AuditLogTable = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [search, actionFilter, page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = `/history?page=${page}&limit=12`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (actionFilter) url += `&action=${actionFilter}`;

      const res = await api.get(url);
      if (res.data.success) {
        setLogs(res.data.logs);
        setTotalPages(res.data.totalPages);
        setTotalLogs(res.data.total);
      }
    } catch (err) {
      console.error('Failed to fetch audit history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'CREATED':
        return <span className="status-badge available">Created</span>;
      case 'ASSIGNED':
        return <span className="status-badge assigned">Assigned</span>;
      case 'REDEEMED':
        return <span className="status-badge redeemed">Redeemed</span>;
      case 'REVOKED':
        return <span className="status-badge revoked">Revoked</span>;
      default:
        return <span className="status-badge">{action}</span>;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={22} style={{ color: 'var(--primary)' }} />
            Voucher Activity & Audit History
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Total Recorded Activities: <strong>{totalLogs}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search code, name, user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px', width: '220px' }}
            />
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          </div>

          <select
            className="form-select"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            style={{ width: '160px' }}
          >
            <option value="">All Actions</option>
            <option value="CREATED">CREATED</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="REDEEMED">REDEEMED</option>
            <option value="REVOKED">REVOKED</option>
          </select>

          <button onClick={fetchLogs} className="btn btn-secondary" title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading audit log records...</p>
      ) : logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No activity records found matching your filters.
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Voucher Code</th>
                  <th>Action</th>
                  <th>Performed By</th>
                  <th>Role</th>
                  <th>Target Employee</th>
                  <th>Timestamp</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <strong style={{ fontFamily: 'var(--font-mono)', color: '#818cf8' }}>{log.voucherCode}</strong>
                    </td>
                    <td>{getActionBadge(log.action)}</td>
                    <td>{log.performedByName}</td>
                    <td>
                      <span style={{ fontSize: '0.75rem', textTransform: 'capitalize', color: 'var(--text-muted)' }}>
                        {log.performedByRole}
                      </span>
                    </td>
                    <td>{log.targetEmployeeName || '-'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#d1d5db' }}>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
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

export default AuditLogTable;
