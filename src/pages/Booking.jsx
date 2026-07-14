import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, uploadFile } from '../lib/supabase';
import { Calendar, Clock, User, ShoppingBag, CreditCard, Check, ChevronLeft, ChevronRight, Loader2, Paperclip, Plus, Minus, MapPin, Store, Truck } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import '../styles/booking.css';

const fadeInUp = {
  hidden: { opacity: 0, y: 30, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const cardVariant = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

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

const getAbsoluteMinutes = (t) => {
  const [h, m] = t.split(':').map(Number);
  const adjustedHour = h < 9 ? h + 24 : h;
  return adjustedHour * 60 + m;
};

// ─────────────────────────────────────────────
// Package definitions (Fallback seed data)
// ─────────────────────────────────────────────
const DEFAULT_PACKAGES = [
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
  const START = 9 * 60;   // 09:00 AM
  const END = 26 * 60;  // 02:00 AM next day
  const occupied = [];

  existingBookings.forEach((b) => {
    if (b.date === date && (b.status === 'approved' || b.status === 'completed' || b.status === 'pending')) {
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
// Custom Airbnb-Style Calendar Component
// ─────────────────────────────────────────────
const CustomCalendar = ({ value, onChange, existingBookings = [], selectedPackage = null }) => {
  const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "كانون الثاني (1)", "شباط (2)", "آذار (3)", "نيسان (4)", "أيار (5)", "حزيران (6)",
    "تموز (7)", "آب (8)", "أيلول (9)", "تشرين الأول (10)", "تشرين الثاني (11)", "كانون الأول (12)"
  ];
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 Sunday, 6 Saturday

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const days = [];
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const isSelected = (date) => {
    if (!date || !value) return false;
    const valDate = new Date(value);
    return date.getDate() === valDate.getDate() &&
           date.getMonth() === valDate.getMonth() &&
           date.getFullYear() === valDate.getFullYear();
  };

  const isDisabled = (date) => {
    if (!date) return true;
    const today = new Date();
    today.setHours(0,0,0,0);
    return date < today;
  };

  const getBookingStatus = (date) => {
    if (!date) return { hasBookings: false, fullyBooked: false };
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const bookingsForDate = existingBookings.filter(b => b.date === dateStr && (b.status === 'approved' || b.status === 'completed' || b.status === 'pending'));
    const hasBookings = bookingsForDate.length > 0;

    const duration = selectedPackage ? selectedPackage.duration : 50;
    const slots = generateSlots(dateStr, duration, existingBookings);
    const fullyBooked = slots.length === 0;

    return { hasBookings, fullyBooked };
  };

  const handleDateClick = (date) => {
    if (!date) return;
    const { fullyBooked } = getBookingStatus(date);
    if (isDisabled(date) || fullyBooked) return;
    const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    onChange(formatted);
  };

  const weekDays = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

  return (
    <div className="custom-calendar-box">
      <div className="cal-header">
        <button type="button" className="cal-arrow-btn" onClick={handlePrevMonth}>&lt;</button>
        <span className="cal-title">{monthNames[month]} {year}</span>
        <button type="button" className="cal-arrow-btn" onClick={handleNextMonth}>&gt;</button>
      </div>
      <div className="cal-weekdays-row">
        {weekDays.map(d => <div key={d} className="cal-wkday">{d}</div>)}
      </div>
      <div className="cal-days-grid">
        {days.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="cal-day-cell empty"></div>;
          const disabled = isDisabled(day);
          const { hasBookings, fullyBooked } = getBookingStatus(day);
          const isDayDisabled = disabled || fullyBooked;
          const selected = isSelected(day);
          return (
            <button
              key={`day-${day.getDate()}`}
              type="button"
              className={`cal-day-cell day-btn ${selected ? 'active-day' : ''} ${disabled ? 'past-day disabled-day' : ''} ${fullyBooked ? 'fully-booked-day disabled-day' : ''} ${hasBookings ? 'has-bookings' : ''}`}
              disabled={isDayDisabled}
              onClick={() => handleDateClick(day)}
            >
              {day.getDate()}
              {hasBookings && !fullyBooked && <span className="cal-dot"></span>}
            </button>
          );
        })}
      </div>
      <div className="cal-legend">
        <div className="legend-item"><span className="legend-dot selected"></span>المحدد</div>
        <div className="legend-item"><span className="legend-dot has-bookings"></span>متاح (يوجد حجوزات)</div>
        <div className="legend-item"><span className="legend-dot available"></span>متاح بالكامل</div>
        <div className="legend-item"><span className="legend-dot fully-booked"></span>محجوز بالكامل</div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const Booking = () => {
  const { settings } = useSiteSettings();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Database list vs fallback defaults
  const [dbPackages, setDbPackages] = useState([]);
  
  // Step 1 state
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [existingBookings, setExistingBookings] = useState([]);

  // Step 2 state (Customer Info)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [companions, setCompanions] = useState(0);
  const [notes, setNotes] = useState('');

  // Step 3 state (Add-ons & Delivery)
  const [extras, setExtras] = useState([]); // [{id, name, price, qty}]
  const [availableExtras, setAvailableExtras] = useState([]);
  const [deliverySelected, setDeliverySelected] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [alternativePhone, setAlternativePhone] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');

  // Step 4 state (Payment)
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState('');
  const [receiptName, setReceiptName] = useState('');

  // Validation errors
  const [errors, setErrors] = useState({});

  // Auto-scroll to top when step changes or on final submission success
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToTop();
  }, [step, submitted]);

  // Load packages, bookings, and extras
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: pkgsData } = await supabase
          .from('packages')
          .select('*')
          .eq('category', 'shoot')
          .eq('is_hidden', false)
          .order('sort_order', { ascending: true });
        
        if (pkgsData && pkgsData.length > 0) {
          const parsed = pkgsData.map(p => ({
            name: p.title,
            price: Number(p.price),
            duration: p.features && p.features.includes('25 دقيقة') ? 25 : 50,
            label: p.features && p.features.includes('25 دقيقة') ? '25 دقيقة' : '50 دقيقة'
          }));
          setDbPackages(parsed);
        } else {
          setDbPackages(DEFAULT_PACKAGES);
        }
      } catch {
        setDbPackages(DEFAULT_PACKAGES);
      }

      try {
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('date, time, duration, package_name, status');
        if (bookingsData) setExistingBookings(bookingsData);
      } catch {
        setExistingBookings([]);
      }

      try {
        const { data: extrasData } = await supabase
          .from('booking_extras')
          .select('*')
          .order('id', { ascending: true });
        if (extrasData && extrasData.length > 0) {
          setAvailableExtras(extrasData);
          setExtras(extrasData.map((e) => ({ ...e, qty: 0 })));
        }
      } catch {
        // Fallback extras
        const fallbackExtras = [
          { id: 1, name: 'دفتر تخرج', price: 12 },
          { id: 2, name: 'بوستر فوم 44×30', price: 6 },
          { id: 3, name: 'وشاح تطريز', price: 15 },
          { id: 4, name: 'طاقية تطريز', price: 15 }
        ];
        setAvailableExtras(fallbackExtras);
        setExtras(fallbackExtras.map((e) => ({ ...e, qty: 0 })));
      }
    };
    fetchData();
  }, []);

  // Pre-select package from URL search parameter
  useEffect(() => {
    if (dbPackages.length > 0) {
      const pkgName = searchParams.get('package');
      if (pkgName) {
        const found = dbPackages.find((p) => p.name === pkgName);
        if (found) setSelectedPackage(found);
      }
    }
  }, [searchParams, dbPackages]);

  // Generate slots when date or package changes
  useEffect(() => {
    if (selectedDate && selectedPackage) {
      const slots = generateSlots(selectedDate, selectedPackage.duration, existingBookings);
      const sorted = [...slots].sort((a, b) => getAbsoluteMinutes(a) - getAbsoluteMinutes(b));
      setAvailableSlots(sorted);
      setSelectedTime('');
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, selectedPackage, existingBookings]);

  // Calculations
  const extraCompanions = Math.max(0, companions - FREE_COMPANIONS);
  const extraCompanionsCost = extraCompanions * EXTRA_COMPANION_PRICE;
  const extrasTotal = extras.reduce((sum, e) => sum + e.price * e.qty, 0);
  const packagePrice = selectedPackage ? selectedPackage.price : 0;
  const deliveryCost = deliverySelected ? 2 : 0;
  const subtotal = packagePrice + extraCompanionsCost + extrasTotal + deliveryCost;
  const remaining = subtotal - DEPOSIT;

  // Receipt file handler
  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setReceiptFile(file);
    setReceiptName(file.name);
    const reader = new FileReader();
    reader.onload = () => setReceiptPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // Extras quantity modifier
  const updateExtraQty = (id, delta) => {
    setExtras((prev) =>
      prev.map((e) => e.id === id ? { ...e, qty: Math.max(0, e.qty + delta) } : e)
    );
  };

  // Step Navigations
  const handleNextStep1 = () => {
    if (!selectedPackage) {
      alert('الرجاء اختيار باقة الجلسة');
      return;
    }
    if (!selectedDate) {
      alert('الرجاء اختيار تاريخ الحجز');
      return;
    }
    if (!selectedTime) {
      alert('الرجاء اختيار وقت الحجز');
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (!name.trim()) {
      alert('الرجاء إدخال الاسم بالكامل');
      return;
    }
    if (!phone.trim()) {
      alert('الرجاء إدخال رقم الهاتف / واتساب');
      return;
    }
    setStep(3);
  };

  const handleNextStep3 = () => {
    if (deliverySelected && !deliveryAddress.trim()) {
      alert('الرجاء إدخال عنوان التوصيل بالتفصيل');
      return;
    }
    setStep(4);
  };

  const handleNextStep4 = () => {
    if (!receiptFile) {
      alert('الرجاء إرفاق صورة وصل العربون لإكمال الحجز');
      return;
    }
    setStep(5);
  };

  // Final submit booking to database
  const submitBooking = async () => {
    setSubmitting(true);
    try {
      let receiptUrl = null;
      if (receiptFile) {
        const ext = receiptFile.name.split('.').pop().toLowerCase();
        const filePath = `receipt-booking-${Date.now()}.${ext}`;
        receiptUrl = await uploadFile('payment-receipts', filePath, receiptFile);
      }

      const selectedExtras = extras.filter((e) => e.qty > 0).map((e) => ({
        id: e.id, name: e.name, price: e.price, qty: e.qty,
      }));

      // Combine delivery into notes to avoid schema breakage
      let finalNotes = notes;
      if (deliverySelected) {
        finalNotes = `[طلب توصيل]
العنوان: ${deliveryAddress}
هاتف بديل: ${alternativePhone || 'لا يوجد'}
رابط خرائط جوجل: ${googleMapsLink || 'لا يوجد'}

${notes}`;
      }

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
          notes: finalNotes,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      setExistingBookings((prev) => [...prev, data]);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء إرسال الحجز. الرجاء المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  // Success screen
  if (submitted) {
    return (
      <div className="booking-page" dir="rtl">
        <div className="booking-success-card">
          <div className="success-icon">✅</div>
          <h2>تم استلام طلب الحجز بنجاح!</h2>
          <p>
            سيتواصل معك فريق استديو آيرس قريباً لتأكيد الموعد وتأكيد العربون.
          </p>
          <button className="bk-btn-primary" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  const stepsList = [
    'الباقة والموعد',
    'بيانات العميل',
    'الإضافات والتوصيل',
    'الدفع بالعربون',
    'التأكيد النهائي'
  ];

  return (
    <div className="booking-page" dir="rtl">
      {/* Page Header */}
      <div className="bk-header">
        <h1 className="bk-title">احجز جلستك</h1>
        <p className="bk-subtitle">مرحباً بك في IRIS Studio — اختر موعدك بخطوات بسيطة</p>
      </div>

      {/* Step Indicator */}
      <div className="bk-steps-indicator">
        {stepsList.map((lbl, i) => (
          <div key={i} className={`bk-step-dot ${step === i + 1 ? 'active' : step > i + 1 ? 'done' : ''}`}>
            <span className="dot-num">{step > i + 1 ? '✓' : i + 1}</span>
            <span className="dot-lbl">{lbl}</span>
          </div>
        ))}
      </div>

      <div className="booking-wizard-content">

        {/* ════════ STEP 1: Package + Date + Time ════════ */}
        {step === 1 && (
          <div className="bk-section fade-in">
            <h2 className="bk-section-title">الخطوة 1: اختيار الباقة والموعد</h2>
            
            {/* Packages Grid */}
            <motion.div
              className="pkg-grid"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {(dbPackages.length > 0 ? dbPackages : DEFAULT_PACKAGES).map((pkg) => (
                <motion.div
                  key={pkg.name}
                  className={`pkg-card ${selectedPackage?.name === pkg.name ? 'selected' : ''}`}
                  variants={cardVariant}
                  onClick={() => setSelectedPackage(pkg)}
                >
                  <div className="pkg-name">{pkg.name}</div>
                  <div className="pkg-price">{pkg.price} JOD</div>
                  <div className="pkg-duration" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    <span>{pkg.label}</span>
                  </div>
                  {selectedPackage?.name === pkg.name && (
                    <div className="pkg-check">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>

            {/* Custom Airbnb-style Calendar */}
            <div className="calendar-picker-section">
              <h3 className="cal-section-title">اختر تاريخ الجلسة</h3>
              <CustomCalendar 
                value={selectedDate} 
                onChange={setSelectedDate} 
                existingBookings={existingBookings}
                selectedPackage={selectedPackage}
              />
              {selectedDate && (
                <div className="selected-date-display">
                  التاريخ المختار: <strong>{selectedDate}</strong>
                </div>
              )}
            </div>

            {/* Time slots */}
            {selectedPackage && selectedDate && (
              <div className="slots-section">
                <h3 className="slots-title">المواعيد المتاحة ليوم {selectedDate}</h3>
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
                  <p className="no-slots">لا توجد مواعيد متاحة لهذه الباقة في اليوم المحدد. الرجاء اختيار يوم آخر.</p>
                )}
              </div>
            )}

            <div className="bk-nav-row" style={{ marginTop: '24px' }}>
              <button
                className="bk-btn-primary"
                style={{ marginRight: 'auto' }}
                disabled={!selectedPackage || !selectedDate || !selectedTime}
                onClick={handleNextStep1}
              >
                التالي: إدخال بياناتك ←
              </button>
            </div>
          </div>
        )}

        {/* ════════ STEP 2: Customer Information ════════ */}
        {step === 2 && (
          <div className="bk-section fade-in">
            <h2 className="bk-section-title">الخطوة 2: معلومات العميل</h2>
            
            <div className="bk-fields-group">
              <div className="bk-field">
                <label className="bk-label">الاسم الكامل *</label>
                <input
                  type="text"
                  className="bk-input"
                  placeholder="أدخل اسمك الكامل ليطبع على الفاتورة"
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
                  عدد المرافقين بالجلسة
                  <span className="bk-hint">(حتى 5 مجاناً، بعدها 2 JOD لكل شخص إضافي)</span>
                </label>
                <div className="qty-control" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <button type="button" className="qty-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setCompanions((c) => Math.max(0, c - 1))}><Minus size={14} /></button>
                  <span className="qty-val">{companions}</span>
                  <button type="button" className="qty-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setCompanions((c) => c + 1)}><Plus size={14} /></button>
                </div>
                {extraCompanions > 0 && (
                  <p className="bk-hint-cost">
                    {extraCompanions} مرافق إضافي × 2 JOD = <strong>{extraCompanionsCost} JOD</strong>
                  </p>
                )}
              </div>
              <div className="bk-field">
                <label className="bk-label">ملاحظات وطلبات خاصة</label>
                <textarea
                  className="bk-input bk-textarea"
                  placeholder="أدخل أي ملاحظات ترغب في إبلاغ الاستوديو بها..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="bk-nav-row">
              <button className="bk-btn-outline" onClick={() => setStep(1)}>السابق</button>
              <button
                className="bk-btn-primary"
                disabled={!name.trim() || !phone.trim()}
                onClick={handleNextStep2}
              >
                التالي: الإضافات والتوصيل ←
              </button>
            </div>
          </div>
        )}

        {/* ════════ STEP 3: Add-ons & Delivery ════════ */}
        {step === 3 && (
          <div className="bk-section fade-in">
            <h2 className="bk-section-title">الخطوة 3: الإضافات وخيار التوصيل</h2>

            {/* Compact grid for add-ons (2 columns on mobile) */}
            <div className="extras-section">
              <h3 className="extras-title">المطبوعات والإضافات الاختيارية</h3>
              <motion.div
                className="compact-extras-grid"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {extras.map((e) => (
                  <motion.div key={e.id} className={`compact-extra-card ${e.qty > 0 ? 'selected-extra' : ''}`} variants={cardVariant}>
                    <div className="extra-info-block">
                      <div className="extra-icon-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(111,36,119,0.06)', borderRadius: '50%', width: '32px', height: '32px' }}>
                        <Plus size={14} style={{ color: 'var(--bk-purple)' }} />
                      </div>
                      <div>
                        <div className="extra-name">{e.name}</div>
                        <div className="extra-price">{e.price} JOD</div>
                      </div>
                    </div>
                    <div className="qty-control small-qty" style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <button type="button" className="qty-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => updateExtraQty(e.id, -1)}><Minus size={12} /></button>
                      <span className="qty-val">{e.qty}</span>
                      <button type="button" className="qty-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => updateExtraQty(e.id, +1)}><Plus size={12} /></button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Delivery Details */}
            <div className="delivery-card-section" style={{ marginTop: '30px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '24px' }}>
              <h3 className="extras-title">طريقة الاستلام</h3>
              <div className="delivery-cards-grid">
                <div
                  className={`delivery-card ${!deliverySelected ? 'selected' : ''}`}
                  onClick={() => setDeliverySelected(false)}
                >
                  <div className="delivery-card-icon">
                    <Store size={32} strokeWidth={1.5} />
                  </div>
                  <div className="delivery-card-title">الاستلام شخصياً من الاستوديو</div>
                  <div className="delivery-card-desc">مجاناً — إربد، مجمع الخضر</div>
                </div>
                <div
                  className={`delivery-card ${deliverySelected ? 'selected' : ''}`}
                  onClick={() => setDeliverySelected(true)}
                >
                  <div className="delivery-card-icon">
                    <Truck size={32} strokeWidth={1.5} />
                  </div>
                  <div className="delivery-card-title">توصيل المطبوعات للمنزل</div>
                  <div className="delivery-card-desc">+2 JOD لجميع المحافظات</div>
                </div>
              </div>

              {deliverySelected && (
                <div className="delivery-info-group fade-in">
                  <div className="bk-field">
                    <label className="bk-label">عنوان التوصيل بالتفصيل *</label>
                    <textarea
                      className="bk-input bk-textarea"
                      style={{ minHeight: '80px' }}
                      placeholder="المحافظة، اسم المنطقة، اسم الشارع وأقرب معلم للمكان..."
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                    />
                  </div>
                  <div className="bk-field" style={{ marginTop: '12px' }}>
                    <label className="bk-label">رقم هاتف بديل (اختياري)</label>
                    <input
                      type="tel"
                      className="bk-input"
                      placeholder="رقم هاتف آخر في حال عدم الرد..."
                      value={alternativePhone}
                      onChange={(e) => setAlternativePhone(e.target.value)}
                    />
                  </div>
                  <div className="bk-field" style={{ marginTop: '12px' }}>
                    <label className="bk-label">رابط موقع خرائط جوجل (اختياري)</label>
                    <input
                      type="text"
                      className="bk-input"
                      placeholder="https://maps.google.com/..."
                      value={googleMapsLink}
                      onChange={(e) => setGoogleMapsLink(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bk-nav-row" style={{ marginTop: '24px' }}>
              <button className="bk-btn-outline" onClick={() => setStep(2)}>السابق</button>
              <button
                className="bk-btn-primary"
                disabled={deliverySelected && !deliveryAddress.trim()}
                onClick={handleNextStep3}
              >
                التالي: الدفع ←
              </button>
            </div>
          </div>
        )}

        {/* ════════ STEP 4: Payment Page ════════ */}
        {step === 4 && (
          <div className="bk-section fade-in">
            <h2 className="bk-section-title">الخطوة 4: دفع قيمة العربون</h2>
            
            <div className="deposit-payment-screen">
              <div className="payment-receipt-summary">
                <div className="payment-row">
                  <span>قيمة العربون المطلوبة:</span>
                  <strong>{DEPOSIT} JOD</strong>
                </div>
                <div className="payment-row total-pay">
                  <span>إجمالي الحجز الكلي:</span>
                  <strong>{subtotal} JOD</strong>
                </div>
              </div>

              {/* Payment Info */}
              <div className="payment-details-box">
                <p>الرجاء تحويل قيمة العربون (10 JOD) عبر إحدى الطرق التالية:</p>
                <div className="payment-methods-grid">
                  <div className="pay-method-card cliq">
                    <div className="method-title">CliQ</div>
                    <div className="method-alias">iris0</div>
                    <div className="method-recipient">الاسم: Hamzah Bani Domi</div>
                  </div>
                  <div className="pay-method-card orange-money">
                    <div className="method-title">Orange Money</div>
                    <div className="method-alias">{settings.whatsapp_number ? `0${settings.whatsapp_number.slice(-9)}` : '0797303260'}</div>
                    <div className="method-recipient">الاسم: Hamzah Bani Domi</div>
                  </div>
                </div>
              </div>

              {/* Receipt upload */}
              <div className="screenshot-upload-wrapper" style={{ marginTop: '24px' }}>
                <label className="receipt-upload-label" htmlFor="receipt-upload" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <Paperclip size={18} />
                  <span>{receiptName ? receiptName : 'إرفاق صورة لقطة شاشة التحويل *'}</span>
                </label>
                <input
                  id="receipt-upload"
                  type="file"
                  accept="image/*"
                  className="receipt-input"
                  onChange={handleReceiptUpload}
                  style={{ display: 'none' }}
                />
                
                {receiptPreview && (
                  <div className="receipt-preview-container">
                    <img src={receiptPreview} alt="لقطة شاشة التحويل" className="receipt-preview-img" />
                  </div>
                )}
              </div>
            </div>

            <div className="bk-nav-row" style={{ marginTop: '24px' }}>
              <button className="bk-btn-outline" onClick={() => setStep(3)}>السابق</button>
              <button
                className="bk-btn-primary"
                disabled={!receiptFile}
                onClick={handleNextStep4}
              >
                التالي: مراجعة الطلب والتأكيد ←
              </button>
            </div>
          </div>
        )}

        {/* ════════ STEP 5: Review & Confirmation ════════ */}
        {step === 5 && (
          <div className="bk-section fade-in">
            <h2 className="bk-section-title">الخطوة 5: تأكيد الحجز</h2>

            <div className="compact-confirmation-card">
              <div className="conf-summary-header">
                <h3>إيصال طلب الحجز</h3>
                <span>استديو آيرس</span>
              </div>

              <div className="conf-details-body">
                <div className="conf-row">
                  <span>اسم العميل:</span>
                  <strong>{name}</strong>
                </div>
                <div className="conf-row">
                  <span>الباقة المختارة:</span>
                  <strong>{selectedPackage?.name}</strong>
                </div>
                <div className="conf-row">
                  <span>تاريخ الجلسة:</span>
                  <strong>{selectedDate}</strong>
                </div>
                <div className="conf-row">
                  <span>وقت الجلسة:</span>
                  <strong>{formatTime12(selectedTime)}</strong>
                </div>

                {extras.some((e) => e.qty > 0) && (
                  <div className="conf-row-addons">
                    <span className="addons-title-label">الإضافات المحددة:</span>
                    <div className="addons-list-items">
                      {extras.filter((e) => e.qty > 0).map((e) => (
                        <div key={e.id} className="addon-item-sub">
                          - {e.name} ({e.qty})
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="conf-row total-amount" style={{ borderTop: '2px solid rgba(0,0,0,0.06)', paddingTop: '12px', marginTop: '12px' }}>
                  <span>المجموع النهائي:</span>
                  <strong>{subtotal} JOD</strong>
                </div>
                <div className="conf-row deposit-deduct">
                  <span>العربون المدفوع (مخصوم):</span>
                  <strong>- {DEPOSIT} JOD</strong>
                </div>
                <div className="conf-row amount-remaining">
                  <span>المبلغ المتبقي للجلسة:</span>
                  <strong>{remaining} JOD</strong>
                </div>
              </div>
            </div>

            <div className="bk-nav-row" style={{ marginTop: '24px' }}>
              <button className="bk-btn-outline" onClick={() => setStep(4)}>تعديل بيانات الدفع</button>
              <button
                className="bk-btn-success"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                onClick={submitBooking}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>جاري الحجز...</span>
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    <span>تأكيد الحجز النهائي</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Booking;