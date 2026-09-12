import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import irisLogo from '../assets/iris_logo.png';
import '../styles/admin.css';

const verifyAdminWithRetry = async () => {
  const delays = [0, 400, 900, 1600];

  for (let attempt = 0; attempt < delays.length; attempt += 1) {
    if (delays[attempt]) {
      await new Promise((resolve) => window.setTimeout(resolve, delays[attempt]));
    }

    const { data: isAdmin, error } = await supabase.rpc('is_admin');

    if (!error) return { isAdmin: !!isAdmin, error: null };
  }

  return {
    isAdmin: false,
    error: new Error('تعذر التحقق من صلاحيات المسؤول مؤقتاً.'),
  };
};

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
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (loginError) {
        setError('خطأ في البريد الإلكتروني أو كلمة المرور. يرجى المحاولة مرة أخرى.');
        return;
      }

      const { isAdmin, error: verifyError } = await verifyAdminWithRetry();

      if (verifyError) {
        // Keep the Supabase session alive. A temporary RPC/network failure
        // must not force the admin to sign in again.
        setError('تم تسجيل الدخول، لكن تعذر التحقق من الصلاحيات مؤقتاً. حاول مرة أخرى.');
        return;
      }

      if (!isAdmin) {
        await supabase.auth.signOut({ scope: 'local' });
        setError('حسابك غير مصرح له بالدخول كمسؤول.');
        return;
      }

      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError('حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="al-page">
      <div className="al-orb al-orb-1" />
      <div className="al-orb al-orb-2" />
      <div className="al-orb al-orb-3" />
      <div className="al-card" dir="rtl">
        <div className="al-card-logo"><img src={irisLogo} alt="IRIS Studio" /></div>
        <div className="al-form-header">
          <h1 className="al-title">تسجيل دخول المسؤول</h1>
          <p className="al-subtitle">أدخل بياناتك للوصول إلى لوحة التحكم</p>
        </div>
        <form className="al-form" onSubmit={handleSubmit} noValidate>
          <div className="al-field">
            <label htmlFor="email" className="al-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              البريد الإلكتروني
            </label>
            <input type="email" id="email" className="al-input" value={email} placeholder="admin@iris-studio.com" onChange={(e) => setEmail(e.target.value)} disabled={loading} required autoComplete="email" />
          </div>
          <div className="al-field">
            <label htmlFor="password" className="al-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              كلمة المرور
            </label>
            <input type="password" id="password" className="al-input" value={password} placeholder="••••••••••" onChange={(e) => setPassword(e.target.value)} disabled={loading} required autoComplete="current-password" />
          </div>
          {error && (
            <div className="al-error" role="alert">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{error}</span>
            </div>
          )}
          <button type="submit" className="al-btn" disabled={loading}>
            {loading ? <><span className="al-spinner" />جاري التحقق...</> : <>دخول<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>}
          </button>
        </form>
        <div className="al-secure-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          محمي بتشفير Supabase Auth
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
