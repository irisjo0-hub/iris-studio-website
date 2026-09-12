import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import irisLogo from '../assets/iris_logo.png';
import '../styles/representatives.css';

const RepresentativeLogin = () => {
  const navigate=useNavigate(),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[show,setShow]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState('');

  useEffect(()=>{(async()=>{const {data:{user}}=await supabase.auth.getUser();if(!user)return;const {data:rep}=await supabase.from('representatives').select('user_id').eq('user_id',user.id).eq('status','active').maybeSingle();if(rep)navigate('/representative/dashboard',{replace:true})})()},[navigate]);

  const submit=async(e)=>{
    e.preventDefault();setLoading(true);setError('');
    const {error:e1}=await supabase.auth.signInWithPassword({email:email.trim(),password});
    if(e1){setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');setLoading(false);return;}
    const {data:{user}}=await supabase.auth.getUser();
    const {data:rep}=await supabase.from('representatives').select('user_id').eq('user_id',user?.id).eq('status','active').maybeSingle();
    if(!rep){await supabase.auth.signOut();setError('هذا الحساب غير مفعل كمندوب.');setLoading(false);return;}
    navigate('/representative/dashboard',{replace:true});
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
