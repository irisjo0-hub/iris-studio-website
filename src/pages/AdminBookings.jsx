import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, deleteFile, extractPathFromUrl } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';
import '../styles/admin.css';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [receiptModal, setReceiptModal] = useState(null); // URL string

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (data) setBookings(data);
      } catch (e) {
        console.error('Failed to fetch bookings', e);
        setBookings([]);
      }
    };
    fetchBookings();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      setBookings(bookings.map((b) => (b.id === id ? { ...b, status } : b)));
    } catch (err) {
      alert('حدث خطأ أثناء تحديث الحالة: ' + err.message);
    }
  };

  const deleteBooking = async (id) => {
    try {
      const booking = bookings.find(b => b.id === id);
      
      // Delete receipt from storage if exists
      if (booking?.receipt_url) {
        const path = extractPathFromUrl(booking.receipt_url, 'payment-receipts');
        if (path) await deleteFile('payment-receipts', path);
      }

      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);
      if (error) throw error;
      
      setBookings(bookings.filter((b) => b.id !== id));
    } catch (err) {
      alert('حدث خطأ أثناء الحذف: ' + err.message);
    }
  };

  const openDeleteModal = (id) => { setDeleteId(id); setShowDeleteModal(true); };
  const confirmDelete  = () => { if (deleteId !== null) deleteBooking(deleteId); setShowDeleteModal(false); setDeleteId(null); };
  const cancelDelete   = () => { setShowDeleteModal(false); setDeleteId(null); };

  const formatTime = (iso) => {
    if (!iso) return '-';
    try {
      return new Date(iso).toLocaleString('ar-EG', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
      });
    } catch { return '-'; }
  };

  const formatExtras = (extras) => {
    if (!extras || extras.length === 0) return '-';
    return extras.map((e) => `${e.name} ×${e.qty}`).join('، ');
  };

  const statusLabel = { pending: 'بانتظار المراجعة', approved: 'مؤكد', completed: 'مكتمل', rejected: 'مرفوض' };
  const statusClass = { pending: 'badge-pending', approved: 'badge-approved', completed: 'badge-completed', rejected: 'badge-rejected' };

  const total    = bookings.length;
  const pending  = bookings.filter((b) => b.status === 'pending').length;
  const approved = bookings.filter((b) => b.status === 'approved').length;

  return (
    <AdminLayout>
      <section className="admin-bookings">
        <h2 className="section-title">إدارة الحجوزات</h2>
        <p className="section-subtitle">جميع طلبات الحجز الواردة من صفحة الموقع.</p>

        {/* Stats */}
        <div className="bookings-stats-row">
          <div className="small-stat-card card-purple"><h4>إجمالي الحجوزات</h4><p>{total}</p></div>
          <div className="small-stat-card card-gold"><h4>بانتظار المراجعة</h4><p>{pending}</p></div>
          <div className="small-stat-card card-green"><h4>الحجوزات المؤكدة</h4><p>{approved}</p></div>
        </div>

        {bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>لا توجد طلبات حجز حالية</h3>
            <p>الحجوزات الجديدة التي يقوم بها العملاء ستظهر هنا تلقائياً.</p>
            <Link to="/booking" className="empty-btn">ذهاب إلى صفحة الحجز</Link>
          </div>
        ) : (
          <>
            {/* 1. Mobile Cards View (< 992px) */}
            <div className="admin-bookings-mobile-cards">
              {bookings.map((b, index) => (
                <div key={b.id} className={`booking-card-item ${b.status === 'completed' ? 'card-completed' : ''}`}>
                  <div className="card-header-top">
                    <div className="card-id-badge">#{index + 1}</div>
                    <div className="card-time-tag">⏱️ {formatTime(b.created_at)}</div>
                    <span className={`badge ${statusClass[b.status] || 'badge-pending'}`}>
                      {statusLabel[b.status] || statusLabel.pending}
                    </span>
                  </div>

                  <div className="card-customer-row">
                    <div className="customer-info-box">
                      <span className="customer-name">{b.name || 'عميل آيرس'}</span>
                      <span className="customer-phone">{b.phone || '-'}</span>
                    </div>
                    <div className="customer-contact-actions">
                      {b.phone && (
                        <>
                          <a
                            href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-card-icon whatsapp-btn"
                            title="تواصل واتساب"
                          >
                            💬 واتساب
                          </a>
                          <a
                            href={`tel:${b.phone}`}
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
                      <span className="info-label">التاريخ والوقت:</span>
                      <span className="info-val">{b.date || '-'} ({b.time || '-'})</span>
                    </div>
                    <div className="card-info-item">
                      <span className="info-label">الباقة المطلوبة:</span>
                      <span className="info-val highlight-gold">{b.package_name || '-'}</span>
                    </div>
                    <div className="card-info-item">
                      <span className="info-label">مدة الجلسة:</span>
                      <span className="info-val">{b.duration ? `${b.duration} دقيقة` : '-'}</span>
                    </div>
                    <div className="card-info-item">
                      <span className="info-label">عدد المرافقين:</span>
                      <span className="info-val">{b.companions ?? 0} شخص</span>
                    </div>
                  </div>

                  {b.extras && b.extras.length > 0 && (
                    <div className="card-extras-box">
                      <span className="info-label">الإضافات والخدمات:</span>
                      <span className="extras-list">{formatExtras(b.extras)}</span>
                    </div>
                  )}

                  <div className="card-financial-box">
                    <div className="fin-item">
                      <span className="fin-lbl">المجموع:</span>
                      <span className="fin-val">{b.subtotal != null ? `${b.subtotal} JOD` : '-'}</span>
                    </div>
                    <div className="fin-item">
                      <span className="fin-lbl">العربون:</span>
                      <span className="fin-val deposit-paid">{b.deposit_amount != null ? `${b.deposit_amount} JOD` : '-'}</span>
                    </div>
                    <div className="fin-item">
                      <span className="fin-lbl">المتبقي:</span>
                      <span className="fin-val remaining-due">{b.remaining_amount != null ? `${b.remaining_amount} JOD` : '-'}</span>
                    </div>
                  </div>

                  {b.receipt_url && (
                    <div className="card-receipt-box">
                      <button
                        type="button"
                        className="btn-view-receipt-card"
                        onClick={() => setReceiptModal(b.receipt_url)}
                      >
                        📄 معاينة وصل العربون المرفق
                      </button>
                    </div>
                  )}

                  <div className="card-action-bar">
                    <div className="status-select-wrap">
                      <label className="as-label-xs">تحديث الحالة:</label>
                      <select
                        value={b.status || 'pending'}
                        onChange={(e) => updateStatus(b.id, e.target.value)}
                        className="card-status-select"
                      >
                        <option value="pending">بانتظار المراجعة</option>
                        <option value="approved">مؤكد</option>
                        <option value="completed">مكتمل</option>
                        <option value="rejected">مرفوض</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      className="btn-action delete btn-card-delete"
                      onClick={() => openDeleteModal(b.id)}
                    >
                      🗑️ حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 2. Desktop Table View (>= 992px) */}
            <div className="table-container admin-bookings-table-desktop">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>وقت الطلب</th>
                    <th>التاريخ</th>
                    <th>الموعد</th>
                    <th>العميل</th>
                    <th>الهاتف</th>
                    <th>الباقة</th>
                    <th>المدة</th>
                    <th>المرافقون</th>
                    <th>الإضافات</th>
                    <th>المجموع</th>
                    <th>العربون</th>
                    <th>المتبقي</th>
                    <th>الوصل</th>
                    <th>الحالة</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b, index) => (
                    <tr key={b.id} className={b.status === 'completed' ? 'row-completed' : ''}>
                      <td>{index + 1}</td>
                      <td>{formatTime(b.created_at)}</td>
                      <td>{b.date || '-'}</td>
                      <td>{b.time || '-'}</td>
                      <td>{b.name || '-'}</td>
                      <td>{b.phone || '-'}</td>
                      <td>{b.package_name || '-'}</td>
                      <td>{b.duration ? `${b.duration} د` : '-'}</td>
                      <td>{b.companions ?? '-'}</td>
                      <td style={{ maxWidth: 160, whiteSpace: 'normal', fontSize: '0.82rem' }}>
                        {formatExtras(b.extras)}
                      </td>
                      <td>{b.subtotal != null ? `${b.subtotal} JOD` : '-'}</td>
                      <td>{b.deposit_amount != null ? `${b.deposit_amount} JOD` : '-'}</td>
                      <td>{b.remaining_amount != null ? `${b.remaining_amount} JOD` : '-'}</td>
                      <td>
                        {b.receipt_url ? (
                          <button
                            type="button"
                            className="btn-action confirm"
                            style={{ whiteSpace: 'nowrap' }}
                            onClick={() => setReceiptModal(b.receipt_url)}
                          >
                            عرض الوصل
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>لا يوجد</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${statusClass[b.status] || 'badge-pending'}`}>
                          {statusLabel[b.status] || statusLabel.pending}
                        </span>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button type="button" className="btn-action confirm"  onClick={() => updateStatus(b.id, 'approved')}>تأكيد</button>
                          <button type="button" className="btn-action complete" onClick={() => updateStatus(b.id, 'completed')}>مكتمل</button>
                          <button type="button" className="btn-action reject"   onClick={() => updateStatus(b.id, 'rejected')}>رفض</button>
                          <button type="button" className="btn-action delete"   onClick={() => openDeleteModal(b.id)}>حذف</button>
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

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">تأكيد الحذف</h3>
            <p className="modal-message">هل أنت متأكد من حذف هذا الحجز؟ لا يمكن التراجع عن هذه العملية.</p>
            <div className="modal-buttons">
              <button className="modal-btn cancel"  onClick={cancelDelete}>إلغاء</button>
              <button className="modal-btn confirm" onClick={confirmDelete}>حذف الحجز</button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt image modal */}
      {receiptModal && (
        <div className="modal-overlay" onClick={() => setReceiptModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <h3 className="modal-title">وصل العربون</h3>
            <img
              src={receiptModal}
              alt="وصل العربون"
              style={{ width: '100%', borderRadius: 10, maxHeight: 420, objectFit: 'contain', marginBottom: 16 }}
            />
            <div className="modal-buttons">
              <button className="modal-btn cancel" onClick={() => setReceiptModal(null)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminBookings;