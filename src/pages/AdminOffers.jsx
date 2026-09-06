import React, { useState, useEffect } from 'react';
import { supabase, uploadFile, deleteFile, extractPathFromUrl } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';
import '../styles/admin.css';

const AdminOffers = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

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
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch offers:', e);
      setItems([]);
    }
  };

  useEffect(() => {
    void fetchItems();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح.');
      return;
    }
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
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
    setTitle(off.title || '');
    setPrice(String(off.price ?? ''));
    setDescription(off.description || '');
    setButtonText(off.button_text || 'احجز الآن');
    setIsHidden(Boolean(off.is_hidden));
    setExistingImageUrl(off.image_url || '');
    setPreviewUrl(off.image_url || '');
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const parsedPrice = Number(price);
    if (!title.trim()) {
      alert('الرجاء إدخال عنوان العرض');
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      alert('الرجاء إدخال سعر صحيح أكبر من أو يساوي صفر.');
      return;
    }

    setLoading(true);
    let uploadedImageUrl = null;
    try {
      let finalImageUrl = existingImageUrl;

      if (imageFile) {
        const filePath = `offers-${Date.now()}-${imageFile.name}`;
        finalImageUrl = await uploadFile('packages', filePath, imageFile);
        uploadedImageUrl = finalImageUrl;
      }

      const offerData = {
        title: title.trim(),
        price: parsedPrice,
        description: description.trim(),
        button_text: buttonText.trim() || 'احجز الآن',
        image_url: finalImageUrl || null,
        is_hidden: Boolean(isHidden)
      };

      if (editingId) {
        const { error } = await supabase.from('offers').update(offerData).eq('id', editingId);
        if (error) throw error;
        alert('تم تعديل العرض بنجاح');

        // Only remove the old asset after the database update succeeded.
        if (imageFile && existingImageUrl) {
          const oldPath = extractPathFromUrl(existingImageUrl, 'packages');
          if (oldPath) {
            try {
              await deleteFile('packages', oldPath);
            } catch (storageError) {
              console.warn('Offer updated but old image cleanup failed:', storageError);
            }
          }
        }
      } else {
        const { error } = await supabase.from('offers').insert(offerData);
        if (error) throw error;
        alert('تم إضافة العرض بنجاح');
      }

      resetForm();
      await fetchItems();
    } catch (err) {
      // If a new image uploaded but the DB operation failed, remove the orphaned upload.
      if (uploadedImageUrl) {
        const uploadedPath = extractPathFromUrl(uploadedImageUrl, 'packages');
        if (uploadedPath) {
          try {
            await deleteFile('packages', uploadedPath);
          } catch (cleanupError) {
            console.warn('Could not clean up orphaned offer image:', cleanupError);
          }
        }
      }
      alert('حدث خطأ أثناء حفظ العرض: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, imageUrl) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العرض؟')) return;
    setLoading(true);
    try {
      // Delete the DB record first so a failed DB operation cannot lose the asset.
      const { error } = await supabase.from('offers').delete().eq('id', id);
      if (error) throw error;

      setItems(prev => prev.filter((it) => it.id !== id));
      alert('تم حذف العرض بنجاح');

      if (imageUrl) {
        const path = extractPathFromUrl(imageUrl, 'packages');
        if (path) {
          try {
            await deleteFile('packages', path);
          } catch (storageError) {
            console.warn('Offer deleted but image cleanup failed:', storageError);
          }
        }
      }
    } catch (err) {
      console.error('Failed to delete offer:', err);
      alert('حدث خطأ أثناء حذف العرض: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <section className="admin-offers-section" style={{ direction: 'rtl', padding: '20px' }}>
        <h2 className="section-title">إدارة العروض الترويجية</h2>
        <p className="section-subtitle">إضافة وتعديل عروض الموسم والخصومات المحددة زمنياً.</p>

        <div className="admin-form-card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--iris-purple)' }}>{editingId ? '📝 تعديل العرض' : '➕ إضافة عرض جديد'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div className="form-group"><label>العنوان *</label><input type="text" className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: عرض الصيف الذهبي" disabled={loading} /></div>
              <div className="form-group"><label>السعر (JOD) *</label><input type="number" min="0" step="0.01" className="admin-input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="مثال: 45" disabled={loading} /></div>
              <div className="form-group"><label>نص زر الحجز</label><input type="text" className="admin-input" value={buttonText} onChange={(e) => setButtonText(e.target.value)} placeholder="مثال: احجز الآن" disabled={loading} /></div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}><label>وصف العرض</label><textarea className="admin-input" style={{ minHeight: '80px', resize: 'vertical' }} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="اكتب تفاصيل ومحتوى العرض الترويجي..." disabled={loading} /></div>
              <div className="form-group"><label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '30px' }}><input type="checkbox" checked={isHidden} onChange={(e) => setIsHidden(e.target.checked)} disabled={loading} /><span>إخفاء العرض مؤقتاً</span></label></div>
              <div className="form-group"><label>صورة العرض</label><label htmlFor="offer-image" className="admin-upload-box" style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ccc', borderRadius: '8px', cursor: 'pointer' }}><span className="upload-icon">📸</span><span className="upload-text" style={{ marginRight: '8px' }}>اختر صورة العرض</span><input id="offer-image" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} disabled={loading} /></label></div>
            </div>

            {previewUrl && <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}><p style={{ fontWeight: '700', marginBottom: '0.5rem', color: 'var(--iris-purple)' }}>معاينة صورة العرض:</p><img src={previewUrl} alt="معاينة" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px', objectFit: 'contain' }} /></div>}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn-action confirm" style={{ padding: '0.75rem 2rem', fontSize: '1rem', width: 'auto' }} disabled={loading}>{loading ? '⏳ جاري الحفظ...' : editingId ? 'تحديث العرض' : 'إضافة العرض'}</button>
              {editingId && <button type="button" className="btn-action reject" onClick={resetForm} style={{ padding: '0.75rem 2rem', fontSize: '1rem', width: 'auto' }} disabled={loading}>إلغاء التعديل</button>}
            </div>
          </form>
        </div>

        {items.length === 0 ? <div className="admin-empty-state"><h3>لا توجد عروض مضافة بعد.</h3></div> : <div className="admin-items-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '24px' }}>
          {items.map((it) => <div key={it.id} className="admin-item-card" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {it.image_url ? <img src={it.image_url} alt={it.title} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} /> : <div style={{ width: '100%', height: '140px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', color: '#aaa' }}>بدون صورة</div>}
              <h3 style={{ marginTop: '12px', fontSize: '1.15rem' }}>{it.title}</h3>
              <div style={{ color: 'var(--iris-green)', fontWeight: 'bold', fontSize: '1.2rem', margin: '4px 0' }}>{it.price} JOD</div>
              <p style={{ fontSize: '0.85rem', color: '#666', height: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.description}</p>
              {it.is_hidden && <span style={{ color: 'red', fontSize: '0.8rem', fontWeight: 'bold' }}>[مخفي]</span>}
            </div>
            <div className="card-actions" style={{ display: 'flex', gap: '8px', marginTop: '16px' }}><button type="button" className="btn-action edit" onClick={() => handleEdit(it)} style={{ flex: 1, background: '#f1f1f1', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer' }} disabled={loading}>تعديل</button><button type="button" className="btn-action reject" onClick={() => void handleDelete(it.id, it.image_url)} style={{ flex: 1, background: '#fee', color: 'red', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer' }} disabled={loading}>حذف</button></div>
          </div>)}
        </div>}
      </section>
    </AdminLayout>
  );
};

export default AdminOffers;
