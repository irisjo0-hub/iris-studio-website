import React, { useState, useEffect } from 'react';
import { supabase, uploadFile, deleteFile, extractPathFromUrl } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';
import '../styles/admin.css';

const AdminOffers = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [buttonText, setButtonText] = useState('احجز الآن');
  const [isHidden, setIsHidden] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [existingImageUrl, setExistingImageUrl] = useState('');

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setItems(data);
    } catch (e) {
      console.error('Failed to fetch offers:', e);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setTitle('');
    setPrice('');
    setDescription('');
    setButtonText('احجز الآن');
    setIsHidden(false);
    setImageFile(null);
    setPreviewUrl('');
    setExistingImageUrl('');
    setEditingId(null);
  };

  const handleEdit = (off) => {
    setEditingId(off.id);
    setTitle(off.title);
    setPrice(String(off.price));
    setDescription(off.description || '');
    setButtonText(off.button_text || 'احجز الآن');
    setIsHidden(off.is_hidden || false);
    setExistingImageUrl(off.image_url || '');
    setPreviewUrl(off.image_url || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('الرجاء إدخال عنوان العرض');
      return;
    }
    if (price === '') {
      alert('الرجاء إدخال سعر العرض');
      return;
    }

    setLoading(true);
    try {
      let finalImageUrl = existingImageUrl;

      if (imageFile) {
        const filePath = `offers-${Date.now()}-${imageFile.name}`;
        finalImageUrl = await uploadFile('packages', filePath, imageFile);

        if (editingId && existingImageUrl) {
          const oldPath = extractPathFromUrl(existingImageUrl, 'packages');
          if (oldPath) await deleteFile('packages', oldPath);
        }
      }

      const offerData = {
        title: title.trim(),
        price: parseFloat(price),
        description: description.trim(),
        button_text: buttonText.trim(),
        image_url: finalImageUrl,
        is_hidden: isHidden
      };

      if (editingId) {
        const { error } = await supabase
          .from('offers')
          .update(offerData)
          .eq('id', editingId);
        if (error) throw error;
        alert('تم تعديل العرض بنجاح');
      } else {
        const { error } = await supabase
          .from('offers')
          .insert(offerData);
        if (error) throw error;
        alert('تم إضافة العرض بنجاح');
      }

      resetForm();
      fetchItems();
    } catch (err) {
      alert('حدث خطأ أثناء حفظ العرض: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, imageUrl) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العرض؟')) return;
    try {
      if (imageUrl) {
        const path = extractPathFromUrl(imageUrl, 'packages');
        if (path) await deleteFile('packages', path);
      }

      const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', id);
      if (error) throw error;

      setItems(items.filter((it) => it.id !== id));
      alert('تم حذف العرض بنجاح');
    } catch (err) {
      console.error('Failed to delete offer:', err);
      alert('حدث خطأ أثناء حذف العرض');
    }
  };

  return (
    <AdminLayout>
      <section className="admin-offers-section" style={{ direction: 'rtl', padding: '20px' }}>
        <h2 className="section-title">إدارة العروض الترويجية</h2>
        <p className="section-subtitle">إضافة وتعديل عروض الموسم والخصومات المحددة زمنياً.</p>

        <div className="admin-form-card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--iris-purple)' }}>
            {editingId ? '📝 تعديل العرض' : '➕ إضافة عرض جديد'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div className="form-group">
                <label>العنوان *</label>
                <input
                  type="text"
                  className="admin-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: عرض الصيف الذهبي"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>السعر (JOD) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="admin-input"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="مثال: 45"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>نص زر الحجز</label>
                <input
                  type="text"
                  className="admin-input"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="مثال: احجز الآن"
                  disabled={loading}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>وصف العرض</label>
                <textarea
                  className="admin-input"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اكتب تفاصيل ومحتوى العرض الترويجي..."
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '30px' }}>
                  <input
                    type="checkbox"
                    checked={isHidden}
                    onChange={(e) => setIsHidden(e.target.checked)}
                    disabled={loading}
                  />
                  <span>إخفاء العرض مؤقتاً</span>
                </label>
              </div>

              <div className="form-group">
                <label>صورة العرض</label>
                <label htmlFor="offer-image" className="admin-upload-box" style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ccc', borderRadius: '8px', cursor: 'pointer' }}>
                  <span className="upload-icon">📸</span>
                  <span className="upload-text" style={{ marginRight: '8px' }}>اختر صورة العرض</span>
                  <input
                    id="offer-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                    disabled={loading}
                  />
                </label>
              </div>
            </div>

            {previewUrl && (
              <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <p style={{ fontWeight: '700', marginBottom: '0.5rem', color: 'var(--iris-purple)' }}>معاينة صورة العرض:</p>
                <img
                  src={previewUrl}
                  alt="معاينة"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '150px',
                    borderRadius: '8px',
                    objectFit: 'contain'
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn-action confirm" style={{ padding: '0.75rem 2rem', fontSize: '1rem', width: 'auto' }} disabled={loading}>
                {loading ? '⏳ جاري الحفظ...' : editingId ? 'تحديث العرض' : 'إضافة العرض'}
              </button>
              {editingId && (
                <button type="button" className="btn-action reject" onClick={resetForm} style={{ padding: '0.75rem 2rem', fontSize: '1rem', width: 'auto' }}>
                  إلغاء التعديل
                </button>
              )}
            </div>
          </form>
        </div>

        {items.length === 0 ? (
          <div className="admin-empty-state">
            <h3>لا توجد عروض مضافة بعد.</h3>
          </div>
        ) : (
          <div className="admin-items-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '24px' }}>
            {items.map((it) => (
              <div key={it.id} className="admin-item-card" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden', padding: '16px', display: 'flex', flexDirection: 'column', justifycontent: 'space-between' }}>
                <div>
                  {it.image_url ? (
                    <img src={it.image_url} alt={it.title} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <div style={{ width: '100%', height: '140px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', color: '#aaa' }}>بدون صورة</div>
                  )}
                  <h3 style={{ marginTop: '12px', fontSize: '1.15rem' }}>{it.title}</h3>
                  <div style={{ color: 'var(--iris-green)', fontWeight: 'bold', fontSize: '1.2rem', margin: '4px 0' }}>{it.price} JOD</div>
                  <p style={{ fontSize: '0.85rem', color: '#666', height: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.description}</p>
                  {it.is_hidden && <span style={{ color: 'red', fontSize: '0.8rem', fontWeight: 'bold' }}>[مخفي]</span>}
                </div>
                <div className="card-actions" style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button className="btn-action edit" onClick={() => handleEdit(it)} style={{ flex: 1, background: '#f1f1f1', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer' }}>تعديل</button>
                  <button className="btn-action reject" onClick={() => handleDelete(it.id, it.image_url)} style={{ flex: 1, background: '#fee', color: 'red', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer' }}>حذف</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AdminLayout>
  );
};

export default AdminOffers;
