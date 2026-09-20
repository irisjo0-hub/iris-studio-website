import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, TrendingUp, CircleDollarSign, ArrowDownToLine, Plus, Clock3, UsersRound, ArrowUpLeft, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import RepresentativeLayout from '../components/RepresentativeLayout';

const money=n=>Number(n||0).toFixed(2)+' JOD';

const RepresentativeDashboard=()=>{
 const [rep,setRep]=useState(null),[sales,setSales]=useState([]),[withdrawals,setWithdrawals]=useState([]),[leads,setLeads]=useState([]),[loading,setLoading]=useState(true);
 useEffect(()=>{(async()=>{
   const {data:{user}}=await supabase.auth.getUser(); if(!user)return;
   const [r,s,w,l]=await Promise.all([
     supabase.from('representatives').select('*').eq('user_id',user.id).single(),
     supabase.from('commission_sales').select('*').eq('representative_id',user.id).order('sale_date',{ascending:false}),
     supabase.from('commission_withdrawals').select('*').eq('representative_id',user.id).order('requested_at',{ascending:false}),
     supabase.from('sales_leads').select('*').eq('representative_id',user.id).order('updated_at',{ascending:false})
   ]);
   setRep(r.data);setSales(s.data||[]);setWithdrawals(w.data||[]);setLeads(l.data||[]);setLoading(false)
 })()},[]);
 const stats=useMemo(()=>{
   const d=new Date(),start=new Date(d.getFullYear(),d.getMonth(),1).toISOString().slice(0,10);
   const month=sales.filter(x=>x.sale_date>=start);
   const earned=sales.reduce((a,x)=>a+Number(x.commission_amount),0);
   const monthCommission=month.reduce((a,x)=>a+Number(x.commission_amount),0);
   const monthSales=month.reduce((a,x)=>a+Number(x.amount),0);
   const paid=withdrawals.filter(x=>['approved','paid'].includes(x.status)).reduce((a,x)=>a+Number(x.amount),0);
   const reserved=withdrawals.filter(x=>x.status==='pending').reduce((a,x)=>a+Number(x.amount),0);
   const activeLeads=leads.filter(x=>!['won','lost'].includes(x.status)).length;
   const wonLeads=leads.filter(x=>x.status==='won').length;
   return{earned,monthCommission,monthSales,paid,available:Math.max(0,earned-paid-reserved),activeLeads,wonLeads}
 },[sales,withdrawals,leads]);

 if(loading)return <RepresentativeLayout><div className="rep-loading">جاري تحميل لوحة المندوب...</div></RepresentativeLayout>;

 return <RepresentativeLayout>
  <section className="rep-page rep-dashboard-page">
   <div className="rep-dashboard-hero">
    <div>
      <span className="rep-eyebrow">IRIS SALES</span>
      <h1>مرحباً، {rep?.full_name?.split(' ')[0]||'مندوب'} <span>👋</span></h1>
      <p>تابع مبيعاتك، عمولاتك والعملاء الذين تعمل عليهم من مكان واحد.</p>
    </div>
    <Link className="rep-action" to="/sales/withdrawals"><Plus size={18}/> طلب سحب</Link>
   </div>

   <div className="rep-dashboard-balance">
     <div className="rep-balance-copy"><small>الرصيد المتاح للسحب</small><strong>{money(stats.available)}</strong><span>يمكنك طلب السحب في أي وقت من الرصيد المتاح.</span></div>
     <div className="rep-balance-icon"><Wallet size={25}/></div>
   </div>

   <div className="rep-stat-grid rep-dashboard-stats">
    <div className="rep-stat"><span><TrendingUp size={19}/></span><small>مبيعات هذا الشهر</small><strong>{money(stats.monthSales)}</strong></div>
    <div className="rep-stat"><span><CircleDollarSign size={19}/></span><small>عمولة هذا الشهر</small><strong>{money(stats.monthCommission)}</strong></div>
    <div className="rep-stat"><span><UsersRound size={19}/></span><small>عملاء مستهدفون</small><strong>{stats.activeLeads}</strong></div>
    <div className="rep-stat"><span className="iris-green-icon"><CheckCircle2 size={19}/></span><small>صفقات مكتملة</small><strong>{stats.wonLeads}</strong></div>
   </div>

   <div className="rep-dashboard-section-head"><div><span className="rep-eyebrow">ACTIVITY</span><h2>نشاطك الأخير</h2></div><Link to="/sales/leads">إدارة العملاء <ArrowUpLeft size={14}/></Link></div>
   <div className="rep-grid-2 rep-dashboard-panels">
    <div className="rep-panel">
      <div className="rep-panel-head"><h2>آخر المبيعات</h2><Link to="/sales/sales">عرض الكل</Link></div>
      {sales.slice(0,5).map(s=><div className="rep-row" key={s.id}><div><strong>{s.service_name}</strong><small>{s.sale_date} · {s.division||'IRIS'}</small></div><b className="positive">{money(s.commission_amount)}</b></div>)}
      {!sales.length&&<div className="rep-empty">لا توجد مبيعات مسجلة بعد.</div>}
    </div>
    <div className="rep-panel">
      <div className="rep-panel-head"><h2>آخر السحوبات</h2><Link to="/sales/withdrawals">عرض الكل</Link></div>
      {withdrawals.slice(0,5).map(w=><div className="rep-row" key={w.id}><div><strong>{money(w.amount)}</strong><small>{new Date(w.requested_at).toLocaleDateString('ar-JO')}</small></div><span className={'rep-status '+w.status}>{w.status==='paid'?'تم الدفع':w.status==='approved'?'موافق':w.status==='rejected'?'مرفوض':'قيد المراجعة'}</span></div>)}
      {!withdrawals.length&&<div className="rep-empty">لم تطلب أي سحب بعد.</div>}
    </div>
   </div>

   <Link to="/sales/leads" className="rep-leads-cta">
     <div className="rep-leads-cta-icon"><UsersRound size={21}/></div>
     <div><strong>تابع العملاء المستهدفين</strong><small>ابحث عن العملاء وأضف المتابعة والردود بدون تكرار الاستهداف.</small></div>
     <ArrowUpLeft size={18}/>
   </Link>

   <div className="rep-info-strip"><Clock3 size={17}/> المبالغ قيد المراجعة تُحجز من رصيدك المتاح حتى يتم اعتمادها أو رفضها.</div>
  </section>
 </RepresentativeLayout>;
};
export default RepresentativeDashboard;
