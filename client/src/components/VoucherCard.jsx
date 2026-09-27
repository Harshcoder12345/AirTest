import React from 'react';
import { Calendar, UserCheck, Tag, DollarSign, CheckCircle2, XCircle, AlertCircle, Send, AlertTriangle } from 'lucide-react';

const VoucherCard = ({ voucher, role, onAssign, onRedeem, onRevoke, isProcessing }) => {
  const isExpired = new Date(voucher.expiryDate) <= new Date();
  
  const getBadgeClass = () => {
    if (voucher.status === 'redeemed') return 'status-badge redeemed';
    if (voucher.status === 'revoked') return 'status-badge revoked';
    if (isExpired) return 'status-badge expired';
    if (voucher.status === 'assigned') return 'status-badge assigned';
    return 'status-badge available';
  };

  const getStatusText = () => {
    if (voucher.status === 'redeemed') return 'Redeemed';
    if (voucher.status === 'revoked') return 'Revoked';
    if (isExpired) return 'Expired';
    if (voucher.status === 'assigned') return 'Assigned';
    return 'Available';
  };

  return (
    <div className={`glass-card voucher-card ${voucher.status} ${isExpired ? 'expired' : ''}`}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <span className="voucher-code">{voucher.code}</span>
          <span className={getBadgeClass()}>{getStatusText()}</span>
        </div>

        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white', marginBottom: '8px' }}>
          {voucher.name}
        </h3>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--accent-cyan)', background: 'rgba(6,182,212,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
            <Tag size={12} />
            {voucher.category}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <Calendar size={12} />
            Expires: {new Date(voucher.expiryDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '16px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Voucher Value</span>
          <span className="voucher-value">${voucher.value}</span>
        </div>

        {voucher.assignedTo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#a5b4fc', marginBottom: '16px' }}>
            <UserCheck size={14} />
            <span>Assigned to: <strong>{voucher.assignedTo.name || 'Employee'}</strong></span>
          </div>
        )}

        {/* Action Buttons based on Role & Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {role === 'manager' && (
            <>
              {voucher.status === 'available' && !isExpired && (
                <button
                  onClick={() => onAssign(voucher)}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  disabled={isProcessing}
                >
                  <Send size={15} />
                  Assign Employee
                </button>
              )}

              {voucher.status === 'assigned' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => onRevoke(voucher._id)}
                    className="btn btn-danger"
                    style={{ flex: 1 }}
                    disabled={isProcessing}
                  >
                    <XCircle size={15} />
                    Revoke
                  </button>
                  <button
                    onClick={() => onAssign(voucher)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '6px 10px' }}
                    title="Test Case 1: Try assigning an already assigned voucher to get 400 Bad Request error"
                  >
                    <AlertTriangle size={13} style={{ color: 'var(--accent-amber)' }} />
                    Test Re-Assign
                  </button>
                </div>
              )}

              {/* Enable Test Assign for Expired Available Vouchers (Case 2) */}
              {isExpired && voucher.status === 'available' && (
                <button
                  onClick={() => onAssign(voucher)}
                  className="btn btn-secondary"
                  style={{ width: '100%', border: '1px solid rgba(245, 158, 11, 0.4)' }}
                >
                  <AlertTriangle size={14} style={{ color: 'var(--accent-amber)' }} />
                  Test Assign Expired (Case 2)
                </button>
              )}

              {/* Enable Test Revoke for Redeemed Vouchers (Case 6) */}
              {voucher.status === 'redeemed' && (
                <button
                  onClick={() => onRevoke(voucher._id)}
                  className="btn btn-secondary"
                  style={{ width: '100%', border: '1px solid rgba(244, 63, 94, 0.4)' }}
                  title="Test Case 6: Manager tries to revoke a voucher that has already been redeemed"
                >
                  <AlertTriangle size={14} style={{ color: '#fda4af' }} />
                  Test Revoke Redeemed (Case 6)
                </button>
              )}

              {(voucher.status === 'revoked' || (isExpired && voucher.status !== 'available' && voucher.status !== 'redeemed')) && (
                <button className="btn btn-secondary" style={{ width: '100%' }} disabled>
                  No Actions Available
                </button>
              )}
            </>
          )}

          {role === 'employee' && (
            <>
              {voucher.status === 'assigned' && !isExpired && (
                <button
                  onClick={() => onRedeem(voucher._id)}
                  className="btn btn-success"
                  style={{ width: '100%' }}
                  disabled={isProcessing}
                >
                  <CheckCircle2 size={15} />
                  Redeem Voucher
                </button>
              )}

              {voucher.status === 'redeemed' && (
                <button
                  onClick={() => onRedeem(voucher._id)}
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                >
                  Already Redeemed (Test Again)
                </button>
              )}

              {(voucher.status === 'revoked' || isExpired) && (
                <button className="btn btn-secondary" style={{ width: '100%' }} disabled>
                  {isExpired ? 'Expired Voucher' : 'Revoked Voucher'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoucherCard;
