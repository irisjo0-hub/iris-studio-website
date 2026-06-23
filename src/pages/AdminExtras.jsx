import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';
import '../styles/admin.css';

const DEFAULT_EXTRAS = [
  { name: 'دفتر تخرج',          price: 12 },
  { name: 'بوستر فوم 44×30',     price: 6  },
  { name: 'بوستر خشب 44×30',     price: 12 },
  { name: 'وشاح تطريز',          price: 15 },
  { name: 'وشاح طباعة',          price: 15 },
  { name: 'طاقية تطريز',         price: 15 },
  { name: 'طاقية طباعة',         price: 10 },
  { name: 'ريل جريدة تخرج A2',  price: 10 },
];

const AdminExtras = () => {
  const [extras, setExtras]     = useState([]);
  const [editId, setEditId]     = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [newName, setNewName]   = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [showDelete, setShowDelete] = useState(null);

  useEffect(() => {
    const fetchExtras = async () => {
      try {
        const { data, error } = await supabase
          .from('booking_extras')
          .select('*')
          .order('id', { ascending: true });
        if (error) throw error;
        if (data && data.length > 0) {
          setExtras(data);
        } else {
          // Seed defaults if empty
          const { data: seeded, error: seedErr } = await supabase
            .from('booking_extras')
            .insert(DEFAULT_EXTRAS)
            .select();
          if (seedErr) throw seedErr;
          setExtras(seeded || []);
        }
      } catch (e) {
        console.error('Failed to load extras:', e);
        setExtras([]);
      }
    };
    fetchExtras();
  }, []);

  const startEdit = (item) => {
    setEditId(item.id);
    setEditName(item.name);
    setEditPrice(String(item.price));
  };

  const confirmEdit = async (id) => {
    const price = parseFloat(editPrice);
    if (!editName.trim() || isNaN(price) || price < 0) return;
    
    try {
      const { error } = await supabase
        .from('booking_extras')
        .update({ name: editName.trim(), price })
        .eq('id', id);
      if (error) throw error;
      
      setExtras(extras.map((e) => e.id === id ? { ...e, name: editName.trim(), price } : e));
      setEditId(null);
    } catch (err) {
      alert('حدث خطأ أثناء التعديل: ' + err.message);
    }
  };

  const addExtra = async () => {
    const price = parseFloat(newPrice);
    if (!newName.trim() || isNaN(price) || price < 0) return;
    
    try {
      const { data, error } = await supabase
        .from('booking_extras')
        .insert({ name: newName.trim(), price })
        .select()
        .single();
      if (error) throw error;
      
      setExtras([...extras, data]);
      setNewName('');
      setNewPrice('');
    } catch (err) {
      alert('حدث خطأ أثناء الإضافة: ' + err.message);
    }
  };

  const deleteExtra = async (id) => {
    try {
      const { error } = await supabase
        .from('booking_extras')
        .delete()
        .eq('id', id);
      if (error) throw error;
      
      setExtras(extras.filter((e) => e.id !== id));
      setShowDelete(null);
    } catch (err) {
      alert('حدث خطأ أثناء الحذف: ' + err.message);
    }
  };

  const resetDefaults = async () => {
    try {
      // Delete all
      const { error: delErr } = await supabase
        .from('booking_extras')
        .delete()
        .neq('id', 0); // delete all rows
      if (delErr) throw delErr;
      
      // Insert defaults
      const { data, error } = await supabase
        .from('booking_extras')
        .insert(DEFAULT_EXTRAS)
        .select();
      if (error) throw error;
      
      setExtras(data || []);
    } catch (err) {
      alert('حدث خطأ أثناء إعادة التعيين: ' + err.message);
    }
  };

  return (
    <AdminLayout>
      <section>
        <h2 className="section-title">إدارة الإضافات</h2>
        <p className="section-subtitle">أضف، عدّل، أو احذف عناصر الإضافات المتاحة للعملاء في صفحة الحجز.</p>

        {/* Add new */}
        <div className="table-container" style={{ marginBottom: 28, padding: '20px 24px' }}>
          <h3 style={{ color: 'var(--iris-purple)', fontWeight: 800, margin: '0 0 16px', fontSize: '1.05rem' }}>
            إضافة عنصر جديد
          </h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 2, minWidth: 160 }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: 6, color: 'var(--text-muted)' }}>
                اسم الإضافة
              </label>
              <input
                type="text"
                className="admin-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="مثال: إطار صورة"
              />
            </div>
            <div style={{ flex: 1, minWidth: 100 }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: 6, color: 'var(--text-muted)' }}>
                السعر (JOD)
              </label>
              <input
                type="number"
                className="admin-input"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="0"
                min="0"
                step="0.5"
              />
            </div>
            <button className="btn-action confirm" style={{ padding: '10px 24px', fontSize: '0.95rem' }} onClick={addExtra}>
              إضافة
            </button>
          </div>
        </div>

        {/* Extras table */}
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>اسم الإضافة</th>
                <th>السعر (JOD)</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {extras.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    لا توجد إضافات. أضف عنصراً من الأعلى.
                  </td>
                </tr>
              ) : (
                extras.map((item, i) => (
                  <tr key={item.id}>
                    <td>{i + 1}</td>
                    <td>
                      {editId === item.id ? (
                        <input
                          type="text"
                          className="admin-input"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          style={{ width: '100%' }}
                        />
                      ) : (
                        item.name
                      )}
                    </td>
                    <td>
                      {editId === item.id ? (
                        <input
                          type="number"
                          className="admin-input"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          min="0"
                          step="0.5"
                          style={{ width: 90 }}
                        />
                      ) : (
                        `${item.price} JOD`
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

        {/* Reset to defaults */}
        <div style={{ marginTop: 20, textAlign: 'left' }}>
          <button
            className="btn-action reject"
            style={{ fontSize: '0.88rem', padding: '8px 18px' }}
            onClick={resetDefaults}
          >
            إعادة تعيين القائمة الافتراضية
          </button>
        </div>
      </section>

      {/* Delete confirm modal */}
      {showDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">تأكيد الحذف</h3>
            <p className="modal-message">هل أنت متأكد من حذف هذه الإضافة؟</p>
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

export default AdminExtras;
