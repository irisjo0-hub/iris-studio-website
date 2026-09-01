import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { formatOrderNumberDisplay } from '../lib/orderUtils';
import AdminLayout from '../components/AdminLayout';
import '../styles/admin.css';

const getStructuredOrderItems = (ord) => {
  let rawItems = ord?.cart_items;
  if (typeof rawItems === 'string') {
    try { rawItems = JSON.parse(rawItems); } catch { rawItems = null; }
  }

  if (Array.isArray(rawItems) && rawItems.length > 0) {
    return rawItems.map((item, idx) => {
      const itemId = item.id || `item-${idx}`;
      return {
        id: itemId,
        name: item.name || 'منتج مخصص',
        selectedColor: item.selectedColor || '',
        quantity: item.quantity || 1,
        status: ord.item_statuses?.[itemId] || (ord.status === 'completed' ? 'ready' : (ord.status === 'approved' ? 'in_progress' : 'pending'))
      };
    });
  }

  const notesStr = ord?.notes || '';
  const parsedFromNotes = [];
  if (notesStr.includes('عناصر السلة:')) {
    const itemsPart = notesStr.split('عناصر السلة:')[1];
    if (itemsPart) {
      const rawLines = itemsPart.split('\n');
      rawLines.forEach((l, idx) => {
        const trimmed = l.trim();
        if (trimmed && !trimmed.startsWith('ملاحظات:') && !trimmed.startsWith('[') && !trimmed.startsWith('العنوان:')) {
          const cleanText = trimmed.replace(/^\d+\.\s*/, '');
          const itemId = `note-item-${idx}`;
          parsedFromNotes.push({
            id: itemId,
            name: cleanText,
            selectedColor: '',
            quantity: 1,
            status: ord.item_statuses?.[itemId] || (ord.status === 'completed' ? 'ready' : (ord.status === 'approved' ? 'in_progress' : 'pending'))
          });
        }
      });
    }
  }

  if (parsedFromNotes.length > 0) return parsedFromNotes;

  return [{
    id: 'single-item',
    name: ord?.product_name || 'خدمة طباعة مخصصة',
    selectedColor: ord?.selected_color && ord?.selected_color !== 'سلة متعددة' ? ord.selected_color : '',
    quantity: ord?.quantity || 1,
    status: ord?.item_statuses?.['single-item'] || (ord?.status === 'completed' ? 'ready' : (ord?.status === 'approved' ? 'in_progress' : 'pending'))
  }];
};

const parseOrderDetails = (ord) => {
  const notesStr = ord?.notes || '';
  const result = {
    isDelivery: notesStr.includes('[طلب توصيل]'),
    address: '',
    alternativePhone: '',
    googleMaps: '',
    paymentMethod: notesStr.includes('[دفع عبر CliQ') ? '📱 CliQ' : '💵 عند الاستلام',
    cartItemsList: [],
    displayTitle: ord?.product_name || 'منتج مخصص',
    cleanUserNotes: ''
  };

  if (result.displayTitle.includes('سلة متعددة')) {
    result.displayTitle = '';
  }

  if (result.isDelivery) {
    const addressMatch = notesStr.match(/العنوان:\s*([^\n\r]+)/);
    if (addressMatch) result.address = addressMatch[1].trim();

    const phoneMatch = notesStr.match(/هاتف بديل:\s*([^\n\r]+)/);
    if (phoneMatch) result.alternativePhone = phoneMatch[1].trim();

    const mapsMatch = notesStr.match(/خرائط قوقل:\s*([^\n\r]+)/);
    if (mapsMatch) result.googleMaps = mapsMatch[1].trim();
  }

  if (notesStr.includes('عناصر السلة:')) {
    const itemsPart = notesStr.split('عناصر السلة:')[1];
    if (itemsPart) {
      const rawLines = itemsPart.split('\n');
      const foundItems = [];
      rawLines.forEach(l => {
        const trimmed = l.trim();
        if (trimmed && !trimmed.startsWith('ملاحظات:') && !trimmed.startsWith('[') && !trimmed.startsWith('العنوان:')) {
          foundItems.push(trimmed.replace(/^\d+\.\s*/, ''));
        }
      });
      if (foundItems.length > 0) {
        result.cartItemsList = foundItems;
        if (!result.displayTitle) {
          result.displayTitle = foundItems.join(' + ');
        }
      }
    }
  }

  if (!result.displayTitle) {
    result.displayTitle = ord?.product_name || 'خدمة طباعة مخصصة';
  }

  let clean = notesStr
    .replace(/\[طلب توصيل\]\r?\n?/g, '')
    .replace(/\[استلام من الاستوديو\]\r?\n?/g, '')
    .replace(/\[دفع عبر CliQ [^\]]*\]\r?\n?/g, '')
    .replace(/\[الدفع عند الاستلام [^\]]*\]\r?\n?/g, '')
    .replace(/العنوان:[^\n\r]*\r?\n?/g, '')
    .replace(/هاتف بديل:[^\n\r]*\r?\n?/g, '')
    .replace(/خرائط قوقل:[^\n\r]*\r?\n?/g, '')
    .replace(/\[طلب سلة [^\]]*\]\r?\n?/g, '');
  
  if (clean.includes('عناصر السلة:')) {
    clean = clean.split('عناصر السلة:')[0];
  }

  result.cleanUserNotes = clean.trim();

  return result;
};

const AdminPrintingOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleUpdateStatus = (id, newStatus) => {
    // 1. Instant local React state update
    setOrders(prevOrders => prevOrders.map(o => o.id === id ? { ...o, status: newStatus } : o));

    // 2. Instant LocalStorage update
    try {
      const localStr = localStorage.getItem('iris_printing_orders');
      if (localStr) {
        const localData = JSON.parse(localStr);
        const updatedLocal = localData.map(o => o.id === id ? { ...o, status: newStatus } : o);
        localStorage.setItem('iris_printing_orders', JSON.stringify(updatedLocal));
      }
    } catch (e) {}

    // 3. Background Supabase sync (no annoying alerts if schema table missing)
    supabase
      .from('printing_orders')
      .update({ status: newStatus })
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.warn('Supabase sync notice:', error.message);
      })
      .catch(err => console.warn('Supabase background warning:', err));
  };

  const handleUpdateItemStatus = (orderId, itemId, newSubStatus) => {
    setOrders(prevOrders => {
      return prevOrders.map(ord => {
        if (ord.id !== orderId) return ord;
        
        const updatedItemStatuses = {
          ...(ord.item_statuses || {}),
          [itemId]: newSubStatus
        };

        const items = getStructuredOrderItems({ ...ord, item_statuses: updatedItemStatuses });
        const allReady = items.length > 0 && items.every(i => updatedItemStatuses[i.id] === 'ready');
        const anyInProgress = items.some(i => updatedItemStatuses[i.id] === 'in_progress' || updatedItemStatuses[i.id] === 'ready');
        
        let overallStatus = ord.status;
        if (allReady && ord.status !== 'completed') {
          overallStatus = 'ready';
        } else if (anyInProgress && ord.status === 'pending') {
          overallStatus = 'approved';
        }

        const updatedOrder = {
          ...ord,
          item_statuses: updatedItemStatuses,
          status: overallStatus
        };

        try {
          const localStr = localStorage.getItem('iris_printing_orders');
          if (localStr) {
            const localData = JSON.parse(localStr);
            const updatedLocal = localData.map(o => o.id === orderId ? updatedOrder : o);
            localStorage.setItem('iris_printing_orders', JSON.stringify(updatedLocal));
          }
        } catch (e) {}

        supabase
          .from('printing_orders')
          .update({ item_statuses: updatedItemStatuses, status: overallStatus })
          .eq('id', orderId)
          .then(({ error }) => {
            if (error) console.warn('Supabase sub-status update warning:', error);
          });

        return updatedOrder;
      });
    });
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('هل أنت محدد ترغب بحذف هذا الأوردر نهائياً؟ لا يمكن التراجع عن هذا الإجراء.')) {
      return;
    }

    setOrders(prevOrders => prevOrders.filter(o => o.id !== id));

    try {
      const localStr = localStorage.getItem('iris_printing_orders');
      if (localStr) {
        const localData = JSON.parse(localStr);
        const updatedLocal = localData.filter(o => o.id !== id);
        localStorage.setItem('iris_printing_orders', JSON.stringify(updatedLocal));
      }
    } catch (e) {}

    try {
      await supabase.from('printing_orders').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete warning:', err);
    }
  };

  const total           = orders.length;
  const pending         = orders.filter((o) => (o.status || 'pending') === 'pending').length;
  const approved        = orders.filter((o) => o.status === 'approved').length;
  const outForDelivery  = orders.filter((o) => o.status === 'out_for_delivery').length;
  const ready           = orders.filter((o) => o.status === 'ready').length;
  const completed       = orders.filter((o) => o.status === 'completed').length;
  const rejected        = orders.filter((o) => o.status === 'rejected').length;

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter((o) => (o.status || 'pending') === filterStatus);

  return (
    <AdminLayout title="طلبات المطبوعات والتصميم">
      <div className="admin-page-container">
        
        {/* Filter Tabs */}
        <div className="booking-filters-bar" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '8px' }}>
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
            ⚙️ قيد التجهيز والتنفيذ ({approved})
          </button>
          <button 
            type="button"
            className={`booking-filter-tab ${filterStatus === 'out_for_delivery' ? 'active' : ''}`}
            style={{ background: filterStatus === 'out_for_delivery' ? '#e67e22' : 'rgba(230, 126, 34, 0.15)', color: filterStatus === 'out_for_delivery' ? '#FFF' : '#e67e22', border: '1px solid #e67e22' }}
            onClick={() => setFilterStatus('out_for_delivery')}
          >
            🚚 قيد التوصيل ({outForDelivery})
          </button>
          <button 
            type="button"
            className={`booking-filter-tab ${filterStatus === 'ready' ? 'active' : ''}`}
            style={{ background: filterStatus === 'ready' ? '#0984e3' : 'rgba(9, 132, 227, 0.15)', color: filterStatus === 'ready' ? '#FFF' : '#0984e3', border: '1px solid #0984e3' }}
            onClick={() => setFilterStatus('ready')}
          >
            📦 جاهز للاستلام ({ready})
          </button>
          <button 
            type="button"
            className={`booking-filter-tab tab-completed ${filterStatus === 'completed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('completed')}
          >
            ✅ مكتمل ومسلم ({completed})
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
          <div className="admin-bookings-mobile-cards" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

              const details = parseOrderDetails(ord);
              const structuredItems = getStructuredOrderItems(ord);

              return (
                <div key={ord.id} className={`booking-card-item ${ord.status === 'completed' ? 'card-completed' : ''}`} style={{ background: '#190B18', border: '1px solid rgba(245, 189, 26, 0.3)', borderRadius: '14px', padding: '12px 14px', maxWidth: '850px', margin: '0 auto', width: '100%', boxSizing: 'border-box', boxShadow: '0 6px 25px rgba(0,0,0,0.5)' }}>
                  
                  {/* Header Row: ID | Customer Name & Phone | WhatsApp | Delete | Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', paddingBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="card-id-badge">{formatOrderNumberDisplay(ord)}</span>
                      <span style={{ fontSize: '0.98rem', fontWeight: '900', color: '#FFFFFF' }}>{ord.customer_name || 'عميل مخصص'}</span>
                      <span dir="ltr" style={{ color: '#F5BD1A', fontWeight: '800', fontSize: '0.85rem' }}>({ord.phone || '-'})</span>
                      <span style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.5)' }}>⏱️ {ord.created_at ? new Date(ord.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {ord.phone && (
                        <a
                          href={`https://wa.me/${ord.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ background: '#25D366', color: '#120A11', padding: '4px 10px', borderRadius: '50px', fontWeight: '900', fontSize: '0.76rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          💬 واتساب
                        </a>
                      )}
                      <span
                        className={`badge ${
                          ord.status === 'pending' ? 'badge-pending' :
                          ord.status === 'approved' ? 'badge-approved' :
                          ord.status === 'out_for_delivery' ? 'badge-approved' :
                          ord.status === 'ready' ? 'badge-approved' :
                          ord.status === 'completed' ? 'badge-completed' : 'badge-rejected'
                        }`}
                        style={{ fontSize: '0.74rem', padding: '3px 10px', background: ord.status === 'out_for_delivery' ? '#e67e22' : ord.status === 'ready' ? '#0984e3' : undefined }}
                      >
                        {ord.status === 'pending' ? 'بانتظار المراجعة' :
                         ord.status === 'approved' ? '⚙️ قيد التجهيز والتنفيذ' :
                         ord.status === 'out_for_delivery' ? '🚚 قيد التوصيل' :
                         ord.status === 'ready' ? '📦 جاهز للاستلام' :
                         ord.status === 'completed' ? '✅ مكتمل ومسلم' : 'مرفوض'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteOrder(ord.id)}
                        title="حذف الأوردر نهائياً"
                        style={{
                          background: 'rgba(231, 76, 60, 0.15)',
                          color: '#E74C3C',
                          border: '1px solid rgba(231, 76, 60, 0.4)',
                          borderRadius: '50px',
                          padding: '3px 8px',
                          fontSize: '0.74rem',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ حذف
                      </button>
                    </div>
                  </div>

                  {/* Structured Products Section (Compact rows!) */}
                  <div style={{ margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {structuredItems.map((item) => {
                      const itemStatus = item.status;
                      return (
                        <div 
                          key={item.id} 
                          style={{ 
                            background: itemStatus === 'ready' ? 'rgba(39, 174, 96, 0.15)' : itemStatus === 'in_progress' ? 'rgba(245, 189, 26, 0.15)' : 'rgba(255, 255, 255, 0.04)', 
                            border: itemStatus === 'ready' ? '1px solid #27AE60' : itemStatus === 'in_progress' ? '1px solid #F5BD1A' : '1px solid rgba(255,255,255,0.1)', 
                            borderRadius: '8px', 
                            padding: '6px 10px', 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap', 
                            gap: '6px' 
                          }}
                        >
                          <div>
                            <span style={{ fontSize: '0.9rem', fontWeight: '900', color: '#FFFFFF' }}>🛍️ {item.name}</span>
                            {item.selectedColor && <span style={{ fontSize: '0.76rem', color: '#F5BD1A', marginRight: '6px' }}>[اللون: {item.selectedColor}]</span>}
                            <span style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.7)', marginRight: '6px' }}>(×{item.quantity})</span>
                          </div>

                          {/* Sub-item status control buttons */}
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => handleUpdateItemStatus(ord.id, item.id, 'pending')}
                              style={{
                                background: itemStatus === 'pending' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0,0,0,0.5)',
                                color: itemStatus === 'pending' ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                                border: 'none',
                                borderRadius: '50px',
                                padding: '3px 8px',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                              }}
                            >
                              ⏳ ينتظر
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateItemStatus(ord.id, item.id, 'in_progress')}
                              style={{
                                background: itemStatus === 'in_progress' ? 'linear-gradient(135deg, #F5BD1A 0%, #D49B0D 100%)' : 'rgba(0,0,0,0.5)',
                                color: itemStatus === 'in_progress' ? '#120A11' : 'rgba(255,255,255,0.5)',
                                border: 'none',
                                borderRadius: '50px',
                                padding: '3px 8px',
                                fontSize: '0.7rem',
                                fontWeight: '900',
                                cursor: 'pointer'
                              }}
                            >
                              ⚙️ قيد العمل
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateItemStatus(ord.id, item.id, 'ready')}
                              style={{
                                background: itemStatus === 'ready' ? '#27AE60' : 'rgba(0,0,0,0.5)',
                                color: itemStatus === 'ready' ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                                border: 'none',
                                borderRadius: '50px',
                                padding: '3px 8px',
                                fontSize: '0.7rem',
                                fontWeight: '900',
                                cursor: 'pointer'
                              }}
                            >
                              ✅ تم الإنجاز
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Compact Inline Details Strip */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', background: 'rgba(0,0,0,0.25)', padding: '6px 10px', borderRadius: '8px', marginBottom: '8px' }}>
                    {details.isDelivery && details.address && (
                      <div>📍 <strong>التوصيل:</strong> {details.address} {details.alternativePhone ? `(هاتف بديل: ${details.alternativePhone})` : ''}</div>
                    )}
                    {!details.isDelivery && (
                      <div>🏬 <strong>الاستلام:</strong> استلام مباشر من الاستوديو</div>
                    )}
                    {details.cleanUserNotes && (
                      <div>💬 <strong>ملاحظات العميل:</strong> <span style={{ color: '#F5BD1A' }}>{details.cleanUserNotes}</span></div>
                    )}
                    {imagesList.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                        <span>🖼️ <strong>المرفقات ({imagesList.length}):</strong></span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {imagesList.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noreferrer">
                              <img src={url} alt={`thumb-${i}`} style={{ width: '34px', height: '34px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #F5BD1A' }} />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Compact Action Footer Bar */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {ord.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(ord.id, 'approved')}
                          className="btn-action confirm"
                          style={{ flex: 1, padding: '8px', fontSize: '0.84rem', fontWeight: '900' }}
                        >
                          ✓ قبول وبدء التجهيز
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(ord.id, 'rejected')}
                          className="btn-action reject"
                          style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                        >
                          ✕ رفض
                        </button>
                      </>
                    )}

                    {ord.status === 'approved' && (
                      <div style={{ display: 'flex', gap: '6px', width: '100%', flexWrap: 'wrap' }}>
                        {details.isDelivery ? (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(ord.id, 'out_for_delivery')}
                            className="btn-action confirm"
                            style={{ flex: 1, padding: '8px', background: '#e67e22', fontSize: '0.84rem', fontWeight: '900' }}
                          >
                            🚚 تحويل إلى: قيد التوصيل
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(ord.id, 'ready')}
                            className="btn-action confirm"
                            style={{ flex: 1, padding: '8px', background: '#0984e3', fontSize: '0.84rem', fontWeight: '900' }}
                          >
                            📦 جاهز للاستلام من الاستوديو
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(ord.id, 'completed')}
                          className="btn-action confirm"
                          style={{ flex: 1, padding: '8px', background: '#27ae60', fontSize: '0.84rem', fontWeight: '900' }}
                        >
                          ✅ تعليم كمكتمل ومسلم
                        </button>
                      </div>
                    )}

                    {ord.status === 'out_for_delivery' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(ord.id, 'completed')}
                        className="btn-action confirm"
                        style={{ width: '100%', padding: '8px', background: '#27ae60', fontSize: '0.84rem', fontWeight: '900' }}
                      >
                        ✅ تم التسليم للعميل بنجاح (مكتمل)
                      </button>
                    )}

                    {ord.status === 'ready' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(ord.id, 'completed')}
                        className="btn-action confirm"
                        style={{ width: '100%', padding: '8px', background: '#27ae60', fontSize: '0.84rem', fontWeight: '900' }}
                      >
                        ✅ تم التسليم للعميل بالاستوديو (مكتمل)
                      </button>
                    )}

                    {(ord.status === 'completed' || ord.status === 'rejected') && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span className="info-label" style={{ fontSize: '0.78rem' }}>حالة الطلب نهائية ({ord.status === 'completed' ? 'مكتمل' : 'مرفوض'})</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteOrder(ord.id)}
                          style={{
                            background: '#e74c3c',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '50px',
                            padding: '4px 12px',
                            fontSize: '0.76rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️ حذف الطلب
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPrintingOrders;
