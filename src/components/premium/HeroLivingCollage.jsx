import React, { useEffect, useRef, useState } from 'react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import '../../styles/hero-living-collage.css';

/**
 * IRIS HERO — THREE FLOATING FRAMES
 * Three abstract frames create depth without using portfolio imagery.
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
      className={`iris-hero-lower-stage iris-floating-frames-stage ${isPaused ? 'is-paused' : ''}`}
      aria-label={isRtl ? 'إطارات آيرس العائمة' : 'IRIS floating frames'}
    >
      <div className="floating-frames" aria-hidden="true">
        <div className="floating-frame floating-frame-left">
          <span className="floating-frame-inner" />
          <span className="floating-frame-mark">01</span>
        </div>

        <div className="floating-frame floating-frame-center">
          <span className="floating-frame-inner" />
          <span className="floating-frame-mark">IRIS</span>
        </div>

        <div className="floating-frame floating-frame-right">
          <span className="floating-frame-inner" />
          <span className="floating-frame-mark">03</span>
        </div>

        <span className="floating-frame-glow floating-frame-glow-purple" />
        <span className="floating-frame-glow floating-frame-glow-green" />
      </div>
    </div>
  );
};

export default HeroLivingCollage;
