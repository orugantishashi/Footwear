import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Account({ user, onLogout }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!user) {
    return (
      <div style={{ maxWidth: '500px', margin: '60px auto', padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
        <h2>Not Logged In</h2>
        <p style={{ margin: '16px 0', color: '#666' }}>Please sign in to view your account profile.</p>
        <button onClick={() => navigate('/login')} style={{ padding: '12px 24px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          Go to Sign In
        </button>
      </div>
    );
  }

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          currentPassword,
          newPassword
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMsg('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setError(data.message || 'Failed to update password');
      }
    } catch (err) {
      setError('Server error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', minHeight: '75vh' }}>
      <h2 className="title" style={{ marginBottom: '24px' }}>My Account</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Profile Info */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>Profile Details</h3>
          <p style={{ margin: '8px 0' }}><strong>Name:</strong> {user.name || 'N/A'}</p>
          <p style={{ margin: '8px 0' }}><strong>Email:</strong> {user.email}</p>

          <button
            onClick={onLogout}
            style={{ marginTop: '24px', padding: '10px 20px', backgroundColor: '#ff4d4f', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>

        {/* Change Password */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>Change Password</h3>

          {msg && <div style={{ padding: '10px', backgroundColor: '#e6f4ea', color: '#137333', borderRadius: '6px', marginBottom: '12px', fontSize: '0.9rem' }}>{msg}</div>}
          {error && <div style={{ padding: '10px', backgroundColor: '#fff2f0', color: '#ff4d4f', borderRadius: '6px', marginBottom: '12px', fontSize: '0.9rem' }}>{error}</div>}

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '12px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '6px' }}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
