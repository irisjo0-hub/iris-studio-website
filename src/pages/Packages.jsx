import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Lightbox from '../components/Lightbox';
import '../styles/packages.css';
import heroImg from '../assets/hero.png';
import heroFeatureImg from '../assets/hero_feature.png';
import breakBoxImg from "../assets/we-break-the-box.png";

const packages = [
  {
    name: 'بكج 20',
    price: '20 JOD',
    duration: 'مدة: 25 دقيقة',
    details: 'تعديل 5 صور',
    img: heroImg,
  },
  {
    name: 'بكج 30',
    price: '30 JOD',
    duration: 'مدة: 50 دقيقة',
    details: 'تعديل 10 صور',
    img: heroFeatureImg,
  },
  {
    name: 'بكج 35',
    price: '35 JOD',
    duration: 'مدة: 50 دقيقة',
    details: 'تعديل 10 صور + دفتر تخرج',
    img: breakBoxImg,
  },
  {
    name: 'الأكثر طلباً',
    price: '40 JOD',
    duration: 'مدة: 50 دقيقة',
    details: 'تعديل 10 صور + دفتر تخرج + بوستر خشب قياس 30*42',
    img: heroImg,
  },
  {
    name: 'الفل بكج',
    price: '65 JOD',
    duration: 'مدة: 50 دقيقة',
    details: 'تعديل 10 صور + دفتر تخرج + بوستر خشب قياس 30*42 + وشاح وطاقية تطريز',
    img: heroFeatureImg,
  },
];

const Packages = () => {
  const [lightboxImg, setLightboxImg] = useState(null);
  const [uploadedPackages, setUploadedPackages] = useState([]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const { data, error } = await supabase
          .from('package_items')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (data) setUploadedPackages(data);
      } catch (e) {
        console.error('Failed to load packages from Supabase', e);
      }
    };
    fetchPackages();
  }, []);

  return (
    <main className="packages-page" dir="rtl">
      <section className="packages-section">
        <div className="packages-header">
          <span className="packages-kicker">IRIS Offers</span>
          <h1 className="section-title">البكجات والعروض</h1>
          <p>
            اختار الباقة الأنسب لجلسة التخرج، واضغط على الصورة لمعاينتها بالحجم الكامل.
          </p>
        </div>

        <div className="packages-grid">
          {packages.map((pkg, idx) => (
            <article key={idx} className="package-card">
              <button
                type="button"
                className="package-image-btn"
                onClick={() => setLightboxImg(pkg.img)}
                aria-label={`عرض صورة ${pkg.name}`}
              >
                <img src={pkg.img} alt={pkg.name} className="package-img" />
              </button>

              <div className="package-info">
                <h3 className="package-name">{pkg.name}</h3>
                <p className="package-price">{pkg.price}</p>
                <p className="package-duration">{pkg.duration}</p>
                <p className="package-details">{pkg.details}</p>
                <Link to={`/booking?package=${encodeURIComponent(pkg.name)}`} className="book-btn">
                  احجز هذه الباقة
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {uploadedPackages.length > 0 && (
        <section className="packages-section" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
          <div className="packages-header" style={{ marginBottom: '2rem' }}>
            <h2 className="section-title">صور البكجات والعروض</h2>
            <p style={{ textAlign: 'center' }}>مجموعة من البكجات والعروض الموسمية الإضافية للاستوديو.</p>
          </div>
          <div className="packages-grid">
            {uploadedPackages.map((pkg) => (
              <article key={pkg.id} className="package-card">
                <button type="button" className="package-image-btn" onClick={() => setLightboxImg(pkg.image_url)} aria-label={`عرض صورة ${pkg.title}`}>
                  <img src={pkg.image_url} alt={pkg.title} className="package-img" style={{ objectFit: 'cover' }} />
                </button>
                <div className="package-info">
                  <h3 className="package-name">{pkg.title}</h3>
                  <span style={{
                    display: 'inline-block',
                    alignSelf: 'flex-start',
                    padding: '0.35rem 0.8rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    backgroundColor: 'rgba(4, 70, 48, 0.1)',
                    color: 'var(--green, #044630)',
                    marginTop: '0.5rem'
                  }}>{pkg.type}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

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