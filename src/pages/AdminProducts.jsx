import React, { useState, useEffect } from 'react';
import { supabase, uploadFile, deleteFile, extractPathFromUrl } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';
import '../styles/admin.css';

const AdminProducts = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('بوسترات');
  const [availableColors, setAvailableColors] = useState(''); // Comma-separated colors
  const [colorSelectionEnabled, setColorSelectionEnabled] = useState(false);
  const [customNotes, setCustomNotes] = useState('');
  const [isHidden, setIsHidden] = useState(false);
  
  // Images state: [{ id: string, type: 'existing' | 'new', url: string, file?: File }]
  const [images, setImages] = useState([]);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('printing_products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setItems(data);
    } catch (e) {
      console.error('Failed to load printing products:', e);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImages = files.map((file, i) => ({
        id: `new-${Date.now()}-${i}`,
        type: 'new',
        url: URL.createObjectURL(file),
        file
      }));
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const handleRemoveImage = (imgId) => {
    setImages(prev => prev.filter(img => img.id !== imgId));
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setDescription('');
    setCategory('بوسترات');
    setAvailableColors('');
    setColorSelectionEnabled(false);
    setCustomNotes('');
    setIsHidden(false);
    setImages([]);
    setEditingId(null);
  };

  const handleEdit = (prod) => {
    setEditingId(prod.id);
    setName(prod.name);
    setPrice(String(prod.price));
    setDescription(prod.description || '');
    setCategory(prod.category || 'بوسترات');
    setColorSelectionEnabled(prod.color_selection_enabled || false);
    setCustomNotes(prod.custom_notes || '');
    setIsHidden(prod.is_hidden || false);

    // Parse image URLs array
    let urls = [];
    if (Array.isArray(prod.image_urls)) {
      urls = prod.image_urls;
    } else if (typeof prod.image_urls === 'string') {
      try {
        urls = JSON.parse(prod.image_urls || '[]');
      } catch {
        urls = prod.image_urls ? [prod.image_urls] : [];
      }
    }
    setImages(urls.map((url, i) => ({ id: `existing-${i}`, type: 'existing', url })));

    // Available colors
    let colorsArr = [];
    if (Array.isArray(prod.available_colors)) {
      colorsArr = prod.available_colors;
    } else if (typeof prod.available_colors === 'string') {
      try {
        colorsArr = JSON.parse(prod.available_colors || '[]');
      } catch {
        colorsArr = [];
      }
    }
    setAvailableColors(colorsArr.join(', '));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('الرجاء إدخال اسم المنتج');
      return;
    }
    if (price === '') {
      alert('الرجاء إدخال سعر المنتج');
      return;
    }

    setLoading(true);
    try {
      const finalUrls = [];
      for (const img of images) {
        if (img.type === 'existing') {
          finalUrls.push(img.url);
        } else if (img.type === 'new' && img.file) {
          const filePath = `products-${Date.now()}-${img.file.name}`;
          const uploadedUrl = await uploadFile('packages', filePath, img.file);
          finalUrls.push(uploadedUrl);
        }
      }

      // Parse colors
      const parsedColors = availableColors.split(',')
        .map(c => c.trim())
        .filter(Boolean);

      const productData = {
        name: name.trim(),
        price: parseFloat(price),
        description: description.trim(),
        image_urls: finalUrls,
        category,
        available_colors: parsedColors,
        color_selection_enabled: colorSelectionEnabled,
        custom_notes: customNotes.trim(),
        is_hidden: isHidden
      };

      if (editingId) {
        const { error } = await supabase
          .from('printing_products')
          .update(productData)
          .eq('id', editingId);
        if (error) throw error;
        alert('تم تعديل المنتج بنجاح');
      } else {
        const { error } = await supabase
          .from('printing_products')
          .insert(productData);
        if (error) throw error;
        alert('تم إضافة المنتج بنجاح');
      }

      resetForm();
      fetchItems();
    } catch (err) {
      alert('حدث خطأ أثناء حفظ المنتج: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, imageUrls) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    try {
      let urls = [];
      if (Array.isArray(imageUrls)) {
        urls = imageUrls;
      } else if (typeof imageUrls === 'string') {
        try {
          urls = JSON.parse(imageUrls || '[]');
        } catch {
          urls = imageUrls ? [imageUrls] : [];
        }
      }
      // Delete old photos from 'packages' bucket
      for (const url of urls) {
        const path = extractPathFromUrl(url, 'packages');
        if (path) await deleteFile('packages', path);
      }

      const { error } = await supabase
        .from('printing_products')
        .delete()
        .eq('id', id);
      if (error) throw error;

      setItems(items.filter((it) => it.id !== id));
      alert('تم حذف المنتج بنجاح');
    } catch (err) {
      console.error('Failed to delete printing product:', err);
      alert('حدث خطأ أثناء حذف المنتج');
    }
  };

  return (
    <AdminLayout>
      <section className="admin-packages-section" style={{ direction: 'rtl', padding: '20px' }}>
        <h2 className="section-title">إدارة منتجات الطباعة</h2>
        <p className="section-subtitle">إضافة وتعديل وحذف منتجات التصميم والطباعة المخصصة للبيع.</p>

        <div className="admin-form-card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--iris-purple)' }}>
            {editingId ? '📝 تعديل منتج الطباعة' : '➕ إضافة منتج جديد'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div className="form-group">
                <label>اسم المنتج *</label>
                <input
                  type="text"
                  className="admin-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: وشاح تخرج مطرز"
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
                  placeholder="مثال: 15"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>التصنيف</label>
                <select
                  className="admin-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ height: '43px' }}
                  disabled={loading}
                >
                  <option value="بوسترات">بوسترات</option>
                  <option value="أوشحة وطواقي">أوشحة وطواقي</option>
                  <option value="هدايا ومطبوعات">هدايا ومطبوعات</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>الوصف</label>
                <textarea
                  className="admin-input"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اكتب وصفاً مفصلاً للمنتج ومواصفاته..."
                  disabled={loading}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>الألوان المتاحة (افصل بينها بفاصلة)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={availableColors}
                  onChange={(e) => setAvailableColors(e.target.value)}
                  placeholder="مثال: أبيض, كحلي, أسود, نبيذي"
                  disabled={loading}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>ملاحظات إرشادية للزبون</label>
                <input
                  type="text"
                  className="admin-input"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="مثال: يرجى كتابة الاسم المراد تطريزه في الملاحظات"
                  disabled={loading}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={colorSelectionEnabled}
                    onChange={(e) => setColorSelectionEnabled(e.target.checked)}
                    disabled={loading}
                  />
                  <span>تفعيل اختيار اللون من الزبون</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isHidden}
                    onChange={(e) => setIsHidden(e.target.checked)}
                    disabled={loading}
                  />
                  <span>إخفاء المنتج من صفحة المتجر</span>
                </label>
              </div>

              <div className="form-group">
                <label>صورة المنتج (يمكن اختيار متعدد)</label>
                <label htmlFor="product-image" className="admin-upload-box" style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ccc', borderRadius: '8px', cursor: 'pointer' }}>
                  <span className="upload-icon">📸</span>
                  <span className="upload-text" style={{ marginRight: '8px' }}>اختر صور للمنتج</span>
                  <input
                    id="product-image"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                    disabled={loading}
                  />
                </label>
              </div>
            </div>

            {images.length > 0 && (
              <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <p style={{ fontWeight: '700', marginBottom: '0.5rem', color: 'var(--iris-purple)' }}>معاينة صور المنتج:</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {images.map((img) => (
                    <div key={img.id} style={{ position: 'relative' }}>
                      <img
                        src={img.url}
                        alt="معاينة"
                        style={{
                          width: '100px',
                          height: '100px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          border: '1px solid #ccc'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img.id)}
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          background: 'red',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn-action confirm" style={{ padding: '0.75rem 2rem', fontSize: '1rem', width: 'auto' }} disabled={loading}>
                {loading ? '⏳ جاري الحفظ...' : editingId ? 'تحديث المنتج' : 'إضافة المنتج'}
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
            <h3>لا توجد منتجات طباعة مضافة بعد.</h3>
          </div>
        ) : (
          <div className="admin-items-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '24px' }}>
            {items.map((it) => {
              let firstImg = '';
              if (Array.isArray(it.image_urls) && it.image_urls.length > 0) {
                firstImg = it.image_urls[0];
              } else if (typeof it.image_urls === 'string') {
                try {
                  const parsed = JSON.parse(it.image_urls || '[]');
                  if (parsed.length > 0) firstImg = parsed[0];
                } catch {
                  firstImg = it.image_urls;
                }
              }
              return (
                <div key={it.id} className="admin-item-card" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    {firstImg ? (
                      <img src={firstImg} alt={it.name} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} />
                    ) : (
                      <div style={{ width: '100%', height: '140px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', color: '#aaa' }}>بدون صورة</div>
                    )}
                    <h3 style={{ marginTop: '12px', fontSize: '1.15rem' }}>{it.name}</h3>
                    <div style={{ color: 'var(--iris-green)', fontWeight: 'bold', fontSize: '1.2rem', margin: '4px 0' }}>{it.price} JOD</div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>التصنيف: {it.category}</div>
                    {it.color_selection_enabled && <div style={{ fontSize: '0.8rem', color: 'blue' }}>[اختيار اللون مفعل]</div>}
                    {it.is_hidden && <span style={{ color: 'red', fontSize: '0.8rem', fontWeight: 'bold' }}>[مخفي]</span>}
                  </div>
                  <div className="card-actions" style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button className="btn-action edit" onClick={() => handleEdit(it)} style={{ flex: 1, background: '#f1f1f1', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer' }}>تعديل</button>
                    <button className="btn-action reject" onClick={() => handleDelete(it.id, it.image_urls)} style={{ flex: 1, background: '#fee', color: 'red', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer' }}>حذف</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </AdminLayout>
  );
};

export default AdminProducts;
