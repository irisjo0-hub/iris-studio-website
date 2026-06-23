import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import '../styles/work.css';

const Work = () => {
  const [items, setItems] = useState([]);
  const [lightbox, setLightbox] = useState(null); // index of open image

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data, error } = await supabase
          .from('portfolio_items')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (data) setItems(data);
      } catch (e) {
        console.error('Failed to fetch portfolio items:', e);
      }
    };
    fetchItems();
  }, []);

  // Keyboard navigation
  const handleKey = useCallback(
    (e) => {
      if (lightbox === null) return;
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowLeft')
        setLightbox((i) => (i + 1) % items.length);   // RTL: left = next
      if (e.key === 'ArrowRight')
        setLightbox((i) => (i - 1 + items.length) % items.length); // RTL: right = prev
    },
    [lightbox, items.length]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightbox !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightbox]);

  const prev = () => setLightbox((i) => (i - 1 + items.length) % items.length);
  const next = () => setLightbox((i) => (i + 1) % items.length);

  return (
    <main className="work-page" dir="rtl">
      <section className="work-hero">
        <h1>أعمالنا</h1>
        <p>معرض لأبرز أعمال التصوير والطباعة والتصاميم المنفذة في استديو آيرس.</p>
      </section>

      {items.length === 0 ? (
        <div className="work-empty">
          <span>🖼️</span>
          <h3>لا توجد أعمال مضافة بعد</h3>
          <p>يمكنك إضافة أعمال من لوحة التحكم.</p>
        </div>
      ) : (
        <div className="work-masonry">
          {items.map((it, idx) => (
            <div
              key={it.id}
              className="work-card"
              onClick={() => setLightbox(idx)}
              role="button"
              tabIndex={0}
              aria-label={`فتح صورة ${it.title}`}
              onKeyDown={(e) => e.key === 'Enter' && setLightbox(idx)}
            >
              <div className="work-card-img-wrap">
                <img src={it.image_url} alt={it.title} className="work-card-img" />
                <div className="work-card-overlay">
                  <span className="work-zoom-icon">🔍</span>
                </div>
              </div>
              <div className="work-card-info">
                <h3>{it.title}</h3>
                <span className="work-badge">{it.category}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---- Lightbox ---- */}
      {lightbox !== null && (
        <div
          className="lb-backdrop"
          onClick={(e) => e.target === e.currentTarget && setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="معاينة الصورة"
        >
          {/* Close */}
          <button className="lb-close" onClick={() => setLightbox(null)} aria-label="إغلاق">✕</button>

          {/* Counter */}
          <div className="lb-counter">
            {lightbox + 1} / {items.length}
          </div>

          {/* Image */}
          <div className="lb-img-wrap">
            <img
              src={items[lightbox].image_url}
              alt={items[lightbox].title}
              className="lb-img"
            />
          </div>

          {/* Info */}
          <div className="lb-info">
            <span className="lb-title">{items[lightbox].title}</span>
            <span className="lb-badge">{items[lightbox].category}</span>
          </div>

          {/* Navigation arrows */}
          {items.length > 1 && (
            <>
              <button className="lb-arrow lb-arrow-right" onClick={prev} aria-label="السابق">&#8250;</button>
              <button className="lb-arrow lb-arrow-left"  onClick={next} aria-label="التالي">&#8249;</button>
            </>
          )}
        </div>
      )}
    </main>
  );
};

export default Work;