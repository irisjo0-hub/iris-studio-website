import React, { useState, useEffect } from 'react';
import { supabase, uploadFile, deleteFile, extractPathFromUrl } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';
import '../styles/admin.css';

const AdminPackages = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [features, setFeatures] = useState(''); // Comma-separated strings
  const [colors, setColors] = useState('');     // Comma-separated hexes
  const [category, setCategory] = useState('shoot'); // 'shoot' or 'graduation'
  const [sortOrder, setSortOrder] = useState('0');
  const [isHidden, setIsHidden] = useState(false);
  const [isPopular, setIsPopular] = useState(false); // Flag package as popular
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [existingImageUrl, setExistingImageUrl] = useState('');

  // Load packages on mount
  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      if (data) setItems(data);
    } catch (e) {
      console.error('Failed to load packages:', e);
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
    setFeatures('');
    setColors('');
    setCategory('shoot');
    setSortOrder('0');
    setIsHidden(false);
    setIsPopular(false);
    setImageFile(null);
    setPreviewUrl('');
    setExistingImageUrl('');
    setEditingId(null);
  };

  const handleEdit = (pkg) => {
    setEditingId(pkg.id);
    setTitle(pkg.title);
    setPrice(String(pkg.price));
    setCategory(pkg.category || 'shoot');
    setSortOrder(String(pkg.sort_order || 0));
    setIsHidden(pkg.is_hidden || false);
    setExistingImageUrl(pkg.image_url || '');
    setPreviewUrl(pkg.image_url || '');
    
    // Convert array fields back to comma strings
    const featArr = Array.isArray(pkg.features) ? pkg.features : JSON.parse(pkg.features || '[]');
    const hasPopular = featArr.includes('الأكثر طلباً') || featArr.includes('popular');
    setIsPopular(hasPopular);
    setFeatures(featArr.filter(f => f !== 'الأكثر طلباً' && f !== 'popular').join(', '));

    const colorArr = Array.isArray(pkg.colors) ? pkg.colors : JSON.parse(pkg.colors || '[]');
    setColors(colorArr.join(', '));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('الرجاء إدخال عنوان البكج');
      return;
    }
    if (price === '') {
      alert('الرجاء إدخال سعر البكج');
      return;
    }

    setLoading(true);
    try {
      let finalImageUrl = existingImageUrl;

      if (imageFile) {
        // Upload new image
        const filePath = `${Date.now()}-${imageFile.name}`;
        finalImageUrl = await uploadFile('packages', filePath, imageFile);

        // Delete old image if updating
        if (editingId && existingImageUrl) {
          const oldPath = extractPathFromUrl(existingImageUrl, 'packages');
          if (oldPath) await deleteFile('packages', oldPath);
        }
      }

      // Parse feature strings
      const parsedFeatures = features.split(',')
        .map(f => f.trim())
        .filter(Boolean);

      if (isPopular) {
        parsedFeatures.push('الأكثر طلباً');
      }

      // Parse color hex codes
      const parsedColors = colors.split(',')
        .map(c => c.trim())
        .filter(Boolean);

      const pkgData = {
        title: title.trim(),
        price: parseFloat(price),
        features: parsedFeatures,
        image_url: finalImageUrl,
        colors: parsedColors,
        sort_order: parseInt(sortOrder, 10) || 0,
        category: category,
        is_hidden: isHidden
      };

      if (editingId) {
        // Update
        const { error } = await supabase
          .from('packages')
          .update(pkgData)
          .eq('id', editingId);
        if (error) throw error;
        alert('تم تعديل البكج بنجاح');
      } else {
        // Insert
        const { error } = await supabase
          .from('packages')
          .insert(pkgData);
        if (error) throw error;
        alert('تم إضافة البكج بنجاح');
      }

      resetForm();
      fetchItems();
    } catch (err) {
      alert('حدث خطأ أثناء حفظ البكج: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, imageUrl) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا البكج؟')) return;
    try {
      if (imageUrl) {
        const path = extractPathFromUrl(imageUrl, 'packages');
        if (path) await deleteFile('packages', path);
      }

      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id);
      if (error) throw error;

      setItems(items.filter((it) => it.id !== id));
      alert('تم حذف البكج بنجاح');
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert('حدث خطأ أثناء الحذف');
    }
  };

  return (
    <AdminLayout>
      <section className="admin-packages-section" style={{ direction: 'rtl', padding: '20px' }}>
        <h2 className="section-title">إدارة البكجات والعروض</h2>
        <p className="section-subtitle">إضافة وتعديل وحذف بكجات التصوير ودفاتر التخرج.</p>

        <div className="admin-form-card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--iris-purple)' }}>
            {editingId ? '📝 تعديل البكج' : '➕ إضافة بكج جديد'}
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
                  placeholder="مثال: بكج التخرج المميز"
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
                  placeholder="مثال: 30"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>نوع البكج</label>
                <select
                  className="admin-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ height: '43px' }}
                  disabled={loading}
                >
                  <option value="shoot">جلسة تصوير (Shoot)</option>
                  <option value="graduation">دفتر تخرج (Graduation Book)</option>
                </select>
              </div>

              <div className="form-group">
                <label>ترتيب العرض</label>
                <input
                  type="number"
                  className="admin-input"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  placeholder="0"
                  disabled={loading}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>المميزات (افصل بينها بفاصلة)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  placeholder="مثال: 50 دقيقة, تعديل 10 صور, ستاند خشب"
                  disabled={loading}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>ألوان التنسيق / التدرج (افصل بينها بفاصلة)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={colors}
                  onChange={(e) => setColors(e.target.value)}
                  placeholder="مثال: #6F246F, #0F5A46"
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
                  <span>إخفاء البكج من الموقع</span>
                </label>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '30px' }}>
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    disabled={loading}
                  />
                  <span style={{ fontWeight: 'bold', color: 'var(--iris-purple, #6e267b)' }}>تمييز كـ الأكثر طلباً</span>
                </label>
              </div>

              <div className="form-group">
                <label>صورة البكج</label>
                <label htmlFor="package-image" className="admin-upload-box" style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ccc', borderRadius: '8px', cursor: 'pointer' }}>
                  <span className="upload-icon">📸</span>
                  <span className="upload-text" style={{ marginRight: '8px' }}>اختر صورة البكج</span>
                  <input
                    id="package-image"
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
                <p style={{ fontWeight: '700', marginBottom: '0.5rem', color: 'var(--iris-purple)' }}>معاينة صورة البكج:</p>
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
                {loading ? '⏳ جاري الحفظ...' : editingId ? 'تحديث البكج' : 'إضافة البكج'}
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
            <h3>لا توجد بكجات مضافة بعد.</h3>
          </div>
        ) : (
          <div className="admin-items-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '24px' }}>
            {items.map((it) => (
              <div key={it.id} className="admin-item-card" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  {it.image_url ? (
                    <img src={it.image_url} alt={it.title} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <div style={{ width: '100%', height: '140px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', color: '#aaa' }}>بدون صورة</div>
                  )}
                  <h3 style={{ marginTop: '12px', fontSize: '1.15rem' }}>{it.title}</h3>
                  <div style={{ color: 'var(--iris-green)', fontWeight: 'bold', fontSize: '1.2rem', margin: '4px 0' }}>{it.price} JOD</div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>التصنيف: {it.category === 'shoot' ? 'جلسة تصوير' : 'دفتر تخرج'}</div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>ترتيب العرض: {it.sort_order}</div>
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

export default AdminPackages;
