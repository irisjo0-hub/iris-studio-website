import React, { useEffect, useRef, useState } from 'react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import '../../styles/hero-living-collage.css';

/**
 * IRIS HERO — ABSTRACT IRIS SYSTEM
 * Three asymmetric forms break the box and orbit a shared visual center.
 */

export const HeroLivingCollage = () => {
  const { lang } = useSiteSettings();
  const isRtl = lang === 'ar';
  const stageRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => setIsPaused(document.hidden);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const observer = new IntersectionObserver(
      ([entry]) => setIsPaused(!entry.isIntersecting),
      { threshold: 0.05 }
    );

    if (stageRef.current) observer.observe(stageRef.current);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className={`iris-hero-lower-stage iris-abstract-system-stage ${isPaused ? 'is-paused' : ''}`}
      aria-label={isRtl ? 'نظام آيرس البصري' : 'IRIS visual system'}
    >
      <div className="iris-abstract-system" aria-hidden="true">
        <span className="iris-system-ring iris-system-ring-outer" />
        <span className="iris-system-ring iris-system-ring-inner" />

        <div className="iris-system-shape iris-system-shape-one">
          <span />
        </div>

        <div className="iris-system-shape iris-system-shape-two">
          <span />
        </div>

        <div className="iris-system-shape iris-system-shape-three">
          <span />
        </div>

        <div className="iris-system-core">
          <i />
        </div>

        <span className="iris-system-dot iris-system-dot-purple" />
        <span className="iris-system-dot iris-system-dot-green" />
        <span className="iris-system-dot iris-system-dot-gold" />
      </div>
    </div>
  );
};

export default HeroLivingCollage;
