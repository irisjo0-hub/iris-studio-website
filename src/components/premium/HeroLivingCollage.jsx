import React, { useEffect, useRef, useState } from 'react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import '../../styles/hero-living-collage.css';

/**
 * IRIS HERO — ABSTRACT IRIS SYSTEM
 * Three soft glass service cards rise from the visual core and settle above it.
 */

export const HeroLivingCollage = () => {
  const { lang } = useSiteSettings();
  const isRtl = lang === 'ar';
  const stageRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => setIsPaused(document.hidden);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const observer = new IntersectionObserver(
      ([entry]) => setIsPaused(!entry.isIntersecting),
      { threshold: 0.05 }
    );

    if (stageRef.current) observer.observe(stageRef.current);

    const revealTimer = window.setTimeout(() => setShowCards(true), 1900);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
      window.clearTimeout(revealTimer);
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className={'iris-hero-lower-stage iris-abstract-system-stage ' + (showCards ? 'cards-revealed ' : '') + (isPaused ? 'is-paused' : '')}
      aria-label={isRtl ? 'خدمات آيرس' : 'IRIS services'}
    >
      <div className="iris-abstract-system" aria-hidden="true">
        <span className="iris-system-ring iris-system-ring-outer" />
        <span className="iris-system-ring iris-system-ring-inner" />
        <div className="iris-system-shape iris-system-shape-one"><span /></div>
        <div className="iris-system-shape iris-system-shape-two"><span /></div>
        <div className="iris-system-shape iris-system-shape-three"><span /></div>
        <div className="iris-system-core"><i /></div>
        <span className="iris-system-dot iris-system-dot-purple" />
        <span className="iris-system-dot iris-system-dot-green" />
        <span className="iris-system-dot iris-system-dot-gold" />
      </div>

      <div className="iris-service-cards">
        <div className="iris-service-card iris-service-card-media">
          <span className="iris-service-card-index">01</span>
          <span className="iris-service-card-icon">✦</span>
          <strong>{isRtl ? 'ميديا' : 'MEDIA'}</strong>
          <small>{isRtl ? 'تصوير · محتوى · تسويق' : 'Content · Visuals · Marketing'}</small>
        </div>
        <div className="iris-service-card iris-service-card-studio">
          <span className="iris-service-card-index">02</span>
          <span className="iris-service-card-icon">◉</span>
          <strong>{isRtl ? 'استديو' : 'STUDIO'}</strong>
          <small>{isRtl ? 'تصوير · إنتاج · جلسات' : 'Photography · Production · Sessions'}</small>
        </div>
        <div className="iris-service-card iris-service-card-print">
          <span className="iris-service-card-index">03</span>
          <span className="iris-service-card-icon">□</span>
          <strong>{isRtl ? 'طباعة' : 'PRINT'}</strong>
          <small>{isRtl ? 'طباعة · هدايا · تنفيذ' : 'Print · Gifts · Production'}</small>
        </div>
      </div>
    </div>
  );
};

export default HeroLivingCollage;
