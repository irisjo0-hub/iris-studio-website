import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';
import '../styles/admin.css';

const AdminPrintingOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('printing_orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setOrders(data);
    } catch (e) {
      console.error('Failed to load printing orders:', e);
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

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.status === filterStatus);

  return (
    <AdminLayout>
      <section className="admin-bookings-section" style={{ direction: 'rtl', padding: '20px' }}>
        <h2 className="section-title">طلبات منتجات الطباعة والتصميم</h2>
        <p className="section-subtitle">استعرض وتابع طلبات الطباعة المخصصة المرفوعة من العملاء.</p>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', margin: '20px 0', flexWrap: 'wrap' }}>
          {['all', 'pending', 'approved', 'completed', 'rejected'].map((status) => {
            const labels = {
              all: 'الكل',
              pending: 'بانتظار المراجعة ⏳',
              approved: 'مقبول / قيد العمل ✅',
              completed: 'مكتمل 📔',
              rejected: 'مرفوض ✕'
            };
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: filterStatus === status ? 'none' : '1px solid #ccc',
                  background: filterStatus === status ? 'var(--iris-purple, #6F246F)' : '#fff',
                  color: filterStatus === status ? '#fff' : '#333',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}
              >
                {labels[status]}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>⏳ جاري تحميل الطلبات...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="admin-empty-state" style={{ background: '#fff', padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
            <h3>لا توجد طلبات طباعة في هذا التصنيف.</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredOrders.map((ord) => {
              // Parse image URLs
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

              return (
                <div
                  key={ord.id}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    border: '1px solid #eee',
                    padding: '20px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                    display: 'grid',
                    gridTemplateColumns: '1fr 250px',
                    gap: '20px'
                  }}
                  className="printing-order-row-card"
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--iris-purple, #6F246F)' }}>
                        {ord.product_name}
                      </h3>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          background:
                            ord.status === 'pending' ? '#fff9db' :
                            ord.status === 'approved' ? '#e3faf2' :
                            ord.status === 'completed' ? '#d0ebff' : '#ffe3e3',
                          color:
                            ord.status === 'pending' ? '#f08c00' :
                            ord.status === 'approved' ? '#0ca678' :
                            ord.status === 'completed' ? '#1c7ed6' : '#f03e3e'
                        }}
                      >
                        {ord.status === 'pending' ? 'بانتظار المراجعة' :
                         ord.status === 'approved' ? 'مقبول / قيد التنفيذ' :
                         ord.status === 'completed' ? 'مكتمل' : 'مرفوض'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.95rem' }}>
                      <div>العميل: <strong>{ord.customer_name}</strong></div>
                      <div>رقم الهاتف: <strong>{ord.phone}</strong></div>
                      <div>الكمية المطلوبة: <strong>{ord.quantity}</strong></div>
                      {ord.selected_color && <div>اللون المختار: <strong style={{ color: 'var(--iris-green)' }}>{ord.selected_color}</strong></div>}
                    </div>

                    {ord.notes && (
                      <div style={{ background: '#fcfcfc', border: '1px solid #eee', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', color: '#555', whiteSpace: 'pre-wrap' }}>
                        <strong>تفاصيل الطلب وملاحظات العميل:</strong>
                        <div style={{ marginTop: '4px' }}>{ord.notes}</div>
                      </div>
                    )}

                    {/* Image thumbnails for custom designs */}
                    {imagesList.length > 0 && (
                      <div style={{ marginTop: '10px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>الصور المرفقة للطباعة:</span>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          {imagesList.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noreferrer">
                              <img
                                src={url}
                                alt={`custom-${i}`}
                                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd', cursor: 'zoom-in' }}
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center', borderRight: '1px solid #eee', paddingRight: '20px' }}>
                    {ord.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(ord.id, 'approved')}
                          className="btn-action confirm"
                          style={{ padding: '8px 16px', fontSize: '0.88rem' }}
                        >
                          قبول وبدء العمل
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(ord.id, 'rejected')}
                          className="btn-action reject"
                          style={{ padding: '8px 16px', fontSize: '0.88rem' }}
                        >
                          رفض الطلب
                        </button>
                      </>
                    )}
                    {ord.status === 'approved' && (
                      <button
                        onClick={() => handleUpdateStatus(ord.id, 'completed')}
                        className="btn-action confirm"
                        style={{ padding: '8px 16px', fontSize: '0.88rem', background: '#339af0' }}
                      >
                        تعليم كمكتمل ✓
                      </button>
                    )}
                    {ord.status !== 'pending' && ord.status !== 'approved' && (
                      <div style={{ textAlign: 'center', color: '#888', fontSize: '0.85rem' }}>لا توجد إجراءات إضافية</div>
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
