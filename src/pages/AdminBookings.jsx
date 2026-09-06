import React, { useEffect, useState } from 'react';
import { supabase, deleteFile, extractPathFromUrl, createSignedUrl } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';
import '../styles/admin.css';

const STATUS_OPTIONS = ['pending', 'approved', 'completed', 'rejected'];

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [receiptModal, setReceiptModal] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    let active = true;

    const fetchBookings = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (active) setBookings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
        if (active) {
          setBookings([]);
          setLoadError('تعذر تحميل الحجوزات من السيرفر. يرجى تحديث الصفحة والمحاولة مرة أخرى.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchBookings();
    return () => { active = false; };
  }, []);

  const updateStatus = async (id, status) => {
    if (!STATUS_OPTIONS.includes(status)) {
      alert('حالة الحجز غير صالحة.');
      return;
    }

    setSavingId(id);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setBookings(prev => prev.map((booking) => (
        booking.id === id ? { ...booking, status } : booking
      )));
      alert('تم تحديث حالة الحجز بنجاح');
    } catch (err) {
      console.error('Supabase booking status update failed:', err);
      alert('تعذر تحديث حالة الحجز على السيرفر: ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  const deleteBooking = async (id) => {
    const booking = bookings.find((item) => item.id === id);
    if (!booking) {
      setShowDeleteModal(false);
      setDeleteId(null);
      return;
    }

    setSavingId(id);
    try {
      // Delete the database row first. This prevents losing the booking if the DB delete fails.
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // The booking is gone; now clean up the private receipt. A failed cleanup is safe to retry.
      if (booking.receipt_url) {
        const path = extractPathFromUrl(booking.receipt_url, 'payment-receipts');
        if (path) {
          try {
            await deleteFile('payment-receipts', path);
          } catch (storageError) {
            console.warn('Booking deleted but receipt cleanup failed:', storageError);
          }
        }
      }

      setBookings(prev => prev.filter((item) => item.id !== id));
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      console.error('Booking deletion failed:', err);
      alert('حدث خطأ أثناء الحذف: ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  const handleOpenReceiptModal = async (receiptUrl) => {
    if (!receiptUrl) return;

    try {
      const signed = await createSignedUrl('payment-receipts', receiptUrl, 3600);
      if (signed) {
        setReceiptModal(signed);
      } else {
        alert('تعذر تحميل وصل الدفع. ملف الوصل غير متاح أو لا تملك صلاحية للوصول إليه.');
      }
    } catch (err) {
      console.error('Receipt access failed:', err);
      alert('تعذر تحميل وصل الدفع.');
    }
  };

  const openDeleteModal = (id) => {
    if (savingId !== null) return;
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteId !== null) void deleteBooking(deleteId);
  };

  const cancelDelete = () => {
    if (savingId !== null) return;
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const formatTime = (iso) => {
    if (!iso) return '-';
    try {
      return new Date(iso).toLocaleString('ar-EG', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
      });
    } catch {
      return '-';
    }
  };

  const formatExtras = (extras) => {
    if (!Array.isArray(extras) || extras.length === 0) return '-';
    return extras.map((e) => `${String(e?.name || 'إضافة')} ×${Number(e?.qty) || 0}`).join('، ');
  };

  const statusLabel = { pending: 'بانتظار المراجعة', approved: 'مؤكد', completed: 'مكتمل', rejected: 'مرفوض' };
  const statusClass = { pending: 'badge-pending', approved: 'badge-approved', completed: 'badge-completed', rejected: 'badge-rejected' };

  const total = bookings.length;
  const pending = bookings.filter((b) => (b.status || 'pending') === 'pending').length;
  const approved = bookings.filter((b) => b.status === 'approved').length;
  const completed = bookings.filter((b) => b.status === 'completed').length;
  const rejected = bookings.filter((b) => b.status === 'rejected').length;

  const filteredBookings = filterStatus === 'all'
    ? bookings
    : bookings.filter((b) => (b.status || 'pending') === filterStatus);

  return (
    <AdminLayout>
      <section className="admin-bookings">
        <h2 className="section-title">إدارة وأقسام الحجوزات</h2>
        <p className="section-subtitle">إدارة، فلترة ومتابعة جميع طلبات الحجز الواردة من الموقع.</p>

        <div className="bookings-stats-row">
          <div className={`small-stat-card card-purple ${filterStatus === 'all' ? 'active-stat' : ''}`} onClick={() => setFilterStatus('all')}>
            <h4>إجمالي الحجوزات</h4><p>{total}</p>
          </div>
          <div className={`small-stat-card card-gold ${filterStatus === 'pending' ? 'active-stat' : ''}`} onClick={() => setFilterStatus('pending')}>
            <h4>بانتظار المراجعة</h4><p>{pending}</p>
          </div>
          <div className={`small-stat-card card-green ${filterStatus === 'approved' ? 'active-stat' : ''}`} onClick={() => setFilterStatus('approved')}>
            <h4>الحجوزات المؤكدة</h4><p>{approved}</p>
          </div>
        </div>

        <div className="booking-filter-tabs-row">
          {[
            ['all', `📋 جميع الحجوزات (${total})`],
            ['pending', `⏳ بانتظار المراجعة (${pending})`],
            ['approved', `✅ المؤكدة (${approved})`],
            ['completed', `🎯 المكتملة (${completed})`],
            ['rejected', `❌ المرفوضة (${rejected})`],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`booking-filter-tab ${filterStatus === value ? 'active' : ''}`}
              onClick={() => setFilterStatus(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="empty-state"><div className="empty-icon">⏳</div><h3>جاري تحميل الحجوزات...</h3></div>
        ) : loadError ? (
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <h3>{loadError}</h3>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>لا توجد حجوزات في هذا القسم حالياً</h3>
            <p>عند وصول حجوزات جديدة مطابقة لهذا القسم ستظهر هنا.</p>
            {filterStatus !== 'all' && (
              <button type="button" className="empty-btn" onClick={() => setFilterStatus('all')}>عرض جميع الحجوزات</button>
            )}
          </div>
        ) : (
          <>
            <div className="admin-bookings-mobile-cards">
              {filteredBookings.map((b, index) => (
                <div key={b.id} className={`booking-card-item ${b.status === 'completed' ? 'card-completed' : ''}`}>
                  <div className="card-header-top">
                    <div className="card-id-badge">#{index + 1}</div>
                    <div className="card-time-tag">⏱️ {formatTime(b.created_at)}</div>
                    <span className={`badge ${statusClass[b.status] || 'badge-pending'}`}>{statusLabel[b.status] || statusLabel.pending}</span>
                  </div>

                  <div className="card-customer-row">
                    <div className="customer-info-box">
                      <span className="customer-name">{b.name || 'عميل آيرس'}</span>
                      <span className="customer-phone">{b.phone || '-'}</span>
                    </div>
                    <div className="customer-contact-actions">
                      {b.phone && (
                        <>
                          <a href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn-card-icon whatsapp-btn" title="تواصل واتساب">💬 واتساب</a>
                          <a href={`tel:${b.phone}`} className="btn-card-icon call-btn" title="اتصال مباشر">📞 اتصال</a>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="card-info-grid">
                    <div className="card-info-item"><span className="info-label">التاريخ والوقت:</span><span className="info-val">{b.date || '-'} ({b.time || '-'})</span></div>
                    <div className="card-info-item"><span className="info-label">الباقة المطلوبة:</span><span className="info-val highlight-gold">{b.package_name || '-'}</span></div>
                    <div className="card-info-item"><span className="info-label">مدة الجلسة:</span><span className="info-val">{b.duration ? `${b.duration} دقيقة` : '-'}</span></div>
                    <div className="card-info-item"><span className="info-label">عدد المرافقين:</span><span className="info-val">{b.companions ?? 0} شخص</span></div>
                  </div>

                  {Array.isArray(b.extras) && b.extras.length > 0 && (
                    <div className="card-extras-box"><span className="info-label">الإضافات والخدمات:</span><span className="extras-list">{formatExtras(b.extras)}</span></div>
                  )}

                  <div className="card-financial-box">
                    <div className="fin-item"><span className="fin-lbl">المجموع:</span><span className="fin-val">{b.subtotal != null ? `${b.subtotal} JOD` : '-'}</span></div>
                    <div className="fin-item"><span className="fin-lbl">العربون:</span><span className="fin-val deposit-paid">{b.deposit_amount != null ? `${b.deposit_amount} JOD` : '-'}</span></div>
                    <div className="fin-item"><span className="fin-lbl">المتبقي:</span><span className="fin-val remaining-due">{b.remaining_amount != null ? `${b.remaining_amount} JOD` : '-'}</span></div>
                  </div>

                  {b.receipt_url && (
                    <div className="card-receipt-box">
                      <button type="button" className="btn-view-receipt-card" onClick={() => void handleOpenReceiptModal(b.receipt_url)}>📄 معاينة وصل العربون المرفق</button>
                    </div>
                  )}

                  <div className="card-action-bar">
                    <div className="status-select-wrap">
                      <label className="as-label-xs">تحديث الحالة:</label>
                      <select value={b.status || 'pending'} onChange={(e) => void updateStatus(b.id, e.target.value)} className="card-status-select" disabled={savingId === b.id}>
                        <option value="pending">بانتظار المراجعة</option>
                        <option value="approved">مؤكد</option>
                        <option value="completed">مكتمل</option>
                        <option value="rejected">مرفوض</option>
                      </select>
                    </div>
                    <button type="button" className="btn-action delete btn-card-delete" onClick={() => openDeleteModal(b.id)} disabled={savingId === b.id}>🗑️ حذف</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="table-container admin-bookings-table-desktop">
              <table className="admin-table">
                <thead><tr>
                  <th>#</th><th>وقت الطلب</th><th>التاريخ</th><th>الموعد</th><th>العميل</th><th>الهاتف</th><th>الباقة</th><th>المدة</th><th>المرافقون</th><th>الإضافات</th><th>المجموع</th><th>العربون</th><th>المتبقي</th><th>الوصل</th><th>الحالة</th><th>إجراءات</th>
                </tr></thead>
                <tbody>
                  {filteredBookings.map((b, index) => (
                    <tr key={b.id} className={b.status === 'completed' ? 'row-completed' : ''}>
                      <td>{index + 1}</td><td>{formatTime(b.created_at)}</td><td>{b.date || '-'}</td><td>{b.time || '-'}</td><td>{b.name || '-'}</td><td>{b.phone || '-'}</td><td>{b.package_name || '-'}</td><td>{b.duration ? `${b.duration} د` : '-'}</td><td>{b.companions ?? '-'}</td>
                      <td style={{ maxWidth: 160, whiteSpace: 'normal', fontSize: '0.82rem' }}>{formatExtras(b.extras)}</td>
                      <td>{b.subtotal != null ? `${b.subtotal} JOD` : '-'}</td><td>{b.deposit_amount != null ? `${b.deposit_amount} JOD` : '-'}</td><td>{b.remaining_amount != null ? `${b.remaining_amount} JOD` : '-'}</td>
                      <td>{b.receipt_url ? <button type="button" className="btn-action confirm" style={{ whiteSpace: 'nowrap' }} onClick={() => void handleOpenReceiptModal(b.receipt_url)}>عرض الوصل</button> : <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>لا يوجد</span>}</td>
                      <td><span className={`badge ${statusClass[b.status] || 'badge-pending'}`}>{statusLabel[b.status] || statusLabel.pending}</span></td>
                      <td><div className="actions-cell">
                        <button type="button" className="btn-action confirm" onClick={() => void updateStatus(b.id, 'approved')} disabled={savingId === b.id}>تأكيد</button>
                        <button type="button" className="btn-action complete" onClick={() => void updateStatus(b.id, 'completed')} disabled={savingId === b.id}>مكتمل</button>
                        <button type="button" className="btn-action reject" onClick={() => void updateStatus(b.id, 'rejected')} disabled={savingId === b.id}>رفض</button>
                        <button type="button" className="btn-action delete" onClick={() => openDeleteModal(b.id)} disabled={savingId === b.id}>حذف</button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">تأكيد الحذف</h3>
            <p className="modal-message">هل أنت متأكد من حذف هذا الحجز؟ لا يمكن التراجع عن هذه العملية.</p>
            <div className="modal-buttons">
              <button className="modal-btn cancel" onClick={cancelDelete} disabled={savingId !== null}>إلغاء</button>
              <button className="modal-btn confirm" onClick={confirmDelete} disabled={savingId !== null}>{savingId !== null ? 'جاري الحذف...' : 'حذف الحجز'}</button>
            </div>
          </div>
        </div>
      )}

      {receiptModal && (
        <div className="modal-overlay" onClick={() => setReceiptModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <h3 className="modal-title">وصل العربون</h3>
            <img src={receiptModal} alt="وصل العربون" style={{ width: '100%', borderRadius: 10, maxHeight: 420, objectFit: 'contain', marginBottom: 16 }} />
            <div className="modal-buttons"><button className="modal-btn cancel" onClick={() => setReceiptModal(null)}>إغلاق</button></div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminBookings;
