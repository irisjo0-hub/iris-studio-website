import { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Search,
  Pencil,
  X,
  Phone,
  MapPin,
  CalendarDays,
  UserRound,
  MessageSquareText,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { supabase } from '../lib/supabase';
import '../styles/admin.css';
import '../styles/representatives.css';
import '../styles/admin-sales-leads.css';

const STATUSES = [
  ['all', 'الكل'],
  ['new', 'جديد'],
  ['contacted', 'تم التواصل'],
  ['interested', 'مهتم'],
  ['follow_up', 'متابعة'],
  ['won', 'تمت الصفقة'],
  ['lost', 'لم تتم'],
  ['no_response', 'لا يوجد رد'],
];

const statusLabel = Object.fromEntries(STATUSES.filter(([v]) => v !== 'all'));

const emptyForm = {
  business_name: '',
  contact_name: '',
  phone: '',
  city: '',
  category: '',
  service_interest: '',
  status: 'new',
  last_response: '',
  notes: '',
  follow_up_date: '',
  representative_id: '',
};

const normalizeArabic = (value = '') =>
  value
    .toString()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ـ/g, '')
    .replace(/[ًٌٍَُِّْ]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

const editDistance = (a = '', b = '') => {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const curr = [i];
    for (let j = 1; j <= b.length; j += 1) {
      curr[j] = Math.min(
        curr[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    for (let j = 0; j < curr.length; j += 1) prev[j] = curr[j];
  }
  return prev[b.length];
};

const fuzzyWordMatch = (queryWord, textWord) => {
  if (!queryWord || !textWord) return false;
  if (textWord.includes(queryWord) || queryWord.includes(textWord)) return true;
  const distance = editDistance(queryWord, textWord);
  const maxLen = Math.max(queryWord.length, textWord.length);
  const allowed = maxLen <= 4 ? 1 : maxLen <= 7 ? 2 : 3;
  return distance <= allowed;
};

const fuzzySearch = (query, text) => {
  const q = normalizeArabic(query);
  const hay = normalizeArabic(text);
  if (!q || hay.includes(q)) return true;

  const queryWords = q.split(' ').filter(Boolean);
  const textWords = hay.split(' ').filter(Boolean);
  return queryWords.every((qw) => textWords.some((tw) => fuzzyWordMatch(qw, tw)));
};

const AdminSalesLeads = () => {
  const [leads, setLeads] = useState([]);
  const [reps, setReps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [repFilter, setRepFilter] = useState('all');
  const [followUp, setFollowUp] = useState('all');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const repName = (id) =>
    reps.find((rep) => rep.user_id === id)?.full_name || 'غير معروف';

  const load = async () => {
    setLoading(true);

    const [leadResult, repResult] = await Promise.all([
      supabase.from('sales_leads').select('*').order('updated_at', { ascending: false }),
      supabase
        .from('representatives')
        .select('user_id, full_name, employee_code, status')
        .order('full_name', { ascending: true }),
    ]);

    if (leadResult.error) setError(leadResult.error.message);
    if (repResult.error) setError(repResult.error.message);

    setLeads(leadResult.data || []);
    setReps(repResult.data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      total: leads.length,
      active: leads.filter((lead) => !['won', 'lost'].includes(lead.status)).length,
      overdue: leads.filter(
        (lead) =>
          lead.follow_up_date &&
          lead.follow_up_date < today &&
          !['won', 'lost'].includes(lead.status)
      ).length,
      won: leads.filter((lead) => lead.status === 'won').length,
    };
  }, [leads]);

  const filtered = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);

    return leads.filter((lead) => {
      const matchesStatus = status === 'all' || lead.status === status;
      const matchesRep = repFilter === 'all' || lead.representative_id === repFilter;

      const matchesFollowUp =
        followUp === 'all' ||
        (followUp === 'overdue' &&
          lead.follow_up_date &&
          lead.follow_up_date < today &&
          !['won', 'lost'].includes(lead.status)) ||
        (followUp === 'today' && lead.follow_up_date === today) ||
        (followUp === 'upcoming' &&
          lead.follow_up_date &&
          lead.follow_up_date > today &&
          !['won', 'lost'].includes(lead.status));

      const haystack = [
        lead.business_name,
        lead.contact_name,
        lead.phone,
        lead.city,
        lead.category,
        lead.service_interest,
        lead.notes,
        lead.last_response,
        repName(lead.representative_id),
      ]
        .filter(Boolean)
        .join(' ');

      return matchesStatus && matchesRep && matchesFollowUp && (!search.trim() || fuzzySearch(search, haystack));
    });
  }, [leads, reps, search, status, repFilter, followUp]);

  const openEdit = (lead) => {
    setEditing(lead);
    setForm({ ...emptyForm, ...lead, representative_id: lead.representative_id || '' });
    setError('');
    setMessage('');
  };

  const closeEdit = () => {
    if (saving) return;
    setEditing(null);
    setForm(emptyForm);
    setError('');
  };

  const save = async (event) => {
    event.preventDefault();
    if (!editing) return;

    setSaving(true);
    setError('');
    setMessage('');

    const payload = {
      business_name: form.business_name.trim(),
      contact_name: form.contact_name.trim() || null,
      phone: form.phone.trim() || null,
      city: form.city.trim() || null,
      category: form.category.trim() || null,
      service_interest: form.service_interest.trim() || null,
      status: form.status,
      last_response: form.last_response.trim() || null,
      notes: form.notes.trim() || null,
      follow_up_date: form.follow_up_date || null,
      representative_id: form.representative_id || editing.representative_id,
      updated_at: new Date().toISOString(),
    };

    const { error: saveError } = await supabase.from('sales_leads').update(payload).eq('id', editing.id);

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }

    setMessage('تم حفظ تعديلات العميل بنجاح.');
    setEditing(null);
    setForm(emptyForm);
    await load();
    setSaving(false);
  };

  return (
    <AdminLayout>
      <section className="admin-sales-leads" dir="rtl">
        <div className="admin-sales-leads-head">
          <div>
            <span className="admin-sales-leads-eyebrow">SALES PIPELINE</span>
            <h1>العملاء المستهدفين</h1>
            <p>كل العملاء الذين أضافهم فريق المبيعات، مع المندوب المسؤول والمتابعة وآخر رد.</p>
          </div>
        </div>

        <div className="admin-sales-leads-stats">
          <div><span>إجمالي المستهدفين</span><strong>{stats.total}</strong></div>
          <div><span>فرص نشطة</span><strong>{stats.active}</strong></div>
          <div className="warning"><span>متابعات متأخرة</span><strong>{stats.overdue}</strong></div>
          <div className="success"><span>صفقات مكتملة</span><strong>{stats.won}</strong></div>
        </div>

        <div className="admin-sales-leads-toolbar">
          <div className="admin-sales-leads-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ابحث عن اسم العميل، الهاتف، المدينة أو المندوب..."
            />
          </div>

          <select value={repFilter} onChange={(event) => setRepFilter(event.target.value)}>
            <option value="all">كل المندوبين</option>
            {reps.map((rep) => (
              <option key={rep.user_id} value={rep.user_id}>{rep.full_name}</option>
            ))}
          </select>

          <select value={followUp} onChange={(event) => setFollowUp(event.target.value)}>
            <option value="all">كل المتابعات</option>
            <option value="overdue">متابعة متأخرة</option>
            <option value="today">متابعة اليوم</option>
            <option value="upcoming">متابعة قادمة</option>
          </select>
        </div>

        <div className="admin-sales-leads-filters">
          <Filter size={15} />
          {STATUSES.map(([value, label]) => (
            <button key={value} className={status === value ? 'active' : ''} onClick={() => setStatus(value)} type="button">
              {label}
            </button>
          ))}
        </div>

        {message && <div className="admin-sales-leads-message success-message">{message}</div>}
        {error && <div className="admin-sales-leads-message error-message">{error}</div>}

        <div className="admin-sales-leads-meta">
          <strong>{filtered.length}</strong> عميل ظاهر <span>·</span> <span>آخر تحديث أولاً</span>
        </div>

        {loading ? (
          <div className="admin-sales-leads-empty">جاري تحميل العملاء المستهدفين...</div>
        ) : !filtered.length ? (
          <div className="admin-sales-leads-empty">
            <Building2 size={34} />
            <strong>لا توجد نتائج</strong>
            <span>جرّب تغيير البحث أو الفلاتر.</span>
          </div>
        ) : (
          <div className="admin-sales-leads-list">
            {filtered.map((lead) => {
              const today = new Date().toISOString().slice(0, 10);
              const overdue =
                lead.follow_up_date &&
                lead.follow_up_date < today &&
                !['won', 'lost'].includes(lead.status);
              const owner = reps.find((rep) => rep.user_id === lead.representative_id);

              return (
                <article className="admin-sales-lead-card" key={lead.id}>
                  <div className="admin-sales-lead-main">
                    <div className="admin-sales-lead-title">
                      <div className="admin-sales-lead-icon"><Building2 size={19} /></div>
                      <div>
                        <strong>{lead.business_name}</strong>
                        <small>{lead.category || 'بدون تصنيف'}</small>
                      </div>
                    </div>
                    <span className={'admin-sales-lead-status ' + lead.status}>
                      {statusLabel[lead.status] || lead.status}
                    </span>
                  </div>

                  <div className="admin-sales-lead-owner">
                    <UserRound size={14} />
                    <span>المندوب:</span>
                    <strong>{repName(lead.representative_id)}</strong>
                    {owner?.employee_code && <small>{owner.employee_code}</small>}
                  </div>

                  <div className="admin-sales-lead-details">
                    {lead.contact_name && <span><UserRound size={13} />{lead.contact_name}</span>}
                    {lead.phone && <span dir="ltr"><Phone size={13} />{lead.phone}</span>}
                    {lead.city && <span><MapPin size={13} />{lead.city}</span>}
                    {lead.service_interest && <span><MessageSquareText size={13} />{lead.service_interest}</span>}
                  </div>

                  {lead.last_response && (
                    <div className="admin-sales-lead-note"><b>آخر رد:</b> {lead.last_response}</div>
                  )}

                  {lead.notes && (
                    <div className="admin-sales-lead-note"><b>ملاحظات:</b> {lead.notes}</div>
                  )}

                  <div className="admin-sales-lead-footer">
                    <span className={overdue ? 'overdue' : ''}>
                      <CalendarDays size={13} />
                      {lead.follow_up_date
                        ? overdue
                          ? 'متابعة متأخرة: ' + lead.follow_up_date
                          : 'المتابعة: ' + lead.follow_up_date
                        : 'بدون موعد متابعة'}
                    </span>
                    <button type="button" onClick={() => openEdit(lead)}>
                      <Pencil size={14} /> تعديل ومتابعة
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {editing && (
          <div className="rep-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && closeEdit()}>
            <div className="rep-modal admin-sales-lead-modal" onClick={(event) => event.stopPropagation()}>
              <div className="rep-modal-head">
                <div>
                  <span className="rep-eyebrow">UPDATE LEAD</span>
                  <h3>{editing.business_name}</h3>
                </div>
                <button type="button" onClick={closeEdit} disabled={saving}><X size={19} /></button>
              </div>

              <form onSubmit={save}>
                <div className="rep-form-grid">
                  <label>
                    اسم المحل / الشخص *
                    <input value={form.business_name} onChange={(event) => setForm({ ...form, business_name: event.target.value })} required />
                  </label>

                  <label>
                    المندوب المسؤول
                    <select value={form.representative_id} onChange={(event) => setForm({ ...form, representative_id: event.target.value })}>
                      {reps.map((rep) => (
                        <option key={rep.user_id} value={rep.user_id}>
                          {rep.full_name} {rep.status !== 'active' ? '(' + rep.status + ')' : ''}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    اسم المسؤول
                    <input value={form.contact_name || ''} onChange={(event) => setForm({ ...form, contact_name: event.target.value })} />
                  </label>

                  <label>
                    رقم الهاتف
                    <input value={form.phone || ''} onChange={(event) => setForm({ ...form, phone: event.target.value })} dir="ltr" />
                  </label>

                  <label>
                    المدينة
                    <input value={form.city || ''} onChange={(event) => setForm({ ...form, city: event.target.value })} />
                  </label>

                  <label>
                    نوع النشاط
                    <input value={form.category || ''} onChange={(event) => setForm({ ...form, category: event.target.value })} />
                  </label>

                  <label>
                    الخدمة المستهدفة
                    <input value={form.service_interest || ''} onChange={(event) => setForm({ ...form, service_interest: event.target.value })} />
                  </label>

                  <label>
                    حالة الفرصة
                    <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                      {STATUSES.filter(([value]) => value !== 'all').map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    موعد المتابعة
                    <input type="date" value={form.follow_up_date || ''} onChange={(event) => setForm({ ...form, follow_up_date: event.target.value })} />
                  </label>
                </div>

                <label>
                  آخر رد
                  <textarea value={form.last_response || ''} onChange={(event) => setForm({ ...form, last_response: event.target.value })} placeholder="مثال: طلب التواصل الأسبوع القادم..." />
                </label>

                <label>
                  ملاحظات المتابعة
                  <textarea value={form.notes || ''} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="اكتب تفاصيل المتابعة أو الخطوة القادمة..." />
                </label>

                {error && <div className="rep-error">{error}</div>}

                <button className="admin-primary-btn" type="submit" disabled={saving}>
                  <CheckCircle2 size={16} />
                  {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              </form>
            </div>
          </div>
        )}
      </section>
    </AdminLayout>
  );
};

export default AdminSalesLeads;
