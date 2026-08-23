import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';
import '../styles/admin.css';

const parseNotes = (notesStr) => {
  const result = {
    isDelivery: false,
    address: '',
    alternativePhone: '',
    googleMaps: '',
    cleanNotes: notesStr || ''
  };

  if (!notesStr) return result;

  if (notesStr.includes('[طلب توصيل]')) {
    result.isDelivery = true;
    
    // Extract Address
    const addressMatch = notesStr.match(/العنوان:\s*([^\n\r]+)/);
    if (addressMatch) result.address = addressMatch[1].trim();

    // Extract Alt Phone
    const phoneMatch = notesStr.match(/هاتف بديل:\s*([^\n\r]+)/);
    if (phoneMatch) result.alternativePhone = phoneMatch[1].trim();

    // Extract Google Maps
    const mapsMatch = notesStr.match(/خرائط قوقل:\s*([^\n\r]+)/);
    if (mapsMatch) result.googleMaps = mapsMatch[1].trim();

    // Clean notes: remove the prefix block
    result.cleanNotes = notesStr
      .replace(/\[طلب توصيل\]\r?\n?/, '')
      .replace(/العنوان:[^\n\r]*\r?\n?/, '')
      .replace(/هاتف بديل:[^\n\r]*\r?\n?/, '')
      .replace(/خرائط قوقل:[^\n\r]*\r?\n?/, '')
      .trim();
  } else if (notesStr.includes('[استلام من الاستوديو]')) {
    result.cleanNotes = notesStr.replace(/\[استلام من الاستوديو\]\r?\n?/, '').trim();
  }

  return result;
};

const AdminPrintingOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let combined = [];
      const { data, error } = await supabase
        .from('printing_orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data && data.length > 0) {
        combined = [...data];
      }

      const localStr = localStorage.getItem('iris_printing_orders');
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
      console.error('Failed to load printing orders:', e);
      const localStr = localStorage.getItem('iris_printing_orders');
      if (localStr) setOrders(JSON.parse(localStr));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('printing_orders')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
      alert('تم تحديث حالة الطلب بنجاح');
    } catch (err) {
      alert('خطأ أثناء تحديث حالة الطلب: ' + err.message);
    }
  };

  const total     = orders.length;
  const pending   = orders.filter((o) => (o.status || 'pending') === 'pending').length;
  const approved  = orders.filter((o) => o.status === 'approved').length;
  const completed = orders.filter((o) => o.status === 'completed').length;
  const rejected  = orders.filter((o) => o.status === 'rejected').length;

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter((o) => (o.status || 'pending') === filterStatus);

  return (
    <AdminLayout>
      <section className="admin-bookings-section" style={{ direction: 'rtl' }}>
        <h2 className="section-title">طلبات منتجات الطباعة والتصميم</h2>
        <p className="section-subtitle">إدارة، فلترة ومتابعة جميع طلبات الطباعة المخصصة المرفوعة من العملاء.</p>

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
            <h4>بانتظار المراجعة</h4>
            <p>{pending}</p>
          </div>
          <div
            className={`small-stat-card card-purple ${filterStatus === 'approved' ? 'active-stat' : ''}`}
            onClick={() => setFilterStatus('approved')}
          >
            <h4>قيد التنفيذ</h4>
            <p>{approved}</p>
          </div>
          <div
            className={`small-stat-card card-green ${filterStatus === 'completed' ? 'active-stat' : ''}`}
            onClick={() => setFilterStatus('completed')}
          >
            <h4>الطلبات المكتملة</h4>
            <p>{completed}</p>
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
            ⏳ بانتظار المراجعة ({pending})
          </button>
          <button
            type="button"
            className={`booking-filter-tab tab-approved ${filterStatus === 'approved' ? 'active' : ''}`}
            onClick={() => setFilterStatus('approved')}
          >
            ⚙️ قيد العمل ({approved})
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
            className={`booking-filter-tab tab-rejected ${filterStatus === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilterStatus('rejected')}
          >
            ❌ مرفوض ({rejected})
          </button>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="spinner-loader" style={{ margin: '0 auto 12px auto' }} />
            <h3>جاري تحميل طلبات الطباعة...</h3>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🖨️</div>
            <h3>لا توجد طلبات طباعة في هذا القسم حالياً</h3>
            <p>عند وصول طلبات جديدة مطابقة لهذا القسم ستظهر هنا فورياً.</p>
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
          <div className="admin-bookings-mobile-cards" style={{ display: 'flex' }}>
            {filteredOrders.map((ord) => {
              let imagesList = [];
              if (Array.isArray(ord.image_urls)) {
                imagesList = ord.image_urls;
              } else if (typeof ord.image_urls === 'string') {
                try {
                  imagesList = JSON.parse(ord.image_urls || '[]');
                } catch {
                  if (ord.image_urls) imagesList = [ord.image_urls];
                }
              }

              const details = parseNotes(ord.notes);

              return (
                <div key={ord.id} className={`booking-card-item ${ord.status === 'completed' ? 'card-completed' : ''}`}>
                  <div className="card-header-top">
                    <div className="card-id-badge">#{ord.id}</div>
                    <div className="card-time-tag">⏱️ {ord.created_at ? new Date(ord.created_at).toLocaleString('ar-EG') : '-'}</div>
                    <span
                      className={`badge ${
                        ord.status === 'pending' ? 'badge-pending' :
                        ord.status === 'approved' ? 'badge-approved' :
                        ord.status === 'completed' ? 'badge-completed' : 'badge-rejected'
                      }`}
                    >
                      {ord.status === 'pending' ? 'بانتظار المراجعة' :
                       ord.status === 'approved' ? 'مقبول / قيد التنفيذ' :
                       ord.status === 'completed' ? 'مكتمل' : 'مرفوض'}
                    </span>
                  </div>

                  <div className="card-customer-row">
                    <div className="customer-info-box">
                      <span className="customer-name">{ord.customer_name || 'عميل مخصص'}</span>
                      <span className="customer-phone">{ord.phone || '-'}</span>
                    </div>
                    <div className="customer-contact-actions">
                      {ord.phone && (
                        <>
                          <a
                            href={`https://wa.me/${ord.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-card-icon whatsapp-btn"
                            title="تواصل واتساب"
                          >
                            💬 واتساب
                          </a>
                          <a
                            href={`tel:${ord.phone}`}
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
                      <span className="info-label">المنتج المطلوب:</span>
                      <span className="info-val highlight-gold">{ord.product_name || 'خدمة طباعة'}</span>
                    </div>
                    <div className="card-info-item">
                      <span className="info-label">طريقة الاستلام:</span>
                      <span className="info-val">{details.isDelivery ? 'توصيل للمنزل 🚚' : 'استلام من الاستوديو 🏬'}</span>
                    </div>
                    <div className="card-info-item">
                      <span className="info-label">الكمية المطلوبة:</span>
                      <span className="info-val">{ord.quantity || 1} قطعة</span>
                    </div>
                    {ord.selected_color && (
                      <div className="card-info-item">
                        <span className="info-label">اللون المختار:</span>
                        <span className="info-val">{ord.selected_color}</span>
                      </div>
                    )}
                  </div>

                  {details.isDelivery && details.address && (
                    <div className="card-extras-box">
                      <span className="info-label">عنوان التوصيل:</span>
                      <span className="extras-list">{details.address}</span>
                      {details.googleMaps && details.googleMaps !== 'لا يوجد' && (
                        <div style={{ marginTop: '4px' }}>
                          <a href={details.googleMaps} target="_blank" rel="noreferrer" style={{ color: '#F5BD1A', textDecoration: 'underline', fontSize: '0.82rem' }}>
                            📍 موقع التوصيل على خرائط قوقل
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {details.cleanNotes && (
                    <div className="card-extras-box" style={{ background: 'rgba(18, 9, 17, 0.8)' }}>
                      <span className="info-label">ملاحظات العميل:</span>
                      <span className="extras-list" style={{ color: '#ECEBE7' }}>{details.cleanNotes}</span>
                    </div>
                  )}

                  {imagesList.length > 0 && (
                    <div className="card-receipt-box" style={{ background: 'transparent', padding: 0 }}>
                      <span className="info-label" style={{ marginBottom: '6px', display: 'block' }}>الصور والمستندات المرفقة ({imagesList.length}):</span>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {imagesList.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                            <img
                              src={url}
                              alt={`custom-${i}`}
                              style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '10px', border: '1.5px solid #F5BD1A', cursor: 'zoom-in' }}
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="card-action-bar">
                    {ord.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(ord.id, 'approved')}
                          className="btn-action confirm"
                          style={{ flex: 1, padding: '10px' }}
                        >
                          ✓ قبول وبدء العمل
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(ord.id, 'rejected')}
                          className="btn-action reject"
                          style={{ padding: '10px 16px' }}
                        >
                          ✕ رفض
                        </button>
                      </div>
                    )}
                    {ord.status === 'approved' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(ord.id, 'completed')}
                        className="btn-action confirm"
                        style={{ width: '100%', padding: '10px', background: '#339af0' }}
                      >
                        ✓ تعليم كمكتمل
                      </button>
                    )}
                    {ord.status !== 'pending' && ord.status !== 'approved' && (
                      <span className="info-label" style={{ margin: 'auto' }}>حالة الطلب نهائية ({ord.status})</span>
                    )}
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

export default AdminPrintingOrders;
