import React, { useEffect, useRef, useState } from 'react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import irisLogo from '../../assets/iris_logo.png';
import '../../styles/hero-living-collage.css';

/**
 * IRIS HERO — LIVING LOGO
 * The IRIS mark becomes the visual hero object:
 * breathing, orbiting, glowing and receiving a subtle light sweep.
 * No remote assets are required.
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
      aria-label={isRtl ? 'شعار آيرس المتحرك' : 'IRIS living logo'}
    >
      <div className="living-logo-field" aria-hidden="true">
        <span className="living-logo-orbit living-logo-orbit-one" />
        <span className="living-logo-orbit living-logo-orbit-two" />
        <span className="living-logo-orbit living-logo-orbit-three" />

        <span className="living-logo-node living-logo-node-purple" />
        <span className="living-logo-node living-logo-node-green" />
        <span className="living-logo-node living-logo-node-gold" />

        <div className="living-logo-halo" />

        <div className="living-logo-mark">
          <span className="living-logo-ring" />
          <img src={irisLogo} alt="" className="living-logo-image" />
          <span className="living-logo-sweep" />
        </div>

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
