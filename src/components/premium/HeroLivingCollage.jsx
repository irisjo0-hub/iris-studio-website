import React, { useEffect, useRef, useState } from 'react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import irisLogo from '../../assets/iris_logo.png';
import '../../styles/hero-living-collage.css';

/**
 * IRIS HERO — LIVING LOGO
 * The logo is treated as part of the architecture of the hero,
 * not as a floating object. It is anchored into the lower edge
 * with a very subtle living/breathing motion.
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
      className={`iris-hero-lower-stage iris-living-logo-stage ${isPaused ? 'is-paused' : ''}`}
      aria-label={isRtl ? 'هوية آيرس المتحركة' : 'Living IRIS identity'}
    >
      <div className="living-logo-architecture" aria-hidden="true">
        <div className="living-logo-aura" />
        <div className="living-logo-frame">
          <span className="living-logo-corner living-logo-corner-tl" />
          <span className="living-logo-corner living-logo-corner-tr" />
          <span className="living-logo-corner living-logo-corner-bl" />
          <span className="living-logo-corner living-logo-corner-br" />
          <img src={irisLogo} alt="" className="living-logo-image" />
          <span className="living-logo-light" />
        </div>
        <div className="living-logo-line" />
        <div className="living-logo-caption">
          <span>IRIS</span>
          <i />
          <b>MEDIA · STUDIO · PRINT</b>
        </div>
      </div>
    </div>
  );
};

export default HeroLivingCollage;
