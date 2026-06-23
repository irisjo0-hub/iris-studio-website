import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/graduation.css';

const GraduationBooks = () => {
  const [templates, setTemplates] = useState([]);
  const [lightbox, setLightbox] = useState(null); // { idx, list }

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data, error } = await supabase
          .from('template_items')
          .select('*')
          .order('created_at', { ascending: true });
        if (error) throw error;
        if (data) setTemplates(data);
      } catch {
        setTemplates([]);
      }
    };
    fetchTemplates();
  }, []);

  const covers = templates.filter(t => t.category === 'cover');
  const insides = templates.filter(t => t.category === 'inside');
  const dedications = templates.filter(t => t.category === 'dedication');

  const openLightbox = (tpl, list) => {
    const idx = list.indexOf(tpl);
    setLightbox({ idx, list });
  };
  const closeLightbox = () => setLightbox(null);

  const goNext = () => setLightbox(prev => ({ ...prev, idx: (prev.idx + 1) % prev.list.length }));
  const goPrev = () => setLightbox(prev => ({ ...prev, idx: (prev.idx - 1 + prev.list.length) % prev.list.length }));

  // Close on key
  useEffect(() => {
    const handler = (e) => {
      if (!lightbox) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goNext();
      if (e.key === 'ArrowRight') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox]);

  const getTemplateNumber = (tpl) => {
    const catTemplates = templates.filter(t => t.category === tpl.category);
    return catTemplates.indexOf(tpl) + 1;
  };

  const currentTpl = lightbox ? lightbox.list[lightbox.idx] : null;

  return (
    <main className="grad-page" dir="rtl">
      {/* Hero */}
      <section className="grad-hero">
        <div className="grad-hero-badge">🎓 IRIS Studio</div>
        <h1>دفاتر التخرج</h1>
        <p>
          احتفل بلحظة تخرجك بأسلوب مميز. استعرض قوالبنا واطلب دفتر تخرجك الآن.
        </p>
        <Link to="/graduation-order" className="grad-hero-btn">
          اطلب الآن ←
        </Link>
      </section>

      {/* Section A: Cover Templates */}
      <section className="grad-section" style={{ paddingBottom: 24, paddingTop: 48 }}>
        <h2 className="grad-section-title">قوالب الغلاف الخارجي</h2>
        <div className="grad-section-line" style={{ margin: '0 auto 32px' }} />

        {covers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 24px', color: '#7F8C8D', background: '#fff', borderRadius: 16 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🖼️</div>
            <h3 style={{ fontWeight: 800, color: '#2C3E50', marginBottom: 8 }}>لا توجد قوالب غلاف بعد</h3>
            <p>سيقوم الأدمن برفع القوالب قريباً.</p>
          </div>
        ) : (
          <div className="grad-gallery-grid">
            {covers.map((tpl) => (
              <div
                key={tpl.id}
                className="grad-gallery-item"
                onClick={() => openLightbox(tpl, covers)}
              >
                {tpl.image_url ? (
                  <img src={tpl.image_url} alt={tpl.title} className="grad-gallery-img" />
                ) : (
                  <div className="grad-gallery-img-placeholder">🖼️</div>
                )}
                <div className="grad-gallery-overlay">🔍</div>
                <div className="grad-gallery-label">{tpl.title || 'قالب غلاف'}</div>
                <div className="grad-gallery-num">غلاف رقم #{getTemplateNumber(tpl)}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section B: Inside Pages & Dedication Templates */}
      <section className="grad-section" style={{ paddingBottom: 48, paddingTop: 24 }}>
        <h2 className="grad-section-title">قوالب الورق الداخلي والإهداء</h2>
        <div className="grad-section-line" style={{ margin: '0 auto 32px' }} />

        {insides.length === 0 && dedications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 24px', color: '#7F8C8D', background: '#fff', borderRadius: 16 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📄</div>
            <h3 style={{ fontWeight: 800, color: '#2C3E50', marginBottom: 8 }}>لا توجد قوالب داخلية بعد</h3>
          </div>
        ) : (
          <>
            {insides.length > 0 && (
              <div style={{ marginBottom: 40 }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--iris-purple)', marginBottom: 20 }}>الورق الداخلي</h3>
                <div className="grad-gallery-grid">
                  {insides.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="grad-gallery-item"
                      onClick={() => openLightbox(tpl, insides)}
                    >
                      {tpl.image_url ? (
                        <img src={tpl.image_url} alt={tpl.title} className="grad-gallery-img" />
                      ) : (
                        <div className="grad-gallery-img-placeholder">🖼️</div>
                      )}
                      <div className="grad-gallery-overlay">🔍</div>
                      <div className="grad-gallery-label">{tpl.title || 'ورق داخلي'}</div>
                      <div className="grad-gallery-num">ورق داخلي رقم #{getTemplateNumber(tpl)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dedications.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--iris-purple)', marginBottom: 20 }}>ورق الإهداء</h3>
                <div className="grad-gallery-grid">
                  {dedications.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="grad-gallery-item"
                      onClick={() => openLightbox(tpl, dedications)}
                    >
                      {tpl.image_url ? (
                        <img src={tpl.image_url} alt={tpl.title} className="grad-gallery-img" />
                      ) : (
                        <div className="grad-gallery-img-placeholder">🖼️</div>
                      )}
                      <div className="grad-gallery-overlay">🔍</div>
                      <div className="grad-gallery-label">{tpl.title || 'ورق إهداء'}</div>
                      <div className="grad-gallery-num">إهداء رقم #{getTemplateNumber(tpl)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <div style={{ height: 64 }} />

      {/* Lightbox */}
      {currentTpl && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>✕</button>
            {currentTpl.image_url ? (
              <img src={currentTpl.image_url} alt={currentTpl.title} className="lightbox-img" />
            ) : (
              <div
                style={{
                  width: '100%',
                  maxWidth: 400,
                  aspectRatio: '3/4',
                  background: '#333',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '5rem',
                }}
              >
                🖼️
              </div>
            )}
            <div className="lightbox-caption">{currentTpl.title || 'قالب'}</div>
            <div className="lightbox-num">
              قالب رقم #{getTemplateNumber(currentTpl)} &nbsp;|&nbsp; {lightbox.idx + 1} / {lightbox.list.length}
            </div>
            {lightbox.list.length > 1 && (
              <div className="lightbox-nav">
                <button className="lightbox-nav-btn" onClick={goPrev} title="السابق">‹</button>
                <button className="lightbox-nav-btn" onClick={goNext} title="التالي">›</button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default GraduationBooks;