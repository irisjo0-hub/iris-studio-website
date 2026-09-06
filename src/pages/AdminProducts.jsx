import React, { useState, useEffect } from 'react';
import { supabase, uploadFile, deleteFile, extractPathFromUrl } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';
import '../styles/admin.css';

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const parseImageUrls = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value || '[]');
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      return value ? [value] : [];
    }
  }
  return [];
};

const AdminProducts = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('بوسترات');
  const [availableColors, setAvailableColors] = useState('');
  const [colorSelectionEnabled, setColorSelectionEnabled] = useState(false);
  const [customNotes, setCustomNotes] = useState('');
  const [isHidden, setIsHidden] = useState(false);
  const [images, setImages] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('printing_products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setItems(Array.isArray(data) ? data : []);
      try {
        localStorage.setItem('iris_printing_products', JSON.stringify(Array.isArray(data) ? data : []));
      } catch (cacheError) {
        console.warn('Could not update product cache:', cacheError);
      }
    } catch (e) {
      console.error('Failed to load printing products:', e);
      setItems([]);
    }
  };

  useEffect(() => {
    void fetchItems();
  }, []);

  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.type === 'new' && img.url?.startsWith('blob:')) URL.revokeObjectURL(img.url);
      });
    };
  }, [images]);

  const handleAddUrlImage = () => {
    const value = imageUrlInput.trim();
    if (!value) return;
    try {
      const url = new URL(value, window.location.origin);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('unsupported protocol');
      setImages(prev => [...prev, { id: `url-${Date.now()}-${prev.length}`, type: 'existing', url: value }]);
      setImageUrlInput('');
    } catch {
      alert('يرجى إدخال رابط صورة صالح يبدأ بـ http:// أو https://');
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = [];
    for (const file of files) {
      if (!IMAGE_TYPES.has(file.type)) {
        alert(`الملف ${file.name} ليس صورة مدعومة. استخدم JPG أو PNG أو WEBP أو GIF.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert(`الملف ${file.name} أكبر من 10MB.`);
        continue;
      }
      validFiles.push(file);
    }

    const newImages = validFiles.map((file, i) => ({
      id: `new-${Date.now()}-${i}`,
      type: 'new',
      url: URL.createObjectURL(file),
      file
    }));
    setImages(prev => [...prev, ...newImages]);
    e.target.value = '';
  };

  const handleRemoveImage = (imgId) => {
    setImages(prev => {
      const target = prev.find(img => img.id === imgId);
      if (target?.type === 'new' && target.url?.startsWith('blob:')) URL.revokeObjectURL(target.url);
      return prev.filter(img => img.id !== imgId);
    });
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
    setImageUrlInput('');
    setEditingId(null);
  };

  const handleEdit = (prod) => {
    setEditingId(prod.id);
    setName(prod.name || '');
    setPrice(String(prod.price ?? ''));
    setDescription(prod.description || '');
    setCategory(prod.category || 'بوسترات');
    setColorSelectionEnabled(Boolean(prod.color_selection_enabled));
    setCustomNotes(prod.custom_notes || '');
    setIsHidden(Boolean(prod.is_hidden));
    const urls = parseImageUrls(prod.image_urls);
    setImages(urls.map((url, i) => ({ id: `existing-${i}`, type: 'existing', url })));
  
    let colorsArr = [];
    if (Array.isArray(prod.available_colors)) colorsArr = prod.available_colors;
    else if (typeof prod.available_colors === 'string') {
      try { colorsArr = JSON.parse(prod.available_colors || '[]'); } catch { colorsArr = []; }
    }
    setAvailableColors(colorsArr.join(', '));
    setImageUrlInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsedPrice = Number(price);
    if (!name.trim()) {
      alert('الرجاء إدخال اسم المنتج');
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      alert('الرجاء إدخال سعر صحيح أكبر من أو يساوي صفر.');
      return;
    }

    setLoading(true);
    const newlyUploadedUrls = [];

    try {
      const finalUrls = [];
      for (const img of images) {
        if (img.type === 'existing') {
          finalUrls.push(img.url);
          continue;
        }

        if (img.type === 'new' && img.file) {
          const filePath = `products-${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${img.file.name}`;
          const uploadedUrl = await uploadFile('packages', filePath, img.file);
          newlyUploadedUrls.push(uploadedUrl);
          finalUrls.push(uploadedUrl);
        }
      }

      const parsedColors = availableColors.split(/[,،/\n]+/).map(c => c.trim()).filter(Boolean);
      const productData = {
        name: name.trim(),
        price: parsedPrice,
        description: description.trim(),
        image_urls: finalUrls,
        category: category.trim() || 'أخرى',
        available_colors: parsedColors,
        color_selection_enabled: Boolean(colorSelectionEnabled),
        custom_notes: customNotes.trim(),
        is_hidden: Boolean(isHidden)
      };

      if (editingId) {
        const previous = items.find(item => item.id === editingId);
        const { error } = await supabase
          .from('printing_products')
          .update(productData)
          .eq('id', editingId);
        if (error) throw error;

        const updated = items.map(item => item.id === editingId ? { ...item, ...productData } : item);
        setItems(updated);
        try { localStorage.setItem('iris_printing_products', JSON.stringify(updated)); } catch (cacheError) { console.warn('Could not update product cache:', cacheError); }
        alert('تم تعديل المنتج بنجاح');

        // Remove only old package-bucket assets that are no longer referenced, after DB success.
        const previousUrls = parseImageUrls(previous?.image_urls);
        const keptUrls = new Set(finalUrls);
        for (const oldUrl of previousUrls) {
          if (keptUrls.has(oldUrl)) continue;
          const oldPath = extractPathFromUrl(oldUrl, 'packages');
          if (!oldPath) continue;
          try { await deleteFile('packages', oldPath); } catch (storageError) { console.warn('Old product image cleanup failed:', storageError); }
        }
      } else {
        const { data, error } = await supabase
          .from('printing_products')
          .insert(productData)
          .select()
          .single();
        if (error) throw error;

        const newProduct = data;
        setItems(prev => [newProduct, ...prev]);
        try {
          const current = [newProduct, ...items];
          localStorage.setItem('iris_printing_products', JSON.stringify(current));
        } catch (cacheError) {
          console.warn('Could not update product cache:', cacheError);
        }
        alert('تم إضافة المنتج بنجاح وتحديث المتجر');
      }

      resetForm();
      await fetchItems();
    } catch (err) {
      for (const uploadedUrl of newlyUploadedUrls) {
        const uploadedPath = extractPathFromUrl(uploadedUrl, 'packages');
        if (!uploadedPath) continue;
        try { await deleteFile('packages', uploadedPath); } catch (cleanupError) { console.warn('Could not clean up orphaned product image:', cleanupError); }
      }
      console.error('Failed to save printing product:', err);
      alert('حدث خطأ أثناء حفظ المنتج: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, imageUrls) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('printing_products')
        .delete()
        .eq('id', id);
      if (error) throw error;

      setItems(prev => prev.filter((it) => it.id !== id));
      try {
        const current = items.filter((it) => it.id !== id);
        localStorage.setItem('iris_printing_products', JSON.stringify(current));
      } catch (cacheError) {
        console.warn('Could not update product cache:', cacheError);
      }
      alert('تم حذف المنتج بنجاح');

      for (const url of parseImageUrls(imageUrls)) {
        const path = extractPathFromUrl(url, 'packages');
        if (!path) continue;
        try { await deleteFile('packages', path); } catch (storageError) { console.warn('Product image cleanup failed:', storageError); }
      }
    } catch (err) {
      console.error('Failed to delete printing product:', err);
      alert('حدث خطأ أثناء حذف المنتج: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <section className="admin-packages-section" style={{ direction: 'rtl', padding: '16px', maxWidth: '100%', overflowX: 'hidden' }}>
        <h2 className="section-title">إدارة منتجات الطباعة</h2>
        <p className="section-subtitle">إضافة وتعديل وحذف منتجات التصميم والطباعة المخصصة للبيع.</p>

        <div className="admin-form-card" style={{ maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
          <h3 style={{ marginBottom: '1.2rem', color: '#F5BD1A', fontSize: '1.3rem' }}>{editingId ? '📝 تعديل منتج الطباعة' : '➕ إضافة منتج جديد'}</h3>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div className="admin-form-grid-responsive">
              <div className="form-group"><label className="as-label">اسم المنتج *</label><input type="text" className="admin-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: وشاح تخرج مطرز" disabled={loading} required /></div>
              <div className="form-group"><label className="as-label">السعر (JOD) *</label><input type="number" min="0" step="0.01" className="admin-input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="مثال: 15" disabled={loading} required /></div>
              <div className="form-group"><label className="as-label">التصنيف</label><select className="admin-input" value={category} onChange={(e) => setCategory(e.target.value)} style={{ height: '43px' }} disabled={loading}><option value="بوسترات">بوسترات</option><option value="أوشحة وطواقي">أوشحة وطواقي</option><option value="هدايا ومطبوعات">هدايا ومطبوعات</option><option value="أخرى">أخرى</option></select></div>
              <div className="form-group full-width-group"><label className="as-label">الوصف التفصيلي للمنتج</label><textarea className="admin-input" style={{ minHeight: '80px', resize: 'vertical' }} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="اكتب وصفاً مفصلاً للمنتج ومواصفاته..." disabled={loading} /></div>
              <div className="form-group full-width-group"><label className="as-label">الألوان المتاحة (افصل بينها بفاصلة)</label><input type="text" className="admin-input" value={availableColors} onChange={(e) => setAvailableColors(e.target.value)} placeholder="مثال: أبيض, كحلي, أسود, نبيذي" disabled={loading} /></div>
              <div className="form-group full-width-group"><label className="as-label">ملاحظات إرشادية للزبون</label><input type="text" className="admin-input" value={customNotes} onChange={(e) => setCustomNotes(e.target.value)} placeholder="مثال: يرجى كتابة الاسم المراد تطريزه في الملاحظات" disabled={loading} /></div>
              <div className="form-group full-width-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#ECEBE7' }}><input type="checkbox" checked={colorSelectionEnabled} onChange={(e) => setColorSelectionEnabled(e.target.checked)} disabled={loading} /><span>تفعيل اختيار اللون من الزبون</span></label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#ECEBE7' }}><input type="checkbox" checked={isHidden} onChange={(e) => setIsHidden(e.target.checked)} disabled={loading} /><span>إخفاء المنتج من صفحة المتجر</span></label>
              </div>
              <div className="form-group full-width-group">
                <label className="as-label">صور المنتج (إضافة متعددة - رفع أو روابط)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label htmlFor="product-image" className="admin-upload-box" style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #F5BD1A', borderRadius: '10px', cursor: 'pointer', background: 'rgba(245, 189, 26, 0.08)' }}><span className="upload-icon" style={{ fontSize: '1.2rem' }}>📸</span><span className="upload-text" style={{ marginRight: '8px', color: '#F5BD1A', fontWeight: 'bold' }}>اختر صور من جهازك (اختيار متعدد)</span><input id="product-image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={handleImageChange} style={{ display: 'none' }} disabled={loading} /></label>
                  <div style={{ display: 'flex', gap: '8px' }}><input type="url" className="admin-input" placeholder="أو ألصق رابط صورة مباشر هنا (https://...)" value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} disabled={loading} style={{ flex: 1 }} /><button type="button" onClick={handleAddUrlImage} disabled={loading} style={{ background: 'linear-gradient(135deg, #F5BD1A 0%, #D49D0E 100%)', color: '#120911', border: 'none', borderRadius: '8px', padding: '0 16px', fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap' }}>+ إضافة الصورة</button></div>
                </div>
              </div>
            </div>

            {images.length > 0 && <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}><p style={{ fontWeight: '700', marginBottom: '0.5rem', color: 'var(--iris-purple)' }}>معاينة صور المنتج:</p><div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>{images.map((img) => <div key={img.id} style={{ position: 'relative' }}><img src={img.url} alt="معاينة" style={{ width: '100px', height: '100px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #ccc' }} /><button type="button" onClick={() => handleRemoveImage(img.id)} style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>✕</button></div>)}</div></div>}

            <div style={{ display: 'flex', gap: '12px' }}><button type="submit" className="btn-action confirm" style={{ padding: '0.75rem 2rem', fontSize: '1rem', width: 'auto' }} disabled={loading}>{loading ? '⏳ جاري الحفظ...' : editingId ? 'تحديث المنتج' : 'إضافة المنتج'}</button>{editingId && <button type="button" className="btn-action reject" onClick={resetForm} style={{ padding: '0.75rem 2rem', fontSize: '1rem', width: 'auto' }} disabled={loading}>إلغاء التعديل</button>}</div>
          </form>
        </div>

        {items.length === 0 ? <div className="admin-empty-state"><h3>لا توجد منتجات طباعة مضافة بعد.</h3></div> : <div className="admin-items-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '24px' }}>
          {items.map((it) => {
            const firstImg = parseImageUrls(it.image_urls)[0] || '';
            return <div key={it.id} className="admin-item-card" style={{ background: 'linear-gradient(145deg, rgba(42, 18, 38, 0.95) 0%, rgba(18, 9, 17, 0.98) 100%)', borderRadius: '18px', border: '1.5px solid rgba(245, 189, 26, 0.35)', overflow: 'hidden', padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <div>{firstImg ? <img src={firstImg} alt={it.name} loading="lazy" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} /> : <div style={{ width: '100%', height: '160px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>بدون صورة</div>}<h3 style={{ margin: '12px 0 4px 0', fontSize: '1.2rem', fontWeight: '900', color: '#FFFFFF' }}>{it.name}</h3><div style={{ color: '#F5BD1A', fontWeight: '900', fontSize: '1.3rem', margin: '4px 0' }}>{it.price} JOD</div><div style={{ fontSize: '0.85rem', color: 'rgba(236, 235, 231, 0.7)', margin: '4px 0' }}>التصنيف: {it.category}</div>{it.color_selection_enabled && <div style={{ fontSize: '0.8rem', color: '#2ECC71', fontWeight: 'bold', marginTop: '4px' }}>✓ [اختيار اللون مفعل]</div>}{it.is_hidden && <span style={{ color: '#E74C3C', fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>🔒 [مخفي من المتجر]</span>}</div>
              <div className="card-actions" style={{ display: 'flex', gap: '10px', marginTop: '18px' }}><button type="button" className="btn-action edit" onClick={() => handleEdit(it)} disabled={loading} style={{ flex: 1, background: 'rgba(245, 189, 26, 0.15)', color: '#F5BD1A', border: '1px solid #F5BD1A', borderRadius: '50px', padding: '10px', fontWeight: '800', cursor: 'pointer' }}>تعديل 📝</button><button type="button" className="btn-action reject" onClick={() => void handleDelete(it.id, it.image_urls)} disabled={loading} style={{ flex: 1, background: 'rgba(231, 76, 60, 0.2)', color: '#E74C3C', border: '1px solid #E74C3C', borderRadius: '50px', padding: '10px', fontWeight: '800', cursor: 'pointer' }}>حذف 🗑️</button></div>
            </div>;
          })}
        </div>}
      </section>
    </AdminLayout>
  );
};

export default AdminProducts;
