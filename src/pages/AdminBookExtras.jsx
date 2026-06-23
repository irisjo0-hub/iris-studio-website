import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';
import '../styles/admin.css';

const DEFAULT_EXTRAS = [
  { name: 'صورة فوتوغرافية داخل الدفتر', price: 1,  icon: '📸' },
  { name: 'إضافة دفتر تخرج',             price: 12, icon: '📖' },
  { name: 'ملصق خشبي 44×30',             price: 0,  icon: '🪵' },
  { name: 'ملصق خشبي 60×40',             price: 0,  icon: '🪵' },
  { name: 'ملصق خشبي + ستاند',           price: 0,  icon: '🖼️' },
  { name: 'وشاح مطرز',                   price: 0,  icon: '🧣' },
  { name: 'وشاح مطبوع',                  price: 0,  icon: '🧣' },
  { name: 'قبعة مطرزة',                  price: 0,  icon: '🎓' },
  { name: 'قبعة مطبوعة',                 price: 0,  icon: '🎓' },
  { name: 'ريلز تخرج',                   price: 0,  icon: '🎬' },
  { name: 'جريدة تخرج A2',               price: 0,  icon: '📰' },
];

const AdminBookExtras = () => {
  const [extras,      setExtras]      = useState([]);
  const [newName,     setNewName]     = useState('');
  const [newPrice,    setNewPrice]    = useState('');
  const [newIcon,     setNewIcon]     = useState('');
  const [editId,      setEditId]      = useState(null);
  const [editName,    setEditName]    = useState('');
  const [editPrice,   setEditPrice]   = useState('');
  const [editIcon,    setEditIcon]    = useState('');
  const [showDelete,  setShowDelete]  = useState(null);
  const [saveFlash,   setSaveFlash]   = useState(false);

  useEffect(() => {
    const fetchExtras = async () => {
      try {
        const { data, error } = await supabase
          .from('book_extras')
          .select('*')
          .order('id', { ascending: true });
        if (error) throw error;
        if (data && data.length > 0) {
          setExtras(data);
        } else {
          // Seed defaults if empty
          const { data: seeded, error: seedErr } = await supabase
            .from('book_extras')
            .insert(DEFAULT_EXTRAS)
            .select();
          if (seedErr) throw seedErr;
          setExtras(seeded || []);
        }
      } catch {
        setExtras([]);
      }
    };
    fetchExtras();
  }, []);

  const flash = () => {
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 1500);
  };

  const addExtra = async () => {
    const price = parseFloat(newPrice);
    if (!newName.trim() || isNaN(price) || price < 0) return;
    
    try {
      const { data, error } = await supabase
        .from('book_extras')
        .insert({ name: newName.trim(), price, icon: newIcon.trim() || '➕' })
        .select()
        .single();
      if (error) throw error;
      
      setExtras([...extras, data]);
      setNewName(''); setNewPrice(''); setNewIcon('');
      flash();
    } catch (err) {
      alert('حدث خطأ أثناء الإضافة: ' + err.message);
    }
  };

  const startEdit = (item) => {
    setEditId(item.id);
    setEditName(item.name);
    setEditPrice(String(item.price));
    setEditIcon(item.icon || '');
  };

  const confirmEdit = async (id) => {
    const price = parseFloat(editPrice);
    if (!editName.trim() || isNaN(price)) return;
    
    try {
      const { error } = await supabase
        .from('book_extras')
        .update({ name: editName.trim(), price, icon: editIcon.trim() || extras.find(e => e.id === id)?.icon })
        .eq('id', id);
      if (error) throw error;
      
      setExtras(extras.map((e) =>
        e.id === id ? { ...e, name: editName.trim(), price, icon: editIcon.trim() || e.icon } : e
      ));
      setEditId(null);
      flash();
    } catch (err) {
      alert('حدث خطأ أثناء التعديل: ' + err.message);
    }
  };

  const deleteExtra = async (id) => {
    try {
      const { error } = await supabase
        .from('book_extras')
        .delete()
        .eq('id', id);
      if (error) throw error;
      
      setExtras(extras.filter((e) => e.id !== id));
      setShowDelete(null);
      flash();
    } catch (err) {
      alert('حدث خطأ أثناء الحذف: ' + err.message);
    }
  };

  const resetDefaults = async () => {
    try {
      const { error: delErr } = await supabase
        .from('book_extras')
        .delete()
        .neq('id', 0);
      if (delErr) throw delErr;
      
      const { data, error } = await supabase
        .from('book_extras')
        .insert(DEFAULT_EXTRAS)
        .select();
      if (error) throw error;
      
      setExtras(data || []);
      flash();
    } catch (err) {
      alert('حدث خطأ أثناء إعادة التعيين: ' + err.message);
    }
  };

  return (
    <AdminLayout>
      <section>
        <h2 className="section-title">إدارة إضافات دفاتر التخرج</h2>
        <p className="section-subtitle">
          أضف أو عدّل أو احذف الإضافات المتاحة عند طلب دفتر التخرج. العناصر التي سعرها 0 JOD
          ستظهر للعميل ولكن بدون سعر محدد — عدّل السعر من هنا.
        </p>

        {saveFlash && (
          <div style={{
            background: 'var(--iris-green)', color: '#fff', borderRadius: 10,
            padding: '10px 20px', marginBottom: 16, fontWeight: 700, fontSize: '0.92rem',
            display: 'inline-block',
          }}>
            ✓ تم الحفظ بنجاح
          </div>
        )}

        {/* Add form */}
        <div className="table-container" style={{ marginBottom: 28, padding: '20px 24px' }}>
          <h3 style={{ color: 'var(--iris-purple)', fontWeight: 800, margin: '0 0 16px', fontSize: '1.05rem' }}>
            إضافة عنصر جديد
          </h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 2, minWidth: 160 }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: 6, color: 'var(--text-muted)' }}>
                اسم الإضافة *
              </label>
              <input
                type="text"
                className="admin-input"
                style={{ width: '100%' }}
                placeholder="مثال: إطار صورة فاخر"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addExtra()}
              />
            </div>
            <div style={{ flex: 1, minWidth: 90 }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: 6, color: 'var(--text-muted)' }}>
                السعر (JOD) *
              </label>
              <input
                type="number"
                className="admin-input"
                style={{ width: '100%' }}
                placeholder="0"
                min="0"
                step="0.5"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
              />
            </div>
            <div style={{ minWidth: 80 }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: 6, color: 'var(--text-muted)' }}>
                أيقونة
              </label>
              <input
                type="text"
                className="admin-input"
                style={{ width: 80 }}
                placeholder="🎁"
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
              />
            </div>
            <button
              className="btn-action confirm"
              style={{ padding: '10px 28px', fontSize: '0.95rem', whiteSpace: 'nowrap' }}
              onClick={addExtra}
            >
              ✚ إضافة
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--iris-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, color: 'var(--iris-purple)', fontSize: '0.95rem' }}>
              القائمة الحالية ({extras.length} عنصر)
            </span>
            <button
              className="btn-action reject"
              style={{ fontSize: '0.82rem', padding: '6px 14px' }}
              onClick={resetDefaults}
            >
              إعادة تعيين القائمة الافتراضية
            </button>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>أيقونة</th>
                <th>اسم الإضافة</th>
                <th>السعر (JOD)</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {extras.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    لا توجد إضافات. أضف عنصراً من الأعلى أو أعد تعيين القائمة الافتراضية.
                  </td>
                </tr>
              ) : (
                extras.map((item, i) => (
                  <tr key={item.id} className={editId === item.id ? 'row-editing' : ''}>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 700 }}>{i + 1}</td>
                    <td>
                      {editId === item.id
                        ? <input type="text" className="admin-input" style={{ width: 60 }} value={editIcon} onChange={(e) => setEditIcon(e.target.value)} />
                        : <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {editId === item.id
                        ? <input type="text" className="admin-input" style={{ minWidth: 200 }} value={editName} onChange={(e) => setEditName(e.target.value)} />
                        : item.name}
                    </td>
                    <td>
                      {editId === item.id
                        ? <input type="number" className="admin-input" style={{ width: 100 }} value={editPrice} onChange={(e) => setEditPrice(e.target.value)} min="0" step="0.5" />
                        : (
                          <span style={{
                            fontWeight: 800,
                            color: item.price === 0 ? 'var(--text-muted)' : 'var(--iris-green)',
                          }}>
                            {item.price === 0 ? '— غير محدد' : `${item.price} JOD`}
                          </span>
                        )}
                    </td>
                    <td>
                      <div className="actions-cell">
                        {editId === item.id ? (
                          <>
                            <button type="button" className="btn-action confirm" onClick={() => confirmEdit(item.id)}>حفظ</button>
                            <button type="button" className="btn-action reject" onClick={() => setEditId(null)}>إلغاء</button>
                          </>
                        ) : (
                          <>
                            <button type="button" className="btn-action complete" onClick={() => startEdit(item)}>تعديل</button>
                            <button type="button" className="btn-action delete" onClick={() => setShowDelete(item.id)}>حذف</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p style={{ marginTop: 14, fontSize: '0.83rem', color: 'var(--text-muted)', padding: '0 4px' }}>
          💡 الإضافات التي سعرها 0 JOD ستظهر في نموذج الطلب للعميل مع إمكانية التحديد، لكن لن تضاف لإجمالي السعر حتى تحدد سعراً لها.
        </p>
      </section>

      {/* Delete modal */}
      {showDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">تأكيد الحذف</h3>
            <p className="modal-message">هل أنت متأكد من حذف هذه الإضافة؟ لا يمكن التراجع.</p>
            <div className="modal-buttons">
              <button className="modal-btn cancel"  onClick={() => setShowDelete(null)}>إلغاء</button>
              <button className="modal-btn confirm" onClick={() => deleteExtra(showDelete)}>حذف</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminBookExtras;
