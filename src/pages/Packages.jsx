import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import Lightbox from '../components/Lightbox';
import { Check, Loader2 } from 'lucide-react';
import '../styles/packages.css';
import placeholderImg from '../assets/hero.png'; // fallback image

const fadeInUp = {
  hidden: { opacity: 0, y: 40, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};
const cardVariant = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const Packages = () => {
  const [lightboxImg, setLightboxImg] = useState(null);
  const [packagesList, setPackagesList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .eq('is_hidden', false)
          .order('sort_order', { ascending: true });
        if (error) throw error;
        if (data) setPackagesList(data);
      } catch (e) {
        console.error('Failed to load packages from Supabase', e);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const shootPackages = packagesList.filter(p => p.category === 'shoot' || !p.category);
  const gradPackages = packagesList.filter(p => p.category === 'graduation');

  return (
    <main className="packages-page" dir="rtl">
      {/* Shoot Packages Section */}
      <section className="packages-section">
        <motion.div
          className="packages-header"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <span className="packages-kicker">IRIS Shoot</span>
          <h1 className="section-title">باقات جلسات التصوير</h1>
          <p>
            اختار الباقة الأنسب لجلستك، واضغط على الصورة لمعاينتها بالحجم الكامل.
          </p>
        </motion.div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', gap: '12px', color: 'var(--color-purple)' }}>
            <Loader2 className="animate-spin" size={24} />
            <span>جاري تحميل الباقات...</span>
          </div>
        ) : shootPackages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#777' }}>لا تتوفر باقات جلسات تصوير حالياً.</div>
        ) : (
          <motion.div
            className="packages-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {shootPackages.map((pkg) => {
              const features = Array.isArray(pkg.features) ? pkg.features : JSON.parse(pkg.features || '[]');
              const imgUrl = pkg.image_url || placeholderImg;
              return (
                <motion.article key={pkg.id} className="package-card" variants={cardVariant}>
                  <button
                    type="button"
                    className="package-image-btn"
                    onClick={() => setLightboxImg(imgUrl)}
                    aria-label={`عرض صورة ${pkg.title}`}
                  >
                    <img src={imgUrl} alt={pkg.title} className="package-img" />
                  </button>

                  <div className="package-info">
                    <h3 className="package-name">{pkg.title}</h3>
                    <p className="package-price">{pkg.price} JOD</p>
                    <div className="package-details" style={{ margin: '10px 0' }}>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {features.map((feat, idx) => (
                          <li key={idx} style={{ fontSize: '0.9rem', color: '#555', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Check size={14} style={{ color: 'var(--color-green)', flexShrink: 0 }} />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Link to={`/booking?package=${encodeURIComponent(pkg.title)}`} className="book-btn" style={{ marginTop: 'auto' }}>
                      احجز هذه الباقة
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </section>

      {/* Graduation Packages Section */}
      <section className="packages-section" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        <motion.div
          className="packages-header"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <span className="packages-kicker">IRIS Graduation</span>
          <h2 className="section-title">باقات دفاتر التخرج</h2>
          <p>
            تصفح باقات دفاتر التخرج المتاحة واطلب دفتر تخرجك الآن.
          </p>
        </motion.div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', gap: '12px', color: 'var(--color-purple)' }}>
            <Loader2 className="animate-spin" size={24} />
            <span>جاري تحميل الباقات...</span>
          </div>
        ) : gradPackages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#777' }}>لا تتوفر باقات دفاتر تخرج حالياً.</div>
        ) : (
          <motion.div
            className="packages-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {gradPackages.map((pkg) => {
              const features = Array.isArray(pkg.features) ? pkg.features : JSON.parse(pkg.features || '[]');
              const imgUrl = pkg.image_url || placeholderImg;
              return (
                <motion.article key={pkg.id} className="package-card" variants={cardVariant}>
                  <button
                    type="button"
                    className="package-image-btn"
                    onClick={() => setLightboxImg(imgUrl)}
                    aria-label={`عرض صورة ${pkg.title}`}
                  >
                    <img src={imgUrl} alt={pkg.title} className="package-img" />
                  </button>

                  <div className="package-info">
                    <h3 className="package-name">{pkg.title}</h3>
                    <p className="package-price">{pkg.price} JOD</p>
                    <div className="package-details" style={{ margin: '10px 0' }}>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {features.map((feat, idx) => (
                          <li key={idx} style={{ fontSize: '0.9rem', color: '#555', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Check size={14} style={{ color: 'var(--color-green)', flexShrink: 0 }} />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Link to={`/graduation-order?package=${pkg.id}`} className="book-btn" style={{ marginTop: 'auto' }}>
                      اطلب الباقة الآن
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </section>

      {lightboxImg && (
        <Lightbox
          src={lightboxImg}
          alt="Package"
          onClose={() => setLightboxImg(null)}
          onPrev={() => { }}
          onNext={() => { }}
        />
      )}
    </main>
  );
};

export default Packages;