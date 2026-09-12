import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, ReceiptText, WalletCards, UserRound, LogOut, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import '../styles/representatives.css';

const RepresentativeLayout = ({ children }) => {
  const navigate = useNavigate(), location = useLocation();
  const [open, setOpen] = useState(false), [rep, setRep] = useState(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('representatives').select('*').eq('user_id', user.id).maybeSingle()
        .then(({ data }) => { if (active) setRep(data); });
    });
    return () => { active = false; };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut({ scope: 'local' });
    navigate('/representative/login', { replace: true });
  };

  const links = [
    ['/representative/dashboard', 'الرئيسية', LayoutDashboard],
    ['/representative/sales', 'مبيعاتي', ReceiptText],
    ['/representative/withdrawals', 'السحوبات', WalletCards],
    ['/representative/profile', 'حسابي', UserRound],
  ];

  return <div className="rep-shell" dir="rtl">
    <header className="rep-topbar">
      <button className="rep-menu-btn" onClick={() => setOpen(!open)}>{open ? <X size={22}/> : <Menu size={22}/>}</button>
      <div className="rep-brand"><b>IRIS</b><span>REPRESENTATIVE PORTAL</span></div>
      <div className="rep-user-mini">{rep?.full_name || 'مندوب'} <small>{rep?.employee_code || ''}</small></div>
    </header>
    <div className="rep-body">
      <AnimatePresence>{open && <motion.div className="rep-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setOpen(false)}/>}</AnimatePresence>
      <aside className={'rep-sidebar ' + (open ? 'open' : '')}>
        <div className="rep-sidebar-head">
          <div className="rep-avatar">{(rep?.full_name || 'I').slice(0,1)}</div>
          <div><strong>{rep?.full_name || 'مندوب IRIS'}</strong><small>{rep?.email || ''}</small></div>
        </div>
        <nav>{links.map(([to,label,Icon]) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({isActive}) => isActive ? 'rep-nav active' : 'rep-nav'}><Icon size={18}/><span>{label}</span></NavLink>)}</nav>
        <button className="rep-logout" onClick={logout}><LogOut size={17}/> تسجيل الخروج</button>
      </aside>
      <main className="rep-main"><AnimatePresence mode="wait"><motion.div key={location.pathname} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:.25}}>{children}</motion.div></AnimatePresence></main>
    </div>
  </div>;
};

export default RepresentativeLayout;
