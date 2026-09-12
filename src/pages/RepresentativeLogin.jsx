import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import irisLogo from '../assets/iris_logo.png';
import '../styles/representatives.css';

const verifyRepresentativeWithRetry = async (userId) => {
  const delays = [0, 400, 900, 1600];

  for (let attempt = 0; attempt < delays.length; attempt += 1) {
    if (delays[attempt]) {
      await new Promise((resolve) => window.setTimeout(resolve, delays[attempt]));
    }

    const { data: rep, error } = await supabase
      .from('representatives')
      .select('user_id,status')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error) return { rep, error: null };
  }

  return { rep: null, error: new Error('تعذر التحقق من حساب المندوب مؤقتاً.') };
};

const RepresentativeLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !active) return;

      const { rep } = await verifyRepresentativeWithRetry(user.id);
      if (active && rep?.status === 'active') {
        navigate('/representative/dashboard', { replace: true });
      }
    })();

    return () => {
      active = false;
    };
  }, [navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (loginError) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('تم تسجيل الدخول لكن تعذر تحميل الجلسة. حاول مرة أخرى.');
      setLoading(false);
      return;
    }

    const { rep, error: verifyError } = await verifyRepresentativeWithRetry(user.id);

    if (verifyError) {
      setError('تم تسجيل الدخول، لكن تعذر التحقق من حساب المندوب مؤقتاً. حاول مرة أخرى.');
      setLoading(false);
      return;
    }

    if (rep?.status !== 'active') {
      await supabase.auth.signOut({ scope: 'local' });
      setError('هذا الحساب غير مفعل كمندوب.');
      setLoading(false);
      return;
    }

    navigate('/representative/dashboard', { replace: true });
    setLoading(false);
  };

  return <div className="rep-login" dir="rtl"><div className="rep-login-card">
    <Link to="/" className="rep-back"><ArrowLeft size={16}/> الموقع الرئيسي</Link>
    <img src={irisLogo} className="rep-login-logo" alt="IRIS"/>
    <span className="rep-eyebrow">IRIS REPRESENTATIVE PORTAL</span>
    <h1>بوابة المندوبين</h1><p>تابع مبيعاتك وعمولاتك وطلبات السحب من حسابك.</p>
    <form onSubmit={submit}>
      <label>البريد الإلكتروني<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email"/></label>
      <label>كلمة المرور<div className="rep-password"><input type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"/><button type="button" onClick={()=>setShow(!show)}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>
      {error&&<div className="rep-error">{error}</div>}
      <button className="rep-primary-btn" disabled={loading}>{loading?'جاري الدخول...':'تسجيل الدخول'} <ArrowLeft size={18}/></button>
    </form>
    <Link className="rep-forgot" to="/representative/reset-password">نسيت كلمة المرور؟</Link>
    <div className="rep-secure"><ShieldCheck size={15}/> محمي بواسطة Supabase Auth</div>
  </div></div>;
};
export default RepresentativeLogin;
