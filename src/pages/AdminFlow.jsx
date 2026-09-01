import React, { useState, useEffect } from 'react';
import { getFlowItems, getFlowItemsAsync, saveFlowItems } from '../repositories/flowRepository';
import { uploadFile } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';
import { Plus, Trash2, Edit2, Check, X, ArrowUp, ArrowDown, Eye, EyeOff, Film, Sparkles, Image as ImageIcon, Link as LinkIcon, Upload } from 'lucide-react';
import '../styles/admin.css';

export const AdminFlow = () => {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [uploadingMedia, setUploadingMedia] = useState(false);

  useEffect(() => {
    setItems(getFlowItems());
    getFlowItemsAsync().then(loadedItems => {
      if (loadedItems && loadedItems.length > 0) {
        setItems(loadedItems);
      }
    });
  }, []);

  const handleSaveAll = () => {
    saveFlowItems(items);
    alert('✅ تم حفظ جميع تغييرات الريلز بنجاح!');
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setFormData({ ...item });
  };

  const handleFormChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMedia(true);
    try {
      let publicUrl = '';
      const isVideo = file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.mp4') || file.name.toLowerCase().endsWith('.mov') || file.name.toLowerCase().endsWith('.webm');

      try {
        const filePath = `reels/${Date.now()}-${file.name}`;
        publicUrl = await uploadFile('portfolio', filePath, file);
      } catch (err) {
        console.warn('Supabase storage fallback to Object URL:', err);
        // Use URL.createObjectURL for videos or files > 2MB to prevent STATUS_BREAKPOINT browser crash
        if (isVideo || file.size > 2 * 1024 * 1024) {
          publicUrl = URL.createObjectURL(file);
        } else {
          publicUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
        }
      }

      setFormData((prev) => ({
        ...prev,
        image: publicUrl,
        media_url: publicUrl,
        media_type: isVideo ? 'video' : 'image'
      }));
    } catch (err) {
      alert('حدث خطأ أثناء رفع الملف: ' + err.message);
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleAddNewReel = () => {
    const newId = `flow-${Date.now()}`;
    const newItem = {
      id: newId,
      enabled: true,
      sort_order: items.length + 1,
      slug: `reel-${items.length + 1}`,
      category_key: 'NEW',
      category_label_ar: 'خدمة جديدة',
      category_label_en: 'NEW SERVICE',
      image: '',
      media_url: '',
      media_type: 'image',
      alt_ar: 'ريل جديد',
      alt_en: 'New Reel',
      headline_ar: 'عنوان الريل الجديد الخاص بك',
      headline_en: 'Your New Custom Reel Headline',
      secondary_text_ar: 'وصف فرعي مختصر ومخصص للخدمة',
      secondary_text_en: 'Short secondary description for your custom service',
      cta_label_ar: 'احجز الآن',
      cta_label_en: 'Book Now',
      cta_url: '/booking',
      cta_icon_type: 'calendar',
      feedback_enabled: true
    };

    const updated = [...items, newItem];
    setItems(updated);
    saveFlowItems(updated);
    handleEditClick(newItem);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const updated = items.map((it) => (it.id === editingId ? { ...formData } : it));
    setItems(updated);
    saveFlowItems(updated);
    setEditingId(null);
  };

  const handleDeleteReel = (id) => {
    if (!window.confirm('هل أنت تأكد من رغبتك في حذف هذا الريل؟')) return;
    const updated = items.filter((it) => it.id !== id).map((it, idx) => ({ ...it, sort_order: idx + 1 }));
    setItems(updated);
    saveFlowItems(updated);
  };

  const toggleEnabled = (id) => {
    const updated = items.map((it) => (it.id === id ? { ...it, enabled: !it.enabled } : it));
    setItems(updated);
    saveFlowItems(updated);
  };

  const moveOrder = (idx, dir) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const copy = [...items];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    copy.forEach((it, i) => (it.sort_order = i + 1));
    setItems(copy);
    saveFlowItems(copy);
  };

  return (
    <AdminLayout>
      <div className="admin-flow-container text-[#ECEBE7] dir-rtl" dir="rtl" style={{ padding: '10px 0' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#ECEBE7', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>🎬</span>
              <span>إدارة وتخصيص الريلز (IRIS Flow)</span>
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'rgba(236, 235, 231, 0.7)', margin: '4px 0 0' }}>
              التحكم الكامل بكل سلايد/ريل في الواجهة الرئيسية: الصور، الفيديوهات، العناوين، وأزرار التوجيه.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleAddNewReel}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#ECEBE7',
                border: '1px solid rgba(236, 235, 231, 0.25)',
                borderRadius: '50px',
                padding: '10px 20px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={18} />
              <span>إضافة ريل جديد</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              style={{
                background: 'rgba(236, 235, 231, 0.15)',
                color: '#ECEBE7',
                border: '1px solid rgba(236, 235, 231, 0.3)',
                borderRadius: '50px',
                padding: '10px 24px',
                fontWeight: '900',
                cursor: 'pointer',
                fontSize: '0.92rem'
              }}
            >
              حفظ جميع التغييرات 💾
            </button>
          </div>
        </div>

        {/* Reels List Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="admin-flow-item-card"
              style={{
                opacity: item.enabled ? 1 : 0.65
              }}
            >
              {/* Left Info Cluster */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0, flexWrap: 'wrap' }}>
                {/* Index Pill */}
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: '900',
                  color: '#ECEBE7',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(236, 235, 231, 0.2)',
                  borderRadius: '50%',
                  width: '42px',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  0{idx + 1}
                </div>

                {/* Media Preview Box */}
                <div style={{ width: '64px', height: '64px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0, position: 'relative', background: '#000' }}>
                  {item.media_type === 'video' || (item.media_url && (item.media_url.endsWith('.mp4') || item.media_url.endsWith('.mov') || item.media_url.endsWith('.webm') || item.media_url.startsWith('blob:') || item.media_url.startsWith('data:video'))) ? (
                    <video src={item.media_url || item.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
                  ) : (
                    <img src={item.image || item.media_url || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80'} alt={item.category_label_ar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                  {item.media_type === 'video' && (
                    <span style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.8)', color: '#ECEBE7', padding: '1px 4px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 'bold' }}>
                      🎬 فيديو
                    </span>
                  )}
                </div>

                {/* Meta details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ color: '#ECEBE7', fontWeight: '900', fontSize: '0.95rem' }}>
                      {item.category_label_ar || item.category_key}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>/</span>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      {item.category_label_en}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '0.94rem', fontWeight: 'bold', color: '#FFFFFF', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.headline_ar || item.headline_en}
                  </h3>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '3px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.74rem', background: 'rgba(255, 255, 255, 0.08)', color: '#ECEBE7', padding: '2px 10px', borderRadius: '50px', border: '1px solid rgba(236, 235, 231, 0.2)', fontWeight: 'bold' }}>
                      🔘 {item.cta_label_ar || 'زر التفاعل'} → <span dir="ltr">{item.cta_url}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
                {/* Order Up / Down */}
                <button
                  type="button"
                  onClick={() => moveOrder(idx, -1)}
                  disabled={idx === 0}
                  style={{ opacity: idx === 0 ? 0.3 : 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#FFF', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}
                  title="تحريك للأعلى"
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => moveOrder(idx, 1)}
                  disabled={idx === items.length - 1}
                  style={{ opacity: idx === items.length - 1 ? 0.3 : 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#FFF', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}
                  title="تحريك لأسفل"
                >
                  <ArrowDown size={16} />
                </button>

                {/* Enable / Disable Status Button */}
                <button
                  type="button"
                  onClick={() => toggleEnabled(item.id)}
                  style={{
                    background: item.enabled ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: item.enabled ? '#4ADE80' : '#F87171',
                    border: item.enabled ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {item.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
                  <span>{item.enabled ? 'مفعل' : 'معطل'}</span>
                </button>

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => handleEditClick(item)}
                  style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ECEBE7', border: '1px solid rgba(236, 235, 231, 0.3)', borderRadius: '8px', padding: '6px 14px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Edit2 size={14} />
                  <span>تعديل ✏️</span>
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleDeleteReel(item.id)}
                  style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '6px 8px', cursor: 'pointer' }}
                  title="حذف هذا الريل"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Edit Dialog */}
        {editingId && (
          <div className="admin-flow-modal-overlay">
            <form onSubmit={handleFormSubmit} className="admin-flow-modal-card">
              {/* Modal Header */}
              <div className="admin-flow-modal-header">
                <h2 className="admin-flow-modal-title">
                  <span>✏️</span>
                  <span>تعديل بيانات الريل ({formData.category_label_ar || 'مخصص'})</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="admin-flow-close-btn"
                  aria-label="إغلاق النافذة"
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', boxSizing: 'border-box' }}>
                {/* 1. Category Labels */}
                <div className="admin-flow-grid-2">
                  <div className="admin-flow-field-group">
                    <label className="admin-flow-field-label">اسم الفئة (عربي) *</label>
                    <input
                      type="text"
                      className="admin-input"
                      required
                      placeholder="مثال: ميديا / تصوير المنتجات..."
                      value={formData.category_label_ar || ''}
                      onChange={(e) => handleFormChange('category_label_ar', e.target.value)}
                    />
                  </div>
                  <div className="admin-flow-field-group">
                    <label className="admin-flow-field-label">Category Name (English) *</label>
                    <input
                      type="text"
                      className="admin-input"
                      required
                      placeholder="e.g. MEDIA / PRODUCT PHOTOGRAPHY"
                      value={formData.category_label_en || ''}
                      onChange={(e) => handleFormChange('category_label_en', e.target.value)}
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* 2. Headline Arabic & English */}
                <div className="admin-flow-field-group">
                  <label className="admin-flow-field-label">العنوان الرئيسي (عربي) *</label>
                  <textarea
                    className="admin-input"
                    style={{ minHeight: '60px', width: '100%', boxSizing: 'border-box' }}
                    required
                    placeholder="العنوان الذي يظهر على الريل بالعربية..."
                    value={formData.headline_ar || ''}
                    onChange={(e) => handleFormChange('headline_ar', e.target.value)}
                  />
                </div>

                <div className="admin-flow-field-group">
                  <label className="admin-flow-field-label">Headline Title (English) *</label>
                  <textarea
                    className="admin-input"
                    style={{ minHeight: '60px', width: '100%', boxSizing: 'border-box' }}
                    required
                    placeholder="Headline text in English..."
                    value={formData.headline_en || ''}
                    onChange={(e) => handleFormChange('headline_en', e.target.value)}
                    dir="ltr"
                  />
                </div>

                {/* 3. Subheading Text */}
                <div className="admin-flow-grid-2">
                  <div className="admin-flow-field-group">
                    <label className="admin-flow-field-label">النص الفرعي الداعم (عربي)</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="توضيح مختصر للمحتوى..."
                      value={formData.secondary_text_ar || ''}
                      onChange={(e) => handleFormChange('secondary_text_ar', e.target.value)}
                    />
                  </div>
                  <div className="admin-flow-field-group">
                    <label className="admin-flow-field-label">Secondary Text (EN)</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Short supporting description..."
                      value={formData.secondary_text_en || ''}
                      onChange={(e) => handleFormChange('secondary_text_en', e.target.value)}
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* 4. Action Button Customization (CTA Label, URL, Icon Type) */}
                <div className="admin-flow-cta-box">
                  <label style={{ fontSize: '0.88rem', fontWeight: '900', color: '#ECEBE7', marginBottom: '12px', display: 'block' }}>
                    🔘 تخصيص زر التوجيه التفاعلي (CTA Button)
                  </label>

                  <div className="admin-flow-grid-2" style={{ marginBottom: '10px' }}>
                    <div className="admin-flow-field-group">
                      <label className="admin-flow-field-label">نص الزر (عربي) *</label>
                      <input
                        type="text"
                        className="admin-input"
                        required
                        placeholder="مثال: احجز جلستك / اطلب مشروعك"
                        value={formData.cta_label_ar || ''}
                        onChange={(e) => handleFormChange('cta_label_ar', e.target.value)}
                      />
                    </div>
                    <div className="admin-flow-field-group">
                      <label className="admin-flow-field-label">Button Text (English) *</label>
                      <input
                        type="text"
                        className="admin-input"
                        required
                        placeholder="e.g. Book Session / Order Print"
                        value={formData.cta_label_en || ''}
                        onChange={(e) => handleFormChange('cta_label_en', e.target.value)}
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="admin-flow-grid-2">
                    <div className="admin-flow-field-group">
                      <label className="admin-flow-field-label">رابط الوجهة (CTA URL) *</label>
                      <input
                        type="text"
                        className="admin-input"
                        required
                        placeholder="مثال: /booking أو /printing-products"
                        value={formData.cta_url || ''}
                        onChange={(e) => handleFormChange('cta_url', e.target.value)}
                        dir="ltr"
                      />
                    </div>
                    <div className="admin-flow-field-group">
                      <label className="admin-flow-field-label">أيقونة الزر (Icon Type)</label>
                      <select
                        className="admin-input"
                        value={formData.cta_icon_type || 'project'}
                        onChange={(e) => handleFormChange('cta_icon_type', e.target.value)}
                      >
                        <option value="project">🎬 مشروع (Project)</option>
                        <option value="camera">📸 كاميرا (Camera)</option>
                        <option value="calendar">📅 تقويم حجز (Calendar)</option>
                        <option value="printer">🖨️ طابعة ومطبوعات (Printer)</option>
                        <option value="shopping">🛍️ متجر وسلة (Shopping)</option>
                        <option value="folder">📁 حافظة أعمال (Folder)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 5. Direct File & Video Upload Box + URL Input */}
                <div className="admin-flow-field-group">
                  <label className="admin-flow-field-label">إرفاق صورة أو فيديو خلفية للريل (Media Upload) *</label>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <label
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px dashed rgba(236, 235, 231, 0.35)',
                        borderRadius: '12px',
                        padding: '10px 18px',
                        color: '#ECEBE7',
                        fontSize: '0.88rem',
                        fontWeight: 'bold',
                        cursor: uploadingMedia ? 'wait' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Upload size={16} />
                      <span>{uploadingMedia ? '⏳ جاري الرفع والتحميل...' : '📁 اختيار صورة أو فيديو من الجهاز'}</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                        disabled={uploadingMedia}
                        style={{ display: 'none' }}
                      />
                    </label>

                    {(formData.image || formData.media_url) && (
                      <span style={{ fontSize: '0.8rem', color: '#4ADE80', fontWeight: 'bold' }}>
                        ✓ تم اختيار الميديا بنجاح
                      </span>
                    )}
                  </div>

                  <input
                    type="text"
                    className="admin-input"
                    required
                    placeholder="رابط الميديا المرفقة أو أدخل رابط مباشر MP4 / صورة..."
                    value={formData.image || formData.media_url || ''}
                    onChange={(e) => {
                      handleFormChange('image', e.target.value);
                      handleFormChange('media_url', e.target.value);
                    }}
                    dir="ltr"
                  />

                  {/* Live Media Preview inside Modal */}
                  {(formData.image || formData.media_url) && (
                    <div style={{ marginTop: '10px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(236, 235, 231, 0.2)', maxHeight: '160px', background: '#000', textAlign: 'center' }}>
                      {formData.media_type === 'video' || (formData.media_url && (formData.media_url.endsWith('.mp4') || formData.media_url.endsWith('.mov') || formData.media_url.endsWith('.webm') || formData.media_url.startsWith('blob:') || formData.media_url.startsWith('data:video'))) ? (
                        <video src={formData.media_url || formData.image} controls style={{ maxHeight: '160px', width: '100%', objectFit: 'contain' }} />
                      ) : (
                        <img src={formData.image || formData.media_url} alt="معاينة" style={{ maxHeight: '160px', width: '100%', objectFit: 'contain' }} />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Controls */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', borderTop: '1px solid rgba(236,235,231,0.12)', paddingTop: '16px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#ECEBE7', border: '1px solid rgba(236,235,231,0.2)', borderRadius: '50px', padding: '10px 22px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  style={{ background: '#ECEBE7', color: '#1A0D18', border: 'none', borderRadius: '50px', padding: '10px 30px', fontWeight: '900', cursor: 'pointer', fontSize: '0.92rem' }}
                >
                  حفظ التعديلات 💾
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminFlow;
