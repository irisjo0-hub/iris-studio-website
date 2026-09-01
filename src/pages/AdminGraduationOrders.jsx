import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';
import '../styles/admin.css';
import '../styles/graduation.css';

const STATUS_OPTIONS = [
  { value: 'pending',        label: 'قيد الانتظار',       colorClass: 'badge-pending' },
  { value: 'approved',       label: 'مقبول',              colorClass: 'badge-approved' },
  { value: 'in_design',      label: 'قيد التصميم',        colorClass: 'badge-design' },
  { value: 'ready_printing', label: 'جاهز للطباعة',       colorClass: 'badge-printing' },
  { value: 'ready_pickup',   label: 'جاهز للاستلام',      colorClass: 'badge-pickup' },
  { value: 'completed',      label: 'مكتمل',              colorClass: 'badge-completed' },
  { value: 'cancelled',      label: 'ملغي',               colorClass: 'badge-cancelled' },
];

/* ── Download helpers ─────────────────────────────────────────── */

// Download an image from a URL
const downloadImage = async (url, fileNamePrefix = 'iris-image') => {
  if (!url) return;
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const ext = blob.type.split('/')[1] || 'jpg';
    const fileName = `${fileNamePrefix}.${ext}`;
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error('Download failed:', err);
    // Fallback: open in new tab
    window.open(url, '_blank');
  }
};

// Open image in a new tab
const openImage = (url) => {
  if (!url) return;
  window.open(url, '_blank');
};

// Download all images in a collection
const downloadAll = (urls, prefix) => {
  urls.forEach((url, i) => downloadImage(url, `${prefix}-${i + 1}`));
};


/* ── Full Image Preview Lightbox ────────────────────────────── */
const ImageLightbox = ({ src, alt, onClose }) => {
  if (!src) return null;
  return (
    <div className="lightbox-overlay" onClick={onClose} style={{ zIndex: 10000 }}>
      <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose}>✕</button>
        <img src={src} alt={alt} className="lightbox-img" />
      </div>
    </div>
  );
};

/* ── Order Detail Modal ──────────────────────────────────────── */
const OrderDetailModal = ({ order, onClose, updateStatus }) => {
  const [previewImg, setPreviewImg] = useState(null);

  if (!order) return null;

  return (
    <div className="detail-modal-overlay" onClick={onClose} style={{ padding: '20px' }}>
      <div className="detail-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 900, maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="detail-modal-header" style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 10, paddingBottom: 16, borderBottom: '1px solid #eee' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="detail-modal-title" style={{ margin: 0 }}>تفاصيل الطلب: {order.order_number || 'غير متوفر'}</h2>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <select
                className="admin-input"
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                value={order.status}
                onChange={(e) => updateStatus(order.id, e.target.value)}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <button className="detail-modal-close" onClick={onClose} style={{ position: 'relative', right: 0, top: 0 }}>✕</button>
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="detail-info-grid" style={{ marginTop: 24 }}>
          {[
            { label: 'وقت التقديم',      value: order.created_at ? new Date(order.created_at).toLocaleString('ar-EG') : '-' },
            { label: 'الاسم بالعربي',    value: order.arabic_name },
            { label: 'الاسم بالإنجليزي', value: order.english_name },
            { label: 'الهاتف',           value: (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ direction: 'ltr' }}>{order.phone}</span>
                {order.phone && (
                  <a href={`https://wa.me/${order.phone.replace(/^0/, '962')}`} target="_blank" rel="noreferrer" style={{ background: '#25D366', color: '#fff', padding: '4px 10px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                    واتساب
                  </a>
                )}
              </div>
            ) },
            { label: 'الجامعة',          value: order.university },
            { label: 'التخصص',           value: order.major },
            { label: 'الباقة',           value: order.package_name || `باقة ${order.package_price} JOD` },
            { label: 'سعر الباقة',       value: `${order.package_price} JOD` },
            { label: 'قالب الغلاف الخارجي', value: order.external_template_number ? `#${order.external_template_number}` : '-' },
            order.internal_template_number && { label: 'قالب الورق الداخلي', value: `#${order.internal_template_number}` },
            order.custom_dedication && { label: 'الإهداء المخصص', value: order.custom_dedication },
            { label: 'عدد الصور الفوتوغرافية', value: order.photographic_pages_quantity !== undefined ? order.photographic_pages_quantity : 0 },
            { label: 'تكلفة الصور الفوتوغرافية', value: `${order.photographic_pages_total !== undefined ? order.photographic_pages_total : 0} JOD` },
            { label: 'خيارات التوصيل',   value: order.delivery_selected ? 'نعم (توصيل لجميع أنحاء المملكة +2 JOD)' : 'لا (استلام من الاستوديو)' },
            order.delivery_selected && { label: 'عنوان التوصيل', value: order.delivery_address },
            { label: 'الإجمالي (Subtotal)', value: `${order.subtotal} JOD` },
            { label: 'العربون (Deposit)', value: `${order.deposit_amount || 5} JOD` },
            { label: 'المتبقي (Remaining)', value: `${order.remaining_amount} JOD` },
          ].filter(Boolean).map((row, i) => (
            <div key={i} className="detail-info-item">
              <div className="detail-info-label">{row.label}</div>
              <div className="detail-info-value">{row.value || '-'}</div>
            </div>
          ))}
        </div>

        <h3 style={{ marginTop: 32, marginBottom: 16, borderBottom: '1px solid #eee', paddingBottom: 8 }}>الملفات المرفقة</h3>

        {/* Receipt */}
        {order.receipt_url && (
          <div className="detail-images-section">
            <div className="detail-images-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>وصل العربون</span>
              <button className="btn-action confirm" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => downloadImage(order.receipt_url, `receipt-${order.id}`)}>تحميل</button>
              <button className="btn-action" style={{ padding: '4px 10px', fontSize: '0.75rem', marginLeft: '8px' }} onClick={() => openImage(order.receipt_url)}>فتح الصورة</button>
            </div>
            <div className="detail-images-row">
              <img src={order.receipt_url} alt="receipt" className="detail-img-thumb" onClick={() => setPreviewImg(order.receipt_url)} style={{ cursor: 'zoom-in' }} />
            </div>
          </div>
        )}

        {/* Front cover */}
        {order.front_cover_url && (
          <div className="detail-images-section">
            <div className="detail-images-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>صورة الغلاف الأمامي</span>
              <button className="btn-action confirm" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => downloadImage(order.front_cover_url, `front-cover-${order.id}`)}>تحميل</button>
              <button className="btn-action" style={{ padding: '4px 10px', fontSize: '0.75rem', marginLeft: '8px' }} onClick={() => openImage(order.front_cover_url)}>فتح الصورة</button>
            </div>
            <div className="detail-images-row">
              <img src={order.front_cover_url} alt="front" className="detail-img-thumb" onClick={() => setPreviewImg(order.front_cover_url)} style={{ cursor: 'zoom-in' }} />
            </div>
          </div>
        )}

        {/* Back cover */}
        {order.back_cover_urls?.length > 0 && (
          <div className="detail-images-section">
            <div className="detail-images-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>صور الغلاف الخلفي ({order.back_cover_urls.length})</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-action confirm" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => downloadAll(order.back_cover_urls, `back-cover-${order.id}`)}>تحميل الكل</button>
                <button className="btn-action" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => order.back_cover_urls.forEach(url => openImage(url))}>فتح الكل</button>
              </div>
            </div>
            <div className="detail-images-row" style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {order.back_cover_urls.map((url, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
                  <img src={url} alt={`back-${i}`} className="detail-img-thumb" onClick={() => setPreviewImg(url)} style={{ cursor: 'zoom-in' }} />
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-action confirm" style={{ padding: '2px 8px', fontSize: '0.65rem' }} onClick={() => downloadImage(url, `back-cover-${order.id}-${i + 1}`)}>تحميل</button>
                    <button className="btn-action" style={{ padding: '2px 8px', fontSize: '0.65rem' }} onClick={() => openImage(url)}>فتح</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Internal images */}
        {order.internal_image_urls?.length > 0 && (
          <div className="detail-images-section">
            <div className="detail-images-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>صور الصفحات الداخلية ({order.internal_image_urls.length})</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-action confirm" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => downloadAll(order.internal_image_urls, `internal-image-${order.id}`)}>تحميل الكل</button>
                <button className="btn-action" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => order.internal_image_urls.forEach(url => openImage(url))}>فتح الكل</button>
              </div>
            </div>
            <div className="detail-images-row" style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {order.internal_image_urls.map((url, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
                  <img src={url} alt={`int-${i}`} className="detail-img-thumb" onClick={() => setPreviewImg(url)} style={{ cursor: 'zoom-in' }} />
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-action confirm" style={{ padding: '2px 8px', fontSize: '0.65rem' }} onClick={() => downloadImage(url, `internal-image-${order.id}-${i + 1}`)}>تحميل</button>
                    <button className="btn-action" style={{ padding: '2px 8px', fontSize: '0.65rem' }} onClick={() => openImage(url)}>فتح</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photographic pages */}
        {order.photographic_pages_urls?.length > 0 && (
          <div className="detail-images-section">
            <div className="detail-images-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>صور الصفحات الفوتوغرافية الإضافية ({order.photographic_pages_urls.length})</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-action confirm" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => downloadAll(order.photographic_pages_urls, `photographic-page-${order.id}`)}>تحميل الكل</button>
                <button className="btn-action" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => order.photographic_pages_urls.forEach(url => openImage(url))}>فتح الكل</button>
              </div>
            </div>
            <div className="detail-images-row" style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {order.photographic_pages_urls.map((url, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
                  <img src={url} alt={`photo-${i}`} className="detail-img-thumb" onClick={() => setPreviewImg(url)} style={{ cursor: 'zoom-in' }} />
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-action confirm" style={{ padding: '2px 8px', fontSize: '0.65rem' }} onClick={() => downloadImage(url, `photographic-page-${order.id}-${i + 1}`)}>تحميل</button>
                    <button className="btn-action" style={{ padding: '2px 8px', fontSize: '0.65rem' }} onClick={() => openImage(url)}>فتح</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
      
      {previewImg && <ImageLightbox src={previewImg} alt="preview" onClose={() => setPreviewImg(null)} />}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
const AdminGraduationOrders = () => {
  const [orders,      setOrders]      = useState([]);
  const [detailOrder, setDetailOrder] = useState(null);
  const [showDelete,  setShowDelete]  = useState(null); // id
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        let combined = [];
        const { data, error } = await supabase
          .from('graduation_orders')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && data && data.length > 0) {
          combined = [...data];
        }

        const localStr = localStorage.getItem('iris_graduation_orders');
        if (localStr) {
          const localData = JSON.parse(localStr);
          localData.forEach(lo => {
            if (!combined.some(o => o.id === lo.id || (o.created_at && o.created_at === lo.created_at))) {
              combined.push(lo);
            }
          });
        }

        setOrders(combined.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)));
      } catch (e) {
        console.error('Failed to fetch graduation orders:', e);
        const localStr = localStorage.getItem('iris_graduation_orders');
        if (localStr) {
          try { setOrders(JSON.parse(localStr)); } catch { setOrders([]); }
        }
      }
    };
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      // 1. Update Supabase
      try {
        const { error } = await supabase
          .from('graduation_orders')
          .update({ status })
          .eq('id', id);
        if (error) console.warn('Supabase graduation status update warning:', error);
      } catch (sbErr) {
        console.warn('Supabase update failed:', sbErr);
      }

      // 2. Update LocalStorage fallback
      try {
        const localStr = localStorage.getItem('iris_graduation_orders');
        if (localStr) {
          const localData = JSON.parse(localStr);
          const updatedLocal = localData.map(o => o.id === id ? { ...o, status } : o);
          localStorage.setItem('iris_graduation_orders', JSON.stringify(updatedLocal));
        }
      } catch (lErr) {
        console.warn('LocalStorage status update failed:', lErr);
      }

      // 3. Update React state immediately
      setOrders(prev => prev.map((o) => o.id === id ? { ...o, status } : o));
      if (detailOrder && detailOrder.id === id) {
        setDetailOrder(prev => prev ? { ...prev, status } : null);
      }
      alert('تم تحديث حالة الطلب بنجاح');
    } catch (err) {
      alert('حدث خطأ أثناء تحديث الحالة: ' + err.message);
    }
  };

  const deleteOrder = async (id) => {
    try {
      const { error } = await supabase
        .from('graduation_orders')
        .delete()
        .eq('id', id);
      if (error) throw error;
      
      setOrders(orders.filter((o) => o.id !== id));
      setShowDelete(null);
    } catch (err) {
      alert('حدث خطأ أثناء الحذف: ' + err.message);
    }
  };

  const formatTime = (iso) => {
    if (!iso) return '-';
    try { return new Date(iso).toLocaleString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return '-'; }
  };

  const getStatusLabel = (val) => STATUS_OPTIONS.find(s => s.value === val)?.label || val;
  const getStatusClass = (val) => STATUS_OPTIONS.find(s => s.value === val)?.colorClass || 'badge-pending';

  const total     = orders.length;
  const pending   = orders.filter((o) => (o.status || 'pending') === 'pending').length;
  const printing  = orders.filter((o) => o.status === 'ready_printing').length;
  const pickup    = orders.filter((o) => o.status === 'ready_pickup').length;
  const inDesign  = orders.filter((o) => o.status === 'in_design').length;
  const completed = orders.filter((o) => o.status === 'completed').length;
  const cancelled = orders.filter((o) => o.status === 'cancelled').length;

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter((o) => (o.status || 'pending') === filterStatus);

  return (
    <AdminLayout>
      <section className="admin-grad-orders">
        <h2 className="section-title">إدارة طلبات دفاتر التخرج</h2>
        <p className="section-subtitle">إدارة ومتابعة جميع طلبات الدفاتر والملفات المرفقة.</p>

        {/* Compact 2x2 Interactive Stats Grid */}
        <div className="bookings-stats-row">
          <div
            className={`small-stat-card card-purple ${filterStatus === 'all' ? 'active-stat' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            <h4>إجمالي الطلبات</h4>
            <p>{total}</p>
          </div>
          <div
            className={`small-stat-card card-gold ${filterStatus === 'pending' ? 'active-stat' : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            <h4>قيد الانتظار</h4>
            <p>{pending}</p>
          </div>
          <div
            className={`small-stat-card card-purple ${filterStatus === 'ready_printing' ? 'active-stat' : ''}`}
            onClick={() => setFilterStatus('ready_printing')}
          >
            <h4>جاهز للطباعة</h4>
            <p>{printing}</p>
          </div>
          <div
            className={`small-stat-card card-green ${filterStatus === 'ready_pickup' ? 'active-stat' : ''}`}
            onClick={() => setFilterStatus('ready_pickup')}
          >
            <h4>جاهز للاستلام</h4>
            <p>{pickup}</p>
          </div>
        </div>

        {/* Status Filter Navigation Bar */}
        <div className="booking-filter-tabs-row">
          <button
            type="button"
            className={`booking-filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            📋 جميع الطلبات ({total})
          </button>
          <button
            type="button"
            className={`booking-filter-tab tab-pending ${filterStatus === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            ⏳ قيد الانتظار ({pending})
          </button>
          <button
            type="button"
            className={`booking-filter-tab ${filterStatus === 'in_design' ? 'active' : ''}`}
            onClick={() => setFilterStatus('in_design')}
          >
            🎨 قيد التصميم ({inDesign})
          </button>
          <button
            type="button"
            className={`booking-filter-tab ${filterStatus === 'ready_printing' ? 'active' : ''}`}
            onClick={() => setFilterStatus('ready_printing')}
          >
            🖨️ جاهز للطباعة ({printing})
          </button>
          <button
            type="button"
            className={`booking-filter-tab tab-approved ${filterStatus === 'ready_pickup' ? 'active' : ''}`}
            onClick={() => setFilterStatus('ready_pickup')}
          >
            📦 جاهز للاستلام ({pickup})
          </button>
          <button
            type="button"
            className={`booking-filter-tab tab-completed ${filterStatus === 'completed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('completed')}
          >
            ✅ مكتمل ({completed})
          </button>
          <button
            type="button"
            className={`booking-filter-tab tab-rejected ${filterStatus === 'cancelled' ? 'active' : ''}`}
            onClick={() => setFilterStatus('cancelled')}
          >
            ❌ ملغي ({cancelled})
          </button>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎓</div>
            <h3>لا توجد طلبات دفاتر تخرج في هذا القسم</h3>
            <p>الطلبات الجديدة المطابقة لهذا القسم ستظهر هنا تلقائياً.</p>
            {filterStatus !== 'all' && (
              <button
                type="button"
                className="empty-btn"
                onClick={() => setFilterStatus('all')}
              >
                عرض جميع الطلبات
              </button>
            )}
          </div>
        ) : (
          <>
            {/* 1. Mobile Cards View (< 992px) */}
            <div className="admin-bookings-mobile-cards">
              {filteredOrders.map((o) => {
                const totalFilesCount = (o.external_template_image_url ? 1 : 0)
                  + (o.internal_images_urls?.length || 0)
                  + (o.photographic_pages_urls?.length || 0);

                return (
                  <div key={o.id} className={`booking-card-item ${o.status === 'completed' ? 'card-completed' : ''}`}>
                    <div className="card-header-top">
                      <div className="card-id-badge">{o.order_number || `#GRAD-${o.id}`}</div>
                      <div className="card-time-tag">⏱️ {formatTime(o.created_at)}</div>
                      <span className={`badge ${getStatusClass(o.status)}`}>
                        {getStatusLabel(o.status)}
                      </span>
                    </div>

                    <div className="card-customer-row">
                      <div className="customer-info-box">
                        <span className="customer-name">{o.arabic_name || 'طالب آيرس'} ({o.english_name || '-'})</span>
                        <span className="customer-phone">{o.phone || '-'}</span>
                      </div>
                      <div className="customer-contact-actions">
                        {o.phone && (
                          <>
                            <a
                              href={`https://wa.me/${o.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-card-icon whatsapp-btn"
                              title="تواصل واتساب"
                            >
                              💬 واتساب
                            </a>
                            <a
                              href={`tel:${o.phone}`}
                              className="btn-card-icon call-btn"
                              title="اتصال مباشر"
                            >
                              📞 اتصال
                            </a>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="card-info-grid">
                      <div className="card-info-item">
                        <span className="info-label">الجامعة والتخصص:</span>
                        <span className="info-val">{o.university || '-'} - {o.major || '-'}</span>
                      </div>
                      <div className="card-info-item">
                        <span className="info-label">الباقة والافتراضي:</span>
                        <span className="info-val highlight-gold">{o.package_name || '-'} ({o.package_price} JOD)</span>
                      </div>
                      <div className="card-info-item">
                        <span className="info-label">قالب الغلاف:</span>
                        <span className="info-val">غلاف #{o.external_template_number || '-'}</span>
                      </div>
                      <div className="card-info-item">
                        <span className="info-label">صفحات فوتوغرافية:</span>
                        <span className="info-val">{o.photographic_pages_quantity || 0} صفحة ({o.photographic_pages_total || 0} JOD)</span>
                      </div>
                    </div>

                    <div className="card-financial-box">
                      <div className="fin-item">
                        <span className="fin-lbl">المجموع الكلي:</span>
                        <span className="fin-val">{o.subtotal != null ? `${o.subtotal} JOD` : '-'}</span>
                      </div>
                      <div className="fin-item">
                        <span className="fin-lbl">المتبقي:</span>
                        <span className="fin-val remaining-due">{o.remaining_amount != null ? `${o.remaining_amount} JOD` : '-'}</span>
                      </div>
                    </div>

                    <div className="card-receipt-box">
                      <button
                        type="button"
                        className="btn-view-receipt-card"
                        onClick={() => setDetailOrder(o)}
                      >
                        🔍 عرض التفاصيل والملفات المرفقة ({totalFilesCount} ملف)
                      </button>
                    </div>

                    <div className="card-action-bar">
                      <div className="status-select-wrap">
                        <label className="as-label-xs">تحديث الحالة:</label>
                        <select
                          value={o.status || 'pending'}
                          onChange={(e) => updateStatus(o.id, e.target.value)}
                          className="card-status-select"
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        className="btn-action delete btn-card-delete"
                        onClick={() => setShowDelete(o.id)}
                      >
                        🗑️ حذف
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 2. Desktop Table View (>= 992px) */}
            <div className="table-container admin-bookings-table-desktop">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>رقم الطلب</th>
                    <th>وقت الطلب</th>
                    <th>الاسم</th>
                    <th>الهاتف</th>
                    <th>الباقة</th>
                    <th>قالب الغلاف</th>
                    <th>الإضافات</th>
                    <th>الإجمالي</th>
                    <th>المتبقي</th>
                    <th>الحالة</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className={o.status === 'completed' ? 'row-completed' : o.status === 'cancelled' ? 'row-cancelled' : ''}>
                      <td style={{ fontWeight: 800 }}>{o.order_number || '-'}</td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>{formatTime(o.created_at)}</td>
                      <td style={{ fontWeight: 600 }}>{o.arabic_name}</td>
                      <td style={{ direction: 'ltr' }}>{o.phone}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{o.package_name}</td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                        غلاف #{o.external_template_number}
                      </td>
                      <td style={{ fontSize: '0.82rem', maxWidth: 140, whiteSpace: 'normal' }}>
                        {[
                          o.photographic_pages_quantity > 0 ? `${o.photographic_pages_quantity}x صور` : null,
                          o.delivery_selected ? 'توصيل' : null
                        ].filter(Boolean).join(' + ') || '-'}
                      </td>
                      <td style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{o.subtotal} JOD</td>
                      <td style={{ whiteSpace: 'nowrap', color: '#27ae60', fontWeight: 800 }}>{o.remaining_amount} JOD</td>
                      <td>
                        <select
                          className={`admin-input ${getStatusClass(o.status)}`}
                          style={{ padding: '4px 8px', fontSize: '0.8rem', width: 140, border: 'none', borderRadius: 50, fontWeight: 700 }}
                          value={o.status}
                          onChange={(e) => updateStatus(o.id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s.value} value={s.value} style={{ background: '#fff', color: '#333' }}>{s.label}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button type="button" className="btn-action confirm" onClick={() => setDetailOrder(o)}>عرض التفاصيل</button>
                          <button type="button" className="btn-action delete"  onClick={() => setShowDelete(o.id)}>حذف</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* Order detail modal */}
      {detailOrder && (
        <OrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} updateStatus={updateStatus} />
      )}

      {/* Delete confirmation modal */}
      {showDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">تأكيد الحذف</h3>
            <p className="modal-message">هل أنت متأكد من حذف هذا الطلب بشكل نهائي؟ تأكد من تحميل الملفات المهمة قبل الحذف.</p>
            <div className="modal-buttons">
              <button className="modal-btn cancel"  onClick={() => setShowDelete(null)}>إلغاء</button>
              <button className="modal-btn confirm" onClick={() => deleteOrder(showDelete)}>حذف الطلب</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminGraduationOrders;
