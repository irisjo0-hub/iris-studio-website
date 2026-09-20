import { useEffect, useMemo, useState } from 'react';
import { Building2, Search, Plus, X, Phone, MapPin, CalendarDays, UserRound, MessageSquareText, Pencil, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import RepresentativeLayout from '../components/RepresentativeLayout';

const STATUSES = [
  ['all','الكل'],
  ['new','جديد'],
  ['contacted','تم التواصل'],
  ['interested','مهتم'],
  ['follow_up','متابعة'],
  ['won','تمت الصفقة'],
  ['lost','لم تتم'],
  ['no_response','لا يوجد رد'],
];

const statusLabel = Object.fromEntries(STATUSES.filter(([v]) => v !== 'all'));

const emptyForm = {
  business_name:'', contact_name:'', phone:'', city:'', category:'',
  service_interest:'', status:'new', last_response:'', notes:'', follow_up_date:''
};

const SalesLeads = () => {
  const [user,setUser]=useState(null), [leads,setLeads]=useState([]);
  const [loading,setLoading]=useState(true), [saving,setSaving]=useState(false);
  const [search,setSearch]=useState(''), [status,setStatus]=useState('all'), [followUp,setFollowUp]=useState('all');
  const [showForm,setShowForm]=useState(false), [editing,setEditing]=useState(null);
  const [form,setForm]=useState(emptyForm), [error,setError]=useState('');

  const load = async () => {
    setLoading(true);
    const {data:{user}} = await supabase.auth.getUser();
    setUser(user);
    const {data: rows,error:e1} = await supabase.from('sales_leads').select('*').order('updated_at',{ascending:false});
    if (e1) setError(e1.message);
    setLeads(rows||[]); setLoading(false);
  };

  useEffect(()=>{load()},[]);

  const filtered = useMemo(()=>{
    const q=search.trim().toLowerCase();
    return leads.filter(l=>{
      const matchesStatus=status==='all'||l.status===status;
      const today=new Date().toISOString().slice(0,10);
      const matchesFollowUp=followUp==='all'
        || (followUp==='overdue' && l.follow_up_date && l.follow_up_date<today && !['won','lost'].includes(l.status))
        || (followUp==='today' && l.follow_up_date===today)
        || (followUp==='upcoming' && l.follow_up_date && l.follow_up_date>today && !['won','lost'].includes(l.status));
      const hay=[l.business_name,l.contact_name,l.phone,l.city,l.category,l.service_interest,l.notes,l.last_response].filter(Boolean).join(' ').toLowerCase();
      return matchesStatus && matchesFollowUp && (!q || hay.includes(q));
    });
  },[leads,search,status,followUp]);

  const openNew=()=>{setEditing(null);setForm(emptyForm);setError('');setShowForm(true)};
  const openEdit=(lead)=>{setEditing(lead);setForm({...emptyForm,...lead});setError('');setShowForm(true)};

  const submit=async e=>{
    e.preventDefault(); setSaving(true); setError('');
    const payload={...form, representative_id:user?.id};
    delete payload.id; delete payload.created_at; delete payload.updated_at;
    let result;
    if(editing){
      result=await supabase.from('sales_leads').update(payload).eq('id',editing.id);
    }else{
      result=await supabase.from('sales_leads').insert(payload);
    }
    if(result.error){setError(result.error.message);setSaving(false);return}
    setShowForm(false); setEditing(null); await load(); setSaving(false);
  };

  return <RepresentativeLayout>
    <section className="rep-page">
      <div className="rep-hero">
        <div>
          <span className="rep-eyebrow">SALES PIPELINE</span>
          <h1>العملاء المستهدفين</h1>
          <p>سجّل الجهات التي تستهدفها حتى يعرف الفريق من تم التواصل معه ويتابع الفرص بدون تكرار.</p>
        </div>
        <button className="rep-action" onClick={openNew}><Plus size={18}/> إضافة مستهدف</button>
      </div>

      <div className="rep-search">
        <Search size={17}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث باسم المحل، الشخص، الهاتف، المدينة..." />
      </div>

      <div className="rep-lead-filters">
        <Filter size={15}/>
        {STATUSES.map(([value,label])=><button key={value} className={status===value?'active':''} onClick={()=>setStatus(value)}>{label}</button>)}
      </div>

      <div className="rep-leads-meta">
        <span>{filtered.length} مستهدف</span>
        <span>الأخضر = الصفقة تمت · الأحمر = لم تتم</span>
      </div>

      {loading ? <div className="rep-empty">جاري تحميل العملاء المستهدفين...</div> :
      !filtered.length ? <div className="rep-empty"><Building2 size={30}/><br/>لا توجد نتائج مطابقة.</div> :
      <div className="rep-leads-grid">{filtered.map(lead=>{
        const mine=lead.representative_id===user?.id;
        return <article className={'rep-lead-card status-'+lead.status} key={lead.id}>
          <div className="rep-lead-top">
            <div className="rep-lead-icon"><Building2 size={19}/></div>
            <div className="rep-lead-title"><strong>{lead.business_name}</strong><small>{lead.category||'مستهدف'}</small></div>
            <span className={'rep-lead-status '+lead.status}>{statusLabel[lead.status]}</span>
          </div>
          <div className="rep-lead-owner"><UserRound size={13}/> مستهدف بواسطة: <b>{mine?'أنت':(owner?.full_name||'مندوب آخر')}</b></div>
          <div className="rep-lead-details">
            {lead.contact_name&&<span><UserRound size={13}/>{lead.contact_name}</span>}
            {lead.phone&&<span dir="ltr"><Phone size={13}/>{lead.phone}</span>}
            {lead.city&&<span><MapPin size={13}/>{lead.city}</span>}
            {lead.service_interest&&<span><MessageSquareText size={13}/>{lead.service_interest}</span>}
          </div>
          {lead.last_response&&<div className="rep-lead-note"><b>آخر رد:</b> {lead.last_response}</div>}
          {lead.notes&&<div className="rep-lead-note"><b>ملاحظات:</b> {lead.notes}</div>}
          <div className="rep-lead-bottom">
            <span>{lead.follow_up_date?<><CalendarDays size={13}/> متابعة: {lead.follow_up_date}</>:'بدون موعد متابعة'}</span>
            {mine&&<button onClick={()=>openEdit(lead)}><Pencil size={14}/> تعديل</button>}
          </div>
        </article>
      })}</div>}

      {showForm&&<div className="rep-modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setShowForm(false)}>
        <div className="rep-modal" dir="rtl">
          <div className="rep-modal-head"><div><span className="rep-eyebrow">{editing?'UPDATE TARGET':'NEW TARGET'}</span><h3>{editing?'تعديل المستهدف':'إضافة مستهدف جديد'}</h3></div><button onClick={()=>setShowForm(false)}><X/></button></div>
          <form onSubmit={submit}>
            <div className="rep-form-grid">
              <label>اسم المحل / الشخص *
                <input value={form.business_name} onChange={e=>setForm({...form,business_name:e.target.value})} required placeholder="مثال: محل X أو أحمد خالد"/>
              </label>
              <label>اسم الشخص المسؤول
                <input value={form.contact_name} onChange={e=>setForm({...form,contact_name:e.target.value})} placeholder="صاحب المحل / المدير"/>
              </label>
              <label>رقم الهاتف
                <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="07xxxxxxxx"/>
              </label>
              <label>المدينة
                <input value={form.city} onChange={e=>setForm({...form,city:e.target.value})} placeholder="إربد"/>
              </label>
              <label>نوع النشاط
                <input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} placeholder="مطعم، متجر، شركة..."/>
              </label>
              <label>الخدمة المستهدفة
                <input value={form.service_interest} onChange={e=>setForm({...form,service_interest:e.target.value})} placeholder="إدارة سوشال ميديا، تصوير..."/>
              </label>
              <label>حالة الفرصة
                <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{STATUSES.filter(([v])=>v!=='all').map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
              </label>
              <label>موعد المتابعة
                <input type="date" value={form.follow_up_date||''} onChange={e=>setForm({...form,follow_up_date:e.target.value})}/>
              </label>
            </div>
            <label>ماذا كان الرد؟
              <textarea value={form.last_response||''} onChange={e=>setForm({...form,last_response:e.target.value})} placeholder="مثال: مهتم لكن طلب التواصل بعد أسبوع..." />
            </label>
            <label>ملاحظات
              <textarea value={form.notes||''} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="أي تفاصيل مهمة للفولو أب..." />
            </label>
            {error&&<div className="rep-error">{error}</div>}
            <button className="rep-primary-btn" disabled={saving}>{saving?'جاري الحفظ...':editing?'حفظ التعديلات':'إضافة المستهدف'}</button>
          </form>
        </div>
      </div>}
    </section>
  </RepresentativeLayout>;
};

export default SalesLeads;
