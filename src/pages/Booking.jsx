import React, { useState, useEffect } from 'react';
import { supabase, uploadFile } from '../lib/supabase';
import '../styles/booking.css';

// ─────────────────────────────────────────────
// Time helpers
// ─────────────────────────────────────────────
const timeToMinutes = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const minutesToTime = (min) => {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// ─────────────────────────────────────────────
// Package definitions
// ─────────────────────────────────────────────
const PACKAGES = [
  { name: 'بكج 20', price: 20, duration: 25, label: '25 دقيقة' },
  { name: 'بكج 30', price: 30, duration: 50, label: '50 دقيقة' },
  { name: 'بكج 35', price: 35, duration: 50, label: '50 دقيقة' },
  { name: 'بكج 40', price: 40, duration: 50, label: '50 دقيقة' },
  { name: 'الفل بكج 65', price: 65, duration: 50, label: '50 دقيقة' },
];

const DEPOSIT = 10;
const FREE_COMPANIONS = 5;
const EXTRA_COMPANION_PRICE = 2;

// ─────────────────────────────────────────────
// Slot generator
// ─────────────────────────────────────────────
const generateSlots = (date, durationMins, existingBookings) => {
  if (!date) return [];
  const START = 9 * 60;   // 09:00
  const END = 26 * 60;  // 02:00 next day
  const occupied = [];

  existingBookings.forEach((b) => {
    if (b.date === date && (b.status === 'approved' || b.status === 'completed')) {
      const s = timeToMinutes(b.time);
      const d = b.duration || (b.package_name === 'بكج 20' ? 25 : 50);
      occupied.push([s, s + d]);
    }
  });

  const isFree = (s, d) => {
    const e = s + d;
    return !occupied.some(([os, oe]) => s < oe && e > os);
  };

  const slots = [];
  for (let t = START; t + durationMins <= END; t += 30) {
    if (isFree(t, durationMins)) slots.push(minutesToTime(t));
  }
  return slots;
};

// ─────────────────────────────────────────────
// Format time for display (12h Arabic)
// ─────────────────────────────────────────────
const formatTime12 = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const period = h < 12 ? 'ص' : 'م';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const Booking = () => {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Step 1 state
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [existingBookings, setExistingBookings] = useState([]);

  // Step 2 state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [companions, setCompanions] = useState(0);
  const [notes, setNotes] = useState('');
  const [extras, setExtras] = useState([]);       // [{id, name, price, qty}]
  const [availableExtras, setAvailableExtras] = useState([]);
  const [receiptFile, setReceiptFile] = useState(null);     // File object for upload
  const [receiptPreview, setReceiptPreview] = useState(''); // base64 for preview
  const [receiptName, setReceiptName] = useState('');

  // ── Load bookings & extras on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('date, time, duration, package_name, status');
        if (bookingsData) setExistingBookings(bookingsData);
      } catch { setExistingBookings([]); }

      try {
        const { data: extrasData } = await supabase
          .from('booking_extras')
          .select('*')
          .order('id', { ascending: true });
        if (extrasData && extrasData.length > 0) {
          setAvailableExtras(extrasData);
          setExtras(extrasData.map((e) => ({ ...e, qty: 0 })));
        }
      } catch { /* fallback: no extras */ }
    };
    fetchData();
  }, []);

  // ── Regenerate slots when date/package changes
  useEffect(() => {
    if (selectedDate && selectedPackage) {
      setAvailableSlots(generateSlots(selectedDate, selectedPackage.duration, existingBookings));
      setSelectedTime('');
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, selectedPackage, existingBookings]);

  // ─────────────────────────────────
  // Calculations
  // ─────────────────────────────────
  const extraCompanions = Math.max(0, companions - FREE_COMPANIONS);
  const extraCompanionsCost = extraCompanions * EXTRA_COMPANION_PRICE;
  const extrasTotal = extras.reduce((sum, e) => sum + e.price * e.qty, 0);
  const packagePrice = selectedPackage ? selectedPackage.price : 0;
  const subtotal = packagePrice + extraCompanionsCost + extrasTotal;
  const remaining = subtotal - DEPOSIT;

  // ─────────────────────────────────
  // Receipt file handler
  // ─────────────────────────────────
  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setReceiptFile(file);
    setReceiptName(file.name);
    const reader = new FileReader();
    reader.onload = () => setReceiptPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // ─────────────────────────────────
  // Extras qty
  // ─────────────────────────────────
  const updateExtraQty = (id, delta) => {
    setExtras((prev) =>
      prev.map((e) => e.id === id ? { ...e, qty: Math.max(0, e.qty + delta) } : e)
    );
  };

  // ─────────────────────────────────
  // Submit booking
  // ─────────────────────────────────
  const submitBooking = async () => {
    setSubmitting(true);
    try {
      // Upload receipt to storage
      let receiptUrl = null;
      if (receiptFile) {
        const ext = receiptFile.name.split('.').pop().toLowerCase();
        const filePath = `receipt-booking-${Date.now()}.${ext}`;
        receiptUrl = await uploadFile('payment-receipts', filePath, receiptFile);
      }

      const selectedExtras = extras.filter((e) => e.qty > 0).map((e) => ({
        id: e.id, name: e.name, price: e.price, qty: e.qty,
      }));

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          name,
          phone,
          package_name: selectedPackage.name,
          package_price: packagePrice,
          date: selectedDate,
          time: selectedTime,
          duration: selectedPackage.duration,
          companions,
          extra_companions: extraCompanions,
          extra_companions_cost: extraCompanionsCost,
          extras: selectedExtras,
          extras_total: extrasTotal,
          subtotal,
          deposit_amount: DEPOSIT,
          remaining_amount: remaining,
          receipt_url: receiptUrl,
          notes,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state so slot generation updates
      setExistingBookings((prev) => [...prev, data]);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء إرسال الحجز. الرجاء المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────
  // Validate step 1 before proceeding
  // ─────────────────────────────────
  const canProceedStep1 = selectedPackage && selectedDate && selectedTime;
  const canProceedStep2 = name.trim() && phone.trim() && receiptFile;

  // ─────────────────────────────────
  // Render
  // ─────────────────────────────────
  if (submitted) {
    return (
      <div className="booking-page" dir="rtl">
        <div className="booking-success-card">
          <div className="success-icon">✅</div>
          <h2>تم استلام طلب الحجز بنجاح!</h2>
          <p>
            تم استلام طلب الحجز بنجاح. سيتم مراجعة الوصل والموعد والتواصل معك
            لتأكيد الحجز.
          </p>
          <button className="bk-btn-primary" onClick={() => {
            setSubmitted(false);
            setStep(1);
            setSelectedPackage(null);
            setSelectedDate('');
            setSelectedTime('');
            setName(''); setPhone(''); setCompanions(0); setNotes('');
            setExtras(availableExtras.map((e) => ({ ...e, qty: 0 })));
            setReceiptFile(null); setReceiptPreview(''); setReceiptName('');
          }}>
            حجز موعد آخر
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page" dir="rtl">
      {/* ── Page header ── */}
      <div className="bk-header">
        <h1 className="bk-title">احجز جلستك</h1>
        <p className="bk-subtitle">مرحباً بك في IRIS Studio — اختر موعدك بكل سهولة</p>
      </div>

      {/* ── Step indicator ── */}
      <div className="bk-steps-indicator">
        {['اختيار البكج والتاريخ', 'بياناتك', 'التأكيد'].map((lbl, i) => (
          <div key={i} className={`bk-step-dot ${step === i + 1 ? 'active' : step > i + 1 ? 'done' : ''}`}>
            <span className="dot-num">{step > i + 1 ? '✓' : i + 1}</span>
            <span className="dot-lbl">{lbl}</span>
          </div>
        ))}
      </div>

      {/* ════════════════ STEP 1 ════════════════ */}
      {step === 1 && (
        <div className="bk-section">
          <h2 className="bk-section-title">الخطوة الأولى: اختيار البكج والتاريخ</h2>

          {/* Package cards */}
          <div className="pkg-grid">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.name}
                className={`pkg-card ${selectedPackage?.name === pkg.name ? 'selected' : ''}`}
                onClick={() => setSelectedPackage(pkg)}
              >
                <div className="pkg-name">{pkg.name}</div>
                <div className="pkg-price">{pkg.price} JOD</div>
                <div className="pkg-duration">⏱ {pkg.label}</div>
                {selectedPackage?.name === pkg.name && <div className="pkg-check">✓</div>}
              </div>
            ))}
          </div>

          {/* Date picker */}
          <div className="bk-field-row">
            <div className="bk-field">
              <label className="bk-label">التاريخ</label>
              <input
                type="date"
                className="bk-input"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          {/* Time slots */}
          {selectedPackage && selectedDate && (
            <div className="slots-section">
              <h3 className="slots-title">المواعيد المتاحة</h3>
              {availableSlots.length > 0 ? (
                <div className="slots-grid">
                  {availableSlots.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`slot-btn ${selectedTime === t ? 'selected' : ''}`}
                      onClick={() => setSelectedTime(t)}
                    >
                      {formatTime12(t)}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="no-slots">لا توجد مواعيد متاحة لهذه الباقة في اليوم المحدد.</p>
              )}
            </div>
          )}

          <button
            className="bk-btn-primary"
            disabled={!canProceedStep1}
            onClick={() => setStep(2)}
          >
            التالي: إدخال بياناتك ←
          </button>
        </div>
      )}

      {/* ════════════════ STEP 2 ════════════════ */}
      {step === 2 && (
        <div className="bk-section">
          <h2 className="bk-section-title">الخطوة الثانية: بياناتك والإضافات</h2>

          {/* Customer info */}
          <div className="bk-fields-group">
            <div className="bk-field">
              <label className="bk-label">الاسم الكامل *</label>
              <input
                type="text"
                className="bk-input"
                placeholder="ادخل اسمك الكامل"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="bk-field">
              <label className="bk-label">رقم الهاتف / واتساب *</label>
              <input
                type="tel"
                className="bk-input"
                placeholder="07xxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="bk-field">
              <label className="bk-label">
                عدد المرافقين
                <span className="bk-hint">(حتى 5 مجاناً، بعدها 2 JOD للشخص)</span>
              </label>
              <div className="qty-control">
                <button type="button" className="qty-btn" onClick={() => setCompanions((c) => Math.max(0, c - 1))}>−</button>
                <span className="qty-val">{companions}</span>
                <button type="button" className="qty-btn" onClick={() => setCompanions((c) => c + 1)}>+</button>
              </div>
              {extraCompanions > 0 && (
                <p className="bk-hint-cost">
                  {extraCompanions} مرافق إضافي × 2 JOD = <strong>{extraCompanionsCost} JOD</strong>
                </p>
              )}
            </div>
            <div className="bk-field">
              <label className="bk-label">ملاحظات</label>
              <textarea
                className="bk-input bk-textarea"
                placeholder="أي طلبات خاصة..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Extras */}
          <div className="extras-section">
            <h3 className="extras-title">الإضافات المطبوعة (اختياري)</h3>
            <div className="extras-grid">
              {extras.map((e) => (
                <div key={e.id} className={`extra-card ${e.qty > 0 ? 'selected' : ''}`}>
                  <div className="extra-name">{e.name}</div>
                  <div className="extra-price">{e.price} JOD</div>
                  <div className="qty-control">
                    <button type="button" className="qty-btn" onClick={() => updateExtraQty(e.id, -1)}>−</button>
                    <span className="qty-val">{e.qty}</span>
                    <button type="button" className="qty-btn" onClick={() => updateExtraQty(e.id, +1)}>+</button>
                  </div>
                  {e.qty > 0 && (
                    <div className="extra-subtotal">{e.price * e.qty} JOD</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Deposit / receipt */}
          <div className="deposit-section">
            <h3 className="extras-title">العربون</h3>
            <div className="deposit-info">
              <span>المبلغ المطلوب كعربون: <strong>10 JOD</strong></span>
              <span className="deposit-note">يُخصم من الإجمالي عند الجلسة</span>
            </div>

            {/* Payment Info */}
            <div style={{ marginBottom: 24, textAlign: 'center' }}>
              <p style={{ fontSize: '0.9rem', marginBottom: 16 }}>الرجاء تحويل مبلغ العربون باستخدام أحد الطرق التالية:</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ background: '#f4f4f4', padding: '12px 24px', borderRadius: 8, minWidth: 150, textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--bk-purple)' }}>CliQ</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '4px 0' }}>iris0</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>اسم المستلم: Hamzah Bani Domi</div>
                </div>
                <div style={{ background: '#f4f4f4', padding: '12px 24px', borderRadius: 8, minWidth: 150, textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', color: '#f16e00' }}>Orange Money</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '4px 0' }}>0797303260</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>اسم المستلم: Hamzah Bani Domi</div>
                </div>
              </div>
            </div>

            <label className="receipt-upload-label" htmlFor="receipt-upload">
              <span className="receipt-icon">📎</span>
              {receiptName ? receiptName : 'إرفاق صورة وصل العربون *'}
            </label>
            <input
              id="receipt-upload"
              type="file"
              accept="image/*"
              className="receipt-input"
              onChange={handleReceiptUpload}
            />
            {receiptPreview && (
              <img src={receiptPreview} alt="وصل العربون" className="receipt-preview" />
            )}
          </div>

          <div className="bk-nav-row">
            <button className="bk-btn-outline" onClick={() => setStep(1)}>← السابق</button>
            <button
              className="bk-btn-primary"
              disabled={!canProceedStep2}
              onClick={() => setStep(3)}
            >
              مراجعة الطلب ←
            </button>
          </div>
        </div>
      )}

      {/* ════════════════ STEP 3 — Summary ════════════════ */}
      {step === 3 && (
        <div className="bk-section">
          <h2 className="bk-section-title">الخطوة الثالثة: تأكيد الحجز</h2>

          <div className="summary-card">
            <div className="summary-header">
              <span className="summary-logo">IRIS</span>
              <span className="summary-sub">إيصال الحجز</span>
            </div>

            <div className="summary-rows">
              <div className="summary-row"><span>الاسم</span><strong>{name}</strong></div>
              <div className="summary-row"><span>الهاتف</span><strong>{phone}</strong></div>
              <div className="summary-row"><span>الباقة</span><strong>{selectedPackage?.name}</strong></div>
              <div className="summary-row"><span>التاريخ</span><strong>{selectedDate}</strong></div>
              <div className="summary-row"><span>الوقت</span><strong>{formatTime12(selectedTime)}</strong></div>
              <div className="summary-row"><span>مدة الجلسة</span><strong>{selectedPackage?.label}</strong></div>
              <div className="summary-row"><span>عدد المرافقين</span><strong>{companions}</strong></div>
              {extraCompanions > 0 && (
                <div className="summary-row">
                  <span>تكلفة المرافقين الإضافيين</span>
                  <strong>{extraCompanionsCost} JOD</strong>
                </div>
              )}
              {notes && <div className="summary-row"><span>ملاحظات</span><strong>{notes}</strong></div>}
            </div>

            {extras.some((e) => e.qty > 0) && (
              <div className="summary-extras">
                <h4>الإضافات</h4>
                {extras.filter((e) => e.qty > 0).map((e) => (
                  <div key={e.id} className="summary-extra-row">
                    <span>{e.name} × {e.qty}</span>
                    <span>{e.price * e.qty} JOD</span>
                  </div>
                ))}
              </div>
            )}

            <div className="summary-totals">
              <div className="total-row"><span>المجموع الفرعي</span><strong>{subtotal} JOD</strong></div>
              <div className="total-row deposit"><span>العربون المدفوع</span><strong>− {DEPOSIT} JOD</strong></div>
              <div className="total-row remaining"><span>المبلغ المتبقي عند الجلسة</span><strong>{remaining} JOD</strong></div>
            </div>

            {receiptPreview && (
              <div className="summary-receipt">
                <p>وصل العربون:</p>
                <img src={receiptPreview} alt="وصل العربون" className="receipt-preview" />
              </div>
            )}
          </div>

          <div className="bk-nav-row">
            <button className="bk-btn-outline" onClick={() => setStep(2)}>← تعديل البيانات</button>
            <button className="bk-btn-success" onClick={submitBooking} disabled={submitting}>
              {submitting ? '⏳ جاري الإرسال...' : 'تأكيد طلب الحجز ✓'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;