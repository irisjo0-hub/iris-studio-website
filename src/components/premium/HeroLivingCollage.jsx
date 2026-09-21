import React, { useEffect, useRef, useState } from 'react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import '../../styles/hero-living-collage.css';

/**
 * IRIS HERO — GIANT MOVING GRID
 * A large architectural grid plane that continuously travels beneath
 * the hero content. It uses CSS only: no image/network dependency.
 */

const GRID_CELLS = Array.from({ length: 84 }, (_, index) => index);

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
      className={`iris-hero-lower-stage iris-giant-grid-stage ${isPaused ? 'is-paused' : ''}`}
      aria-label={isRtl ? 'شبكة آيرس الإبداعية' : 'IRIS creative grid'}
    >
      <div className="giant-grid-fade" aria-hidden="true" />

      <div className="giant-grid-scene" aria-hidden="true">
        <div className="giant-grid-plane">
          <div className="giant-grid-cells">
            {GRID_CELLS.map((cell) => (
              <span key={cell} className="giant-grid-cell" />
            ))}
          </div>
        </div>
      </div>

      <div className="giant-grid-wordmark" aria-hidden="true">
        IRIS
      </div>

      <div className="giant-grid-label giant-grid-label-left" aria-hidden="true">
        <span>01</span>
        <b>MEDIA</b>
      </div>

      <div className="giant-grid-label giant-grid-label-right" aria-hidden="true">
        <span>02</span>
        <b>STUDIO</b>
      </div>

      <div className="giant-grid-label giant-grid-label-bottom" aria-hidden="true">
        <span>03</span>
        <b>PRINT</b>
        <i />
        <em>CREATIVE SYSTEM</em>
      </div>
    </div>
  );
};

export default HeroLivingCollage;
