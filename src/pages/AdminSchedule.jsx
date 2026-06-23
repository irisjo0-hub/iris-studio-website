import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';
import '../styles/admin.css';

const AdminSchedule = () => {
  const [bookings, setBookings]         = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [displayed, setDisplayed]       = useState([]);
  const [message, setMessage]           = useState('');
  const [receiptModal, setReceiptModal] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*');
        if (error) throw error;
        if (data) setBookings(data);
      } catch (e) {
        console.error('Failed to fetch bookings', e);
        setBookings([]);
      }
    };
    fetchBookings();
  }, []);

  const handleShow = () => {
    if (!selectedDate) {
      setMessage('اختر تاريخاً لعرض الحجوزات المؤكدة.');
      setDisplayed([]);
      return;
    }
    const filtered = bookings
      .filter((b) => (b.status === 'approved' || b.status === 'completed') && b.date === selectedDate)
      .sort((a, b) => a.time.localeCompare(b.time));
    if (filtered.length === 0) {
      setMessage('لا توجد حجوزات مؤكدة في هذا التاريخ.');
      setDisplayed([]);
    } else {
      setMessage('');
      setDisplayed(filtered);
    }
  };

  const statusLabel = { approved: 'مؤكد', completed: 'مكتمل' };
  const statusClass = { approved: 'badge-approved', completed: 'badge-completed' };

  const formatExtras = (extras) => {
    if (!extras || extras.length === 0) return '-';
    return extras.map((e) => `${e.name} ×${e.qty}`).join('، ');
  };

  return (
    <AdminLayout>
      <section className="admin-schedule">
        <h2 className="section-title">جدول المواعيد</h2>
        <p className="section-subtitle">حدد تاريخاً لعرض الحجوزات المؤكدة أو المكتملة في ذلك اليوم.</p>

        {/* Date filter */}
        <div className="date-filter-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <label htmlFor="schedule-date" style={{ fontWeight: 700, fontSize: '1rem' }}>اختر التاريخ:</label>
          <input
            id="schedule-date"
            type="date"
            className="bk-input"
            style={{ maxWidth: 200, background: '#fff' }}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button
            className="filter-btn"
            style={{ background: 'var(--iris-purple)', color: '#fff', padding: '10px 24px', borderRadius: 8 }}
            onClick={handleShow}
          >
            عرض الحجوزات
          </button>
        </div>

        {message && (
          <div className="empty-state">
            <h3>{message}</h3>
          </div>
        )}

        {displayed.length > 0 && (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>الوقت</th>
                  <th>العميل</th>
                  <th>الهاتف</th>
                  <th>الباقة</th>
                  <th>المدة</th>
                  <th>المرافقون</th>
                  <th>الإضافات</th>
                  <th>المجموع</th>
                  <th>المتبقي</th>
                  <th>الوصل</th>
                  <th>الحالة</th>
                  <th>ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((b) => (
                  <tr key={b.id} className={b.status === 'completed' ? 'row-completed' : ''}>
                    <td><strong>{b.time}</strong></td>
                    <td>{b.name}</td>
                    <td>{b.phone}</td>
                    <td>{b.package_name}</td>
                    <td>{b.duration ? `${b.duration} د` : '-'}</td>
                    <td>{b.companions ?? '-'}</td>
                    <td style={{ maxWidth: 160, whiteSpace: 'normal', fontSize: '0.82rem' }}>{formatExtras(b.extras)}</td>
                    <td>{b.subtotal != null ? `${b.subtotal} JOD` : '-'}</td>
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
                      <span className={`badge ${statusClass[b.status]}`}>{statusLabel[b.status]}</span>
                    </td>
                    <td style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{b.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Receipt modal */}
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

export default AdminSchedule;
