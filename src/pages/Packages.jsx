import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Lightbox from '../components/Lightbox';
import '../styles/packages.css';
import placeholderImg from '../assets/hero.png'; // fallback image

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
        <div className="packages-header">
          <span className="packages-kicker">IRIS Shoot</span>
          <h1 className="section-title">باقات جلسات التصوير</h1>
          <p>
            اختار الباقة الأنسب لجلستك، واضغط على الصورة لمعاينتها بالحجم الكامل.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>⏳ جاري تحميل الباقات...</div>
        ) : shootPackages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#777' }}>لا تتوفر باقات جلسات تصوير حالياً.</div>
        ) : (
          <div className="packages-grid">
            {shootPackages.map((pkg) => {
              const features = Array.isArray(pkg.features) ? pkg.features : JSON.parse(pkg.features || '[]');
              const imgUrl = pkg.image_url || placeholderImg;
              return (
                <article key={pkg.id} className="package-card">
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
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {features.map((feat, idx) => (
                          <li key={idx} style={{ fontSize: '0.9rem', color: '#555' }}>
                            ✓ {feat}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Link to={`/booking?package=${encodeURIComponent(pkg.title)}`} className="book-btn" style={{ marginTop: 'auto' }}>
                      احجز هذه الباقة
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Graduation Packages Section */}
      <section className="packages-section" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        <div className="packages-header">
          <span className="packages-kicker">IRIS Graduation</span>
          <h2 className="section-title">باقات دفاتر التخرج</h2>
          <p>
            تصفح باقات دفاتر التخرج المتاحة واطلب دفتر تخرجك الآن.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>⏳ جاري تحميل الباقات...</div>
        ) : gradPackages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#777' }}>لا تتوفر باقات دفاتر تخرج حالياً.</div>
        ) : (
          <div className="packages-grid">
            {gradPackages.map((pkg) => {
              const features = Array.isArray(pkg.features) ? pkg.features : JSON.parse(pkg.features || '[]');
              const imgUrl = pkg.image_url || placeholderImg;
              return (
                <article key={pkg.id} className="package-card">
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
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {features.map((feat, idx) => (
                          <li key={idx} style={{ fontSize: '0.9rem', color: '#555' }}>
                            ✓ {feat}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Link to={`/graduation-order?package=${pkg.id}`} className="book-btn" style={{ marginTop: 'auto' }}>
                      اطلب الباقة الآن
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
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