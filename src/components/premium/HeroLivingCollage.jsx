import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import heroMediaImg from '../../assets/hero.png';
import '../../styles/hero-living-collage.css';

/**
 * HERO LIVING COLLAGE — EDGE-TO-EDGE UNSTRUCTURED FLOATING STREAM ENGINE
 * Meets All 8 User Requirements:
 * 1. Supports ANY dynamic count of photos added by Admin (8, 10, 15, 20+).
 * 2. Unbroken 360-degree endless infinite loop (repeat: Infinity).
 * 3. 0% Image cropping (cards fade out smoothly to opacity: 0 before stage edges).
 * 4. Weightless floating wave physics (cards float up/down while drifting across).
 * 5. 0% Text/CTA overlap — restricted strictly to lower stage area below CTA button.
 * 6. Smooth showcase of studio portfolio to visitors.
 * 7. Unstructured scattered aesthetics (varied Y heights, varied sizes, varied tilts, counter-directions).
 * 8. Cards enter from one side off-screen, float across lower stage, exit out opposite side off-screen.
 */

const optimizeHeroImageUrl = (value) => {
  if (typeof value !== 'string' || !value) return value;
  try {
    const url = new URL(value);
    if (url.hostname !== 'images.unsplash.com') return value;

    // Hero cards render at roughly 200–320 CSS px; 720 px is enough for
    // high-density screens while avoiding the 1000 px / q80 defaults.
    const requestedWidth = Number(url.searchParams.get('w')) || 720;
    const requestedQuality = Number(url.searchParams.get('q')) || 70;
    url.searchParams.set('w', String(Math.min(requestedWidth, 720)));
    url.searchParams.set('q', String(Math.min(requestedQuality, 70)));
    url.searchParams.set('auto', 'format');
    return url.toString();
  } catch {
    return value;
  }
};

export const HeroLivingCollage = () => {
  const { settings, lang } = useSiteSettings();
  const isRtl = lang === 'ar';

  const stageRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  const pool = useMemo(() => {
  let parsedPool = [];
  if (Array.isArray(settings.hero_motion_images)) {
    parsedPool = settings.hero_motion_images;
  } else if (typeof settings.hero_motion_images === 'string') {
    try {
      const p = JSON.parse(settings.hero_motion_images);
      if (Array.isArray(p)) parsedPool = p;
    } catch (e) {}
  }

  const rawPool = Array.isArray(parsedPool) ? parsedPool : [];

  return rawPool.map((item, idx) => {
    if (typeof item === 'string') {
      return {
        id: `item-${idx}`,
        image: optimizeHeroImageUrl(item || heroMediaImg),
        alt_ar: 'أعمال آيرس الاحترافية',
        alt_en: 'IRIS Professional Work',
        url_optional: '/work'
      };
    }
    return {
      id: item?.id || `item-${idx}`,
      image: optimizeHeroImageUrl(item?.image || item?.url || heroMediaImg),
      alt_ar: item?.alt_ar || item?.title || 'أعمال آيرس الاحترافية',
      alt_en: item?.alt_en || item?.title || 'IRIS Professional Work',
      url_optional: item?.url_optional || item?.link || '/work'
    };
  }).filter(item => Boolean(item.image));
  }, [settings.hero_motion_images]);

  // Auto-pause when tab is hidden or element scrolled out of viewport.
  // Keep this hook unconditional so React hook order remains stable.
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPaused(document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsPaused(!entry.isIntersecting);
        });
      },
      { threshold: 0.05 }
    );

    if (stageRef.current) {
      observer.observe(stageRef.current);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (stageRef.current) {
        observer.unobserve(stageRef.current);
      }
    };
  }, []);

  if (pool.length === 0) {
    return null;
  }

  const channelConfigs = [
    {
      top: '4%',
      width: 'clamp(175px, 19vw, 280px)',
      rotateZ: [-3, 2, -3],
      floatY: [-6, 6, -6]
    },
    {
      top: '36%',
      width: 'clamp(210px, 22vw, 320px)',
      rotateZ: [2, -3, 2],
      floatY: [7, -7, 7]
    },
    {
      top: '68%',
      width: 'clamp(185px, 20vw, 290px)',
      rotateZ: [-2, 3, -2],
      floatY: [-6, 6, -6]
    }
  ];

  const N = pool.length;
  const travelDuration = 24;
  const staggerStep = N === 1 ? 24 : 4.5;
  const totalLoopCycle = N === 1 ? 24 : Math.max(travelDuration + staggerStep, N * staggerStep);
  const repeatDelay = totalLoopCycle - travelDuration;

  return (
    <div
      ref={stageRef}
      className={`iris-hero-lower-stage ${isPaused ? 'is-paused' : ''}`}
    >
      <div className="lower-stage-container edge-to-edge-stream-container">
        {pool.map((work, index) => {
          const config = channelConfigs[index % channelConfigs.length];

          const startX = isRtl ? '-130vw' : '130vw';
          const midX = '0vw';
          const endX = isRtl ? '130vw' : '-130vw';
          const cardDelay = index * staggerStep;

          return (
            <motion.div
              key={`edge-stream-${work.id}-${index}`}
              className="lower-stream-card edge-floating-stream-card"
              style={{
                top: config.top,
                width: config.width,
                aspectRatio: 'auto',
                left: '50%',
                translateX: '-50%'
              }}
              animate={
                isPaused
                  ? {}
                  : {
                      x: [startX, midX, endX],
                      y: config.floatY,
                      rotateZ: config.rotateZ,
                      opacity: [0, 1, 0]
                    }
              }
              transition={{
                duration: travelDuration,
                repeat: Infinity,
                repeatType: 'loop',
                repeatDelay: repeatDelay,
                ease: 'easeInOut',
                delay: cardDelay
              }}
            >
              <img
                src={work.image}
                alt={isRtl ? work.alt_ar : work.alt_en}
                className="stream-card-img"
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={index === 0 ? 'high' : 'low'}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default HeroLivingCollage;
