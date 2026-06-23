import React, { useEffect, useState, useRef } from 'react';
import { supabase, uploadFile, deleteFile, extractPathFromUrl } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';
import '../styles/admin.css';
import '../styles/graduation.css';

const CATEGORIES = [
  { value: 'cover',      label: 'قوالب الغلاف الخارجي' },
  { value: 'inside',     label: 'قوالب الورق الداخلي' },
  { value: 'dedication', label: 'قوالب ورق الإهداء' },
];

const AdminTemplates = () => {
  const [templates, setTemplates]   = useState([]);
  const [newPreview, setNewPreview] = useState('');
  const [newFile,    setNewFile]    = useState(null);
  const [newCat,    setNewCat]      = useState('cover');
  const [newTitle,  setNewTitle]    = useState('');
  const [loading,   setLoading]    = useState(false);
  
  const [editId,    setEditId]      = useState(null);
  const [editTitle, setEditTitle]   = useState('');
  
  const [replaceId, setReplaceId]   = useState(null);
  
  const [showDeleteId, setShowDeleteId] = useState(null);
  const [lightbox,  setLightbox]    = useState(null);
  const [filterCat, setFilterCat]   = useState('all');
  const [saveFlash, setSaveFlash]   = useState(false);
  
  const fileRef = useRef();
  const replaceFileRef = useRef();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data, error } = await supabase
          .from('template_items')
          .select('*')
          .order('created_at', { ascending: true });
        if (error) throw error;
        if (data) setTemplates(data);
      } catch (e) {
        console.error('Failed to load templates:', e);
        setTemplates([]);
      }
    };
    fetchTemplates();
  }, []);

  const flash = () => {
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 1500);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewFile(file);
    setNewPreview(URL.createObjectURL(file));
  };

  const handleReplaceFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !replaceId) return;
    
    try {
      const tpl = templates.find(t => t.id === replaceId);
      
      // Delete old file
      if (tpl?.image_url) {
        const oldPath = extractPathFromUrl(tpl.image_url, 'templates');
        if (oldPath) await deleteFile('templates', oldPath);
      }
      
      // Upload new file
      const filePath = `${Date.now()}-${file.name}`;
      const imageUrl = await uploadFile('templates', filePath, file);
      
      // Update database
      const { error } = await supabase
        .from('template_items')
        .update({ image_url: imageUrl })
        .eq('id', replaceId);
      if (error) throw error;
      
      setTemplates(templates.map(t => t.id === replaceId ? { ...t, image_url: imageUrl } : t));
      flash();
    } catch (err) {
      alert('حدث خطأ أثناء استبدال الصورة: ' + err.message);
    }
    
    setReplaceId(null);
    if (replaceFileRef.current) replaceFileRef.current.value = '';
  };

  const addTemplate = async () => {
    if (!newFile) return;
    
    setLoading(true);
    try {
      const filePath = `${Date.now()}-${newFile.name}`;
      const imageUrl = await uploadFile('templates', filePath, newFile);
      
      const title = newTitle.trim() || categoryLabel(newCat);
      
      const { data, error } = await supabase
        .from('template_items')
        .insert({
          category: newCat,
          image_url: imageUrl,
          title,
        })
        .select()
        .single();
      if (error) throw error;
      
      setTemplates([...templates, data]);
      setNewPreview('');
      setNewFile(null);
      setNewTitle('');
      if (fileRef.current) fileRef.current.value = '';
      flash();
    } catch (err) {
      alert('حدث خطأ أثناء رفع القالب: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id) => {
    try {
      const tpl = templates.find(t => t.id === id);
      if (tpl?.image_url) {
        const path = extractPathFromUrl(tpl.image_url, 'templates');
        if (path) await deleteFile('templates', path);
      }
      
      const { error } = await supabase
        .from('template_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
      
      setTemplates(templates.filter((t) => t.id !== id));
      setShowDeleteId(null);
      flash();
    } catch (err) {
      alert('حدث خطأ أثناء الحذف: ' + err.message);
    }
  };

  const saveEdit = async (id) => {
    try {
      const newTitleVal = editTitle.trim();
      const { error } = await supabase
        .from('template_items')
        .update({ title: newTitleVal || templates.find(t => t.id === id)?.title })
        .eq('id', id);
      if (error) throw error;
      
      setTemplates(templates.map((t) => t.id === id ? { ...t, title: newTitleVal || t.title } : t));
      setEditId(null);
      flash();
    } catch (err) {
      alert('حدث خطأ أثناء التعديل: ' + err.message);
    }
  };

  const categoryLabel = (cat) =>
    CATEGORIES.find((c) => c.value === cat)?.label || cat;

  const filtered =
    filterCat === 'all' ? templates : templates.filter((t) => t.category === filterCat);

  // Calculate global number per category
  const getTemplateNumber = (tpl) => {
    const catTemplates = templates.filter(t => t.category === tpl.category);
    return catTemplates.indexOf(tpl) + 1;
  };

  return (
    <AdminLayout>
      <section>
        <h2 className="section-title">إدارة القوالب</h2>
        <p className="section-subtitle">
          أضف وعدّل قوالب الغلاف الخارجي، الورق الداخلي، وورق الإهداء. سيتم ترقيم القوالب تلقائياً لكل فئة.
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

        {/* Upload form */}
        <div className="table-container" style={{ marginBottom: 28, padding: '24px' }}>
          <h3 style={{ color: 'var(--iris-purple)', fontWeight: 800, marginBottom: 20, fontSize: '1.05rem' }}>
            رفع قالب جديد
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label className="grad-label" style={{ marginBottom: 6, display: 'block', fontSize: '0.9rem' }}>
                الفئة <span className="grad-required">*</span>
              </label>
              <select
                className="admin-input"
                style={{ width: '100%' }}
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="grad-label" style={{ marginBottom: 6, display: 'block', fontSize: '0.9rem' }}>
                عنوان القالب (اختياري)
              </label>
              <input
                type="text"
                className="admin-input"
                style={{ width: '100%' }}
                placeholder="مثال: قالب ورود"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
          </div>

          <div
            className="admin-tpl-upload-box"
            onClick={() => fileRef.current?.click()}
            style={{ marginBottom: 16 }}
          >
            {newPreview ? (
              <img
                src={newPreview}
                alt="preview"
                style={{ maxHeight: 160, maxWidth: '100%', borderRadius: 8, objectFit: 'contain' }}
              />
            ) : (
              <>
                <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🖼️</div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>انقر لرفع صورة القالب</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>JPG / PNG / WEBP</div>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          <button
            className="btn-action confirm"
            style={{ padding: '10px 28px', fontSize: '0.97rem' }}
            onClick={addTemplate}
            disabled={!newFile || loading}
          >
            {loading ? '⏳ جاري الرفع...' : 'إضافة القالب'}
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {[{ value: 'all', label: 'الكل' }, ...CATEGORIES].map((c) => (
            <button
              key={c.value}
              onClick={() => setFilterCat(c.value)}
              style={{
                padding: '7px 18px',
                borderRadius: 50,
                border: '2px solid var(--iris-purple)',
                background: filterCat === c.value ? 'var(--iris-purple)' : 'transparent',
                color: filterCat === c.value ? '#fff' : 'var(--iris-purple)',
                fontFamily: 'inherit',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Hidden input for replace */}
        <input
          ref={replaceFileRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          style={{ display: 'none' }}
          onChange={handleReplaceFileChange}
        />

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🖼️</div>
            <h3>لا توجد قوالب في هذه الفئة</h3>
            <p>ارفع قالباً جديداً من الأعلى.</p>
          </div>
        ) : (
          <div className="admin-tpl-grid">
            {filtered.map((tpl) => (
              <div key={tpl.id} className="admin-tpl-card">
                {tpl.image_url ? (
                  <div style={{ position: 'relative' }}>
                    <img
                      src={tpl.image_url}
                      alt={tpl.title}
                      className="admin-tpl-img"
                      onClick={() => setLightbox(tpl)}
                      style={{ cursor: 'zoom-in' }}
                    />
                    <button 
                      className="admin-tpl-replace-btn"
                      onClick={() => { setReplaceId(tpl.id); replaceFileRef.current?.click(); }}
                      title="استبدال الصورة"
                    >
                      🔄
                    </button>
                  </div>
                ) : (
                  <div className="admin-tpl-img-placeholder">🖼️</div>
                )}

                <div className="admin-tpl-footer">
                  <span
                    style={{
                      fontSize: '0.72rem',
                      background: 'var(--iris-bg)',
                      borderRadius: 50,
                      padding: '2px 8px',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                    }}
                  >
                    #{getTemplateNumber(tpl)}
                  </span>

                  {editId === tpl.id ? (
                    <>
                      <input
                        type="text"
                        className="admin-input"
                        style={{ flex: 1, fontSize: '0.82rem', padding: '4px 8px' }}
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="btn-action confirm"
                        style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                        onClick={() => saveEdit(tpl.id)}
                      >
                        حفظ
                      </button>
                    </>
                  ) : (
                    <span style={{ flex: 1, fontSize: '0.82rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tpl.title}
                    </span>
                  )}
                </div>

                <div style={{ padding: '0 10px 10px', display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    className="btn-action complete"
                    style={{ flex: 1, fontSize: '0.78rem', padding: '5px' }}
                    onClick={() => { setEditId(tpl.id); setEditTitle(tpl.title); }}
                  >
                    تعديل الاسم
                  </button>
                  <button
                    type="button"
                    className="btn-action delete"
                    style={{ flex: 1, fontSize: '0.78rem', padding: '5px' }}
                    onClick={() => setShowDeleteId(tpl.id)}
                  >
                    حذف
                  </button>
                </div>

                <div style={{ padding: '0 10px 10px', fontSize: '0.73rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  {categoryLabel(tpl.category)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
            <img src={lightbox.image_url} alt={lightbox.title} className="lightbox-img" />
            <div className="lightbox-caption">{lightbox.title}</div>
            <div className="lightbox-num">القالب رقم #{getTemplateNumber(lightbox)} — {categoryLabel(lightbox.category)}</div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {showDeleteId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">تأكيد الحذف</h3>
            <p className="modal-message">هل أنت متأكد من حذف هذا القالب؟ لا يمكن التراجع.</p>
            <div className="modal-buttons">
              <button className="modal-btn cancel"  onClick={() => setShowDeleteId(null)}>إلغاء</button>
              <button className="modal-btn confirm" onClick={() => deleteTemplate(showDeleteId)}>حذف</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminTemplates;
