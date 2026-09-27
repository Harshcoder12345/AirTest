import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { UserCheck, X, Search, AlertTriangle } from 'lucide-react';

const AssignModal = ({ voucher, onClose, onAssignSuccess }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, [search]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users/employees?search=${search}`);
      if (res.data.success) {
        setEmployees(res.data.employees);
        if (res.data.employees.length > 0 && !selectedEmployeeId) {
          setSelectedEmployeeId(res.data.employees[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      setError('Please select an employee to assign this voucher to.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/vouchers/assign', {
        voucherId: voucher._id,
        employeeId: selectedEmployeeId,
      });

      if (res.data.success) {
        onAssignSuccess(res.data.message);
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to assign voucher.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', background: 'rgba(99,102,241,0.2)', borderRadius: '8px', color: '#818cf8' }}>
              <UserCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Assign Voucher</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{voucher.code} ({voucher.name})</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Search Employees</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Type name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Select Employee</label>
            {loading ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading employees...</p>
            ) : employees.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--accent-amber)' }}>No employees found. Please register an employee account first.</p>
            ) : (
              <select
                className="form-select"
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
              >
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting || employees.length === 0}>
              {submitting ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignModal;
