import React, { useState, useEffect } from 'react';
import { supabase, uploadFile, deleteFile, extractPathFromUrl } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';
import '../styles/admin.css';

const AdminWork = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('جلسات تخرج');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load saved items on mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data, error } = await supabase
          .from('portfolio_items')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (data) setItems(data);
      } catch (e) {
        console.error('Failed to load items:', e);
      }
    };
    fetchItems();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('الرجاء إدخال عنوان العمل');
      return;
    }
    if (!imageFile) {
      alert('الرجاء اختيار صورة للعمل');
      return;
    }

    setLoading(true);
    try {
      const filePath = `${Date.now()}-${imageFile.name}`;
      const imageUrl = await uploadFile('portfolio', filePath, imageFile);

      const { data, error } = await supabase
        .from('portfolio_items')
        .insert({
          title: title.trim(),
          category,
          image_url: imageUrl,
        })
        .select()
        .single();

      if (error) throw error;

      setItems([data, ...items]);

      // Reset form
      setTitle('');
      setCategory('جلسات تخرج');
      setImageFile(null);
      setPreviewUrl('');
    } catch (err) {
      alert('حدث خطأ أثناء رفع الصورة: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const item = items.find((it) => it.id === id);
    try {
      // Delete file from storage
      if (item?.image_url) {
        const path = extractPathFromUrl(item.image_url, 'portfolio');
        if (path) await deleteFile('portfolio', path);
      }

      const { error } = await supabase
        .from('portfolio_items')
        .delete()
        .eq('id', id);
      if (error) throw error;

      setItems(items.filter((it) => it.id !== id));
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert('حدث خطأ أثناء الحذف');
    }
  };

  return (
    <AdminLayout>
      <section className="admin-work-section" style={{ direction: 'rtl' }}>
        <h2 className="section-title">إدارة الأعمال</h2>
        <p className="section-subtitle">
          أضف وعدّل صور أعمال الاستوديو المعروضة للزوار.
        </p>

        <div className="admin-form-card">
          <form onSubmit={handleAddItem}>
            <div className="admin-form-grid">
              {/* Title */}
              <div className="form-group">
                <label htmlFor="work-title">العنوان</label>
                <input
                  id="work-title"
                  type="text"
                  className="admin-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: لقطة تخرج مميزة"
                  disabled={loading}
                />
              </div>

              {/* Category */}
              <div className="form-group">
                <label htmlFor="work-category">التصنيف</label>
                <select
                  id="work-category"
                  className="admin-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ height: '43px' }}
                  disabled={loading}
                >
                  <option value="جلسات تخرج">جلسات تخرج</option>
                  <option value="عائلي">عائلي</option>
                  <option value="أطفال">أطفال</option>
                  <option value="مناسبات">مناسبات</option>
                  <option value="بورتريه">بورتريه</option>
                  <option value="طباعة وتصميم">طباعة وتصميم</option>
                </select>
              </div>

              {/* Image */}
              <div className="form-group">
                <label>صورة العمل</label>
                <label htmlFor="work-image" className="admin-upload-box">
                  <span className="upload-icon">📸</span>
                  <span className="upload-text">اضغط هنا لاختيار صورة</span>
                  <input
                    id="work-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={loading}
                  />
                </label>
              </div>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <p style={{ fontWeight: '700', marginBottom: '0.5rem', color: 'var(--iris-purple)' }}>
                  معاينة الصورة:
                </p>
                <img
                  src={previewUrl}
                  alt="معاينة"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-soft)',
                    objectFit: 'contain',
                  }}
                />
              </div>
            )}

            <button
              type="submit"
              className="btn-action confirm"
              style={{ padding: '0.75rem 2rem', fontSize: '1rem', width: 'auto' }}
              disabled={loading}
            >
              {loading ? '⏳ جاري الرفع...' : 'إضافة عمل جديد'}
            </button>
          </form>
        </div>

        {/* Items list */}
        {items.length === 0 ? (
          <div className="admin-empty-state">
            <h3>لا توجد أعمال مضافة بعد.</h3>
            <p>ابدأ برفع صور أعمالك باستخدام النموذج أعلاه.</p>
          </div>
        ) : (
          <div className="admin-items-grid">
            {items.map((it) => (
              <div key={it.id} className="admin-item-card">
                <img src={it.image_url} alt={it.title} className="admin-item-image" />
                <div className="card-content">
                  <h3>{it.title}</h3>
                  <span className="admin-badge">{it.category}</span>
                </div>
                <div className="card-actions">
                  <button
                    className="btn-action reject"
                    onClick={() => handleDelete(it.id)}
                    style={{ width: '100%' }}
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AdminLayout>
  );
};

export default AdminWork;
