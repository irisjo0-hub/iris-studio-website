import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/admin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (loginError) {
        setError('خطأ في البريد الإلكتروني أو كلمة المرور. يرجى المحاولة مرة أخرى.');
        setLoading(false);
        return;
      }

      // Verify admin authorization using RPC
      const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin');

      if (rpcError || !isAdmin) {
        // Sign user out since they are not an authorized admin
        await supabase.auth.signOut();
        setError('حسابك غير مصرح له بالدخول كمسؤول.');
        setLoading(false);
        return;
      }

      // User is an authorized admin
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <section className="admin-login" style={{ maxWidth: '360px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Admin Login</h2>
        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              placeholder="name@example.com"
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          {error && <p className="error-message" style={{ color: '#c0392b', textAlign: 'center', marginTop: '0.5rem' }}>{error}</p>}
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1.25rem' }} disabled={loading}>
            {loading ? 'جاري التحقق...' : 'Login'}
          </button>
        </form>
      </section>
    </div>
  );
};

export default AdminLogin;
