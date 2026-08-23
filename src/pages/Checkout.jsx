import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, CheckCircle2, Truck, ArrowLeft, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { useSiteSettings } from '../context/SiteSettingsContext';
import '../styles/home.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, subtotal, clearCart } = useCart();
  const { lang } = useSiteSettings();
  const isRtl = lang === 'ar';

  const [form, setForm] = useState({
    name: '',
    phone: '',
    altPhone: '',
    governorate: 'عمان',
    address: '',
    googleMaps: '',
    deliveryNotes: '',
    receiptType: 'delivery' // 'delivery' | 'studio'
  });

  const [loading, setLoading] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(null);

  const deliveryFee = form.receiptType === 'delivery' ? 2.50 : 0;
  const grandTotal = subtotal + deliveryFee;

  const governorates = [
    'عمان', 'الزرقاء', 'إربد', 'البلقاء', 'العقبة', 'المفرق', 'جرش', 'مأدبا', 'عجلون', 'الكرك', 'الطفيلة', 'معان'
  ];

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      alert(isRtl ? 'يرجى تعبئة الاسم ورقم الهاتف' : 'Please fill name and phone');
      return;
    }

    if (cart.length === 0) {
      alert(isRtl ? 'السلة فارغة، يرجى إضافة منتجات للطلب' : 'Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      const orderId = `PRINT-${Math.floor(100000 + Math.random() * 900000)}`;
      const notesCombined = form.receiptType === 'delivery'
        ? `[طلب توصيل] العنوان: ${form.governorate} - ${form.address} | هاتف بديل: ${form.altPhone || 'لا يوجد'} | خرائط قوقل: ${form.googleMaps || 'لا يوجد'} | ملاحظات: ${form.deliveryNotes || 'لا يوجد'}`
        : `[استلام من الاستوديو] ملاحظات: ${form.deliveryNotes || 'لا يوجد'}`;

      const { data, error } = await supabase
        .from('printing_orders')
        .insert([
          {
            customer_name: form.name,
            phone: form.phone,
            product_name: cart.map(i => `${i.title || i.name} (${i.quantity}x)`).join(', '),
            quantity: cart.reduce((acc, i) => acc + i.quantity, 0),
            notes: notesCombined,
            status: 'pending',
            image_urls: JSON.stringify(cart.map(i => i.image || i.customImage).filter(Boolean))
          }
        ])
        .select();

      if (error) throw error;

      clearCart();
      setOrderConfirmed({
        id: orderId,
        name: form.name,
        phone: form.phone,
        total: grandTotal
      });
    } catch (err) {
      console.error('Failed to submit order:', err);
      alert(isRtl ? 'حدث خطأ أثناء تقديم الطلب: ' + err.message : 'Failed to place order: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="division-portal-page" dir={isRtl ? 'rtl' : 'ltr'}>
      <section className="portal-hero-banner theme-print-bg" style={{ padding: '60px 20px 30px' }}>
        <div className="portal-hero-container">
          <h1 className="portal-hero-title">
            {isRtl ? 'إنهاء طلب المطبوعات والتأكيد' : 'PRINT STORE CHECKOUT'}
          </h1>
          <p className="portal-hero-sub">
            {isRtl ? 'أدخل تفاصيل التوصيل لإتمام الطلب وتسليمه لفرع الطباعة.' : 'Enter your delivery details to complete your order.'}
          </p>
        </div>
      </section>

      <div className="portal-section">
        {orderConfirmed ? (
          <div className="portal-quote-container" style={{ textAlign: 'center', padding: '50px 24px' }}>
            <CheckCircle2 size={56} style={{ color: '#27AE60', margin: '0 auto 16px auto' }} />
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>تم تأكيد طلبك بنجاح!</h2>
            <p style={{ fontSize: '1.1rem', color: '#F5BD1A', fontWeight: 'bold' }}>رقم الطلب الخاص بك: #{orderConfirmed.id}</p>
            <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: 500, margin: '12px auto 24px auto' }}>
              شكراً لاختيارك آيرس! سيتواصل معك فريق الطباعة والتوصيل لتجهيز واستلام المطبوعات.
            </p>
            <button type="button" onClick={() => navigate('/print')} className="btn-portal-primary print-btn">
              العودة إلى متجر المطبوعات
            </button>
          </div>
        ) : (
          <div className="portal-quote-container" style={{ maxWidth: 950 }}>
            <form onSubmit={handleSubmitOrder} className="portal-quote-form">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px' }}>
                {/* Form Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#F5BD1A', margin: '0 0 10px' }}>
                    1. معلومات المستلم والتوصيل
                  </h3>

                  <div className="form-group">
                    <label className="as-label">طريقة الاستلام *</label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, receiptType: 'delivery' })}
                        className={`btn-portal-secondary ${form.receiptType === 'delivery' ? 'active-tab-btn' : ''}`}
                        style={{ flex: 1, padding: '10px' }}
                      >
                        🚚 توصيل للمنزل (+2.50 JOD)
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, receiptType: 'studio' })}
                        className={`btn-portal-secondary ${form.receiptType === 'studio' ? 'active-tab-btn' : ''}`}
                        style={{ flex: 1, padding: '10px' }}
                      >
                        🏬 استلام من الاستوديو (مجاناً)
                      </button>
                    </div>
                  </div>

                  <div className="form-group-row">
                    <div className="form-group">
                      <label className="as-label">الاسم الكامل *</label>
                      <input 
                        type="text" 
                        required 
                        value={form.name} 
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="مثال: أحمد المحاسنة" 
                        className="as-input" 
                      />
                    </div>
                    <div className="form-group">
                      <label className="as-label">رقم الهاتف الأساسي *</label>
                      <input 
                        type="tel" 
                        required 
                        value={form.phone} 
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="07XXXXXXXX" 
                        className="as-input" 
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {form.receiptType === 'delivery' && (
                    <>
                      <div className="form-group-row">
                        <div className="form-group">
                          <label className="as-label">المحافظة *</label>
                          <select 
                            value={form.governorate}
                            onChange={(e) => setForm({ ...form, governorate: e.target.value })}
                            className="as-input"
                          >
                            {governorates.map(g => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="as-label">رقم هاتف بديل (اختياري)</label>
                          <input 
                            type="tel" 
                            value={form.altPhone} 
                            onChange={(e) => setForm({ ...form, altPhone: e.target.value })}
                            placeholder="07XXXXXXXX" 
                            className="as-input" 
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="as-label">عنوان التوصيل التفصيلي *</label>
                        <input 
                          type="text" 
                          required
                          value={form.address} 
                          onChange={(e) => setForm({ ...form, address: e.target.value })}
                          placeholder="المدينة، الشارع، رقم البناية، الطابق..." 
                          className="as-input" 
                        />
                      </div>

                      <div className="form-group">
                        <label className="as-label">رابط الموقع على خرائط قوقل (Google Maps)</label>
                        <input 
                          type="url" 
                          value={form.googleMaps} 
                          onChange={(e) => setForm({ ...form, googleMaps: e.target.value })}
                          placeholder="https://maps.app.goo.gl/..." 
                          className="as-input" 
                          dir="ltr"
                        />
                      </div>
                    </>
                  )}

                  <div className="form-group">
                    <label className="as-label">ملاحظات وتعليمات إضافية للطلب</label>
                    <textarea 
                      rows={3}
                      value={form.deliveryNotes} 
                      onChange={(e) => setForm({ ...form, deliveryNotes: e.target.value })}
                      placeholder="أي ملاحظات حول التغليف، الألوان، أو أوقات التسليم المفضل..." 
                      className="as-input" 
                    />
                  </div>
                </div>

                {/* Order Summary Column */}
                <div style={{ background: 'rgba(18, 9, 17, 0.8)', border: '1px solid rgba(245, 189, 26, 0.3)', borderRadius: '18px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', height: 'fit-content' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                    ملخص الطلب ({cart.length} منتج)
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: 220, overflowY: 'auto' }}>
                    {cart.map((item) => (
                      <div key={item.cartId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: 8 }}>
                        <div>
                          <span style={{ fontWeight: 'bold', display: 'block' }}>{item.title || item.name}</span>
                          <span style={{ color: '#F5BD1A', fontSize: '0.78rem' }}>الكمية: {item.quantity}</span>
                        </div>
                        <span style={{ fontWeight: 'bold' }}>{(parseFloat(item.price || 0) * item.quantity).toFixed(2)} JOD</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid rgba(245, 189, 26, 0.3)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span>مجموع المنتجات:</span>
                      <span>{subtotal.toFixed(2)} JOD</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span>رسوم التوصيل:</span>
                      <span>{deliveryFee.toFixed(2)} JOD</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, color: '#F5BD1A', marginTop: 6 }}>
                      <span>الإجمالي الكلي:</span>
                      <span>{grandTotal.toFixed(2)} JOD</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-portal-primary print-btn btn-submit-full"
                    style={{ marginTop: 10 }}
                  >
                    {loading ? 'جاري التأكيد...' : 'تأكيد وإرسال الطلب 🚚'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
