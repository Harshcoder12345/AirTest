import React, { useState } from 'react';
import api from '../services/api';
import { PlusCircle, X, AlertTriangle } from 'lucide-react';

const CreateVoucherModal = ({ onClose, onCreateSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Cloud',
    value: 300,
    expiryDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    count: 1,
    code: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/vouchers', formData);
      if (res.data.success) {
        onCreateSuccess(res.data.message || 'Voucher(s) created successfully!');
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to create voucher.';
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
            <div style={{ padding: '8px', background: 'rgba(16,185,129,0.2)', borderRadius: '8px', color: '#6ee7b7' }}>
              <PlusCircle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Purchase / Create Vouchers</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Generate single or batch certification vouchers</p>
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
            <label className="form-label">Voucher Title / Certification Name</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="e.g. AWS Solutions Architect Associate"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select name="category" className="form-select" value={formData.category} onChange={handleChange}>
                <option value="Cloud">Cloud</option>
                <option value="DevOps">DevOps</option>
                <option value="Security">Security</option>
                <option value="Database">Database</option>
                <option value="AI / ML">AI / ML</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Value ($ USD)</label>
              <input
                type="number"
                name="value"
                className="form-input"
                min="1"
                value={formData.value}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Expiry Date</label>
              <input
                type="date"
                name="expiryDate"
                className="form-input"
                value={formData.expiryDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Quantity / Batch Count</label>
              <input
                type="number"
                name="count"
                className="form-input"
                min="1"
                max="500"
                value={formData.count}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {formData.count == 1 && (
            <div className="form-group">
              <label className="form-label">Custom Code (Optional)</label>
              <input
                type="text"
                name="code"
                className="form-input"
                placeholder="Leave blank for auto-generated code"
                value={formData.code}
                onChange={handleChange}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : `Create ${formData.count} Voucher(s)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVoucherModal;
