import React, { useEffect, useRef, useState } from 'react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import '../../styles/hero-living-collage.css';

/**
 * IRIS HERO — THREE WORLDS / THREE OBJECTS
 * A visual system for the three IRIS divisions:
 * MEDIA / STUDIO / PRINT.
 * No portfolio image dependency: the hero remains visually complete immediately.
 */

const WORLDS = [
  {
    id: 'media',
    number: '01',
    label: 'MEDIA',
    title: 'Motion',
    accent: 'purple',
    glyph: '▶',
    detail: 'DIGITAL / CONTENT'
  },
  {
    id: 'studio',
    number: '02',
    label: 'STUDIO',
    title: 'Portrait',
    accent: 'green',
    glyph: '◉',
    detail: 'PHOTO / PEOPLE'
  },
  {
    id: 'print',
    number: '03',
    label: 'PRINT',
    title: 'Object',
    accent: 'gold',
    glyph: '▤',
    detail: 'PAPER / PRODUCT'
  }
];

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
      className={`iris-hero-lower-stage iris-three-worlds-stage ${isPaused ? 'is-paused' : ''}`}
      aria-label={isRtl ? 'عالم آيرس: ميديا، استوديو، وطباعة' : 'IRIS worlds: Media, Studio, and Print'}
    >
      <div className="three-worlds-orbit" aria-hidden="true">
        <span className="orbit orbit-one" />
        <span className="orbit orbit-two" />
        <span className="orbit orbit-three" />
      </div>

      <div className="three-worlds-container">
        {WORLDS.map((world, index) => (
          <div
            key={world.id}
            className={`iris-world-object iris-world-${world.accent}`}
            style={{ '--world-index': index }}
          >
            <div className="world-object-glow" />

            <div className="world-object-core">
              <span className="world-object-glyph">{world.glyph}</span>
              <span className="world-object-number">{world.number}</span>
            </div>

            <div className="world-object-meta">
              <span className="world-object-label">{world.label}</span>
              <span className="world-object-title">{world.title}</span>
            </div>

            <span className="world-object-detail">{world.detail}</span>
          </div>
        ))}
      </div>

      <div className="three-worlds-baseline" aria-hidden="true">
        <span>IRIS</span>
        <i />
        <span>CREATIVE ECOSYSTEM</span>
      </div>
    </div>
  );
};

export default HeroLivingCollage;
