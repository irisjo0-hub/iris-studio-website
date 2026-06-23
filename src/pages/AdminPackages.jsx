import React, { useState, useEffect } from 'react';
import { supabase, uploadFile, deleteFile, extractPathFromUrl } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';
import '../styles/admin.css';

const AdminPackages = () => {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('بكجات التصوير');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data, error } = await supabase
          .from('package_items')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (data) setItems(data);
      } catch (e) {
        console.error('Failed to load package items:', e);
      }
    };
    fetchItems();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('الرجاء إدخال عنوان البكج');
      return;
    }
    if (!imageFile) {
      alert('الرجاء اختيار صورة البكج');
      return;
    }

    setLoading(true);
    try {
      const filePath = `${Date.now()}-${imageFile.name}`;
      const imageUrl = await uploadFile('packages', filePath, imageFile);

      const { data, error } = await supabase
        .from('package_items')
        .insert({
          title: title.trim(),
          type,
          image_url: imageUrl,
        })
        .select()
        .single();

      if (error) throw error;

      setItems([data, ...items]);

      // Reset form
      setTitle('');
      setType('بكجات التصوير');
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
      if (item?.image_url) {
        const path = extractPathFromUrl(item.image_url, 'packages');
        if (path) await deleteFile('packages', path);
      }

      const { error } = await supabase
        .from('package_items')
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
      <section className="admin-packages-section" style={{ direction: 'rtl' }}>
        <h2 className="section-title">إدارة صور البكجات</h2>
        <p className="section-subtitle">ارفع وعدّل صور البكجات والعروض المعروضة في الموقع.</p>

        <div className="admin-form-card">
          <form onSubmit={handleAddItem}>
            <div className="admin-form-grid">
              <div className="form-group">
                <label htmlFor="package-title">العنوان</label>
                <input
                  id="package-title"
                  type="text"
                  className="admin-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: عرض التخرج الذهبي"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="package-type">النوع</label>
                <select
                  id="package-type"
                  className="admin-input"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  style={{ height: '43px' }}
                  disabled={loading}
                >
                  <option value="بكجات التصوير">بكجات التصوير</option>
                  <option value="دفاتر التخرج">دفاتر التخرج</option>
                  <option value="عروض موسمية">عروض موسمية</option>
                </select>
              </div>

              <div className="form-group">
                <label>صورة البكج</label>
                <label htmlFor="package-image" className="admin-upload-box">
                  <span className="upload-icon">📸</span>
                  <span className="upload-text">اضغط هنا لاختيار صورة</span>
                  <input
                    id="package-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={loading}
                  />
                </label>
              </div>
            </div>

            {previewUrl && (
              <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <p style={{ fontWeight: '700', marginBottom: '0.5rem', color: 'var(--iris-purple)' }}>معاينة الصورة:</p>
                <img
                  src={previewUrl}
                  alt="معاينة"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-soft)',
                    objectFit: 'contain'
                  }}
                />
              </div>
            )}

            <button type="submit" className="btn-action confirm" style={{ padding: '0.75rem 2rem', fontSize: '1rem', width: 'auto' }} disabled={loading}>
              {loading ? '⏳ جاري الرفع...' : 'إضافة صورة بكج'}
            </button>
          </form>
        </div>

        {items.length === 0 ? (
          <div className="admin-empty-state">
            <h3>لا توجد صور بكجات مضافة بعد.</h3>
            <p>ابدأ برفع صور البكجات باستخدام النموذج أعلاه.</p>
          </div>
        ) : (
          <div className="admin-items-grid">
            {items.map((it) => (
              <div key={it.id} className="admin-item-card">
                <img src={it.image_url} alt={it.title} className="admin-item-image" />
                <div className="card-content">
                  <h3>{it.title}</h3>
                  <span className="admin-badge" style={{ backgroundColor: 'rgba(4, 70, 48, 0.1)', color: 'var(--iris-green)' }}>
                    {it.type}
                  </span>
                </div>
                <div className="card-actions">
                  <button className="btn-action reject" onClick={() => handleDelete(it.id)} style={{ width: '100%' }}>
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

export default AdminPackages;
