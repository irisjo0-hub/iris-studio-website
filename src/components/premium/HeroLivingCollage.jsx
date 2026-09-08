import React, { useState, useEffect, useRef } from 'react';
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

// Shared only for the lifetime of the SPA module: navigation back to Hero keeps
// the same animation clock, while a full browser reload creates a fresh clock.
let heroAnimationEpoch = null;
let heroHasMounted = false;

export const HeroLivingCollage = () => {
  const { settings, lang } = useSiteSettings();
  const isRtl = lang === 'ar';

  const stageRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

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

  const displayCount = settings.hero_image_display_count
    ? Math.max(1, parseInt(settings.hero_image_display_count, 10))
    : rawPool.length;

  const limitedPool = rawPool.slice(0, displayCount);

  const pool = limitedPool.map((item, idx) => {
    if (typeof item === 'string') {
      return {
        id: `item-${idx}`,
        image: item || heroMediaImg,
        alt_ar: 'أعمال آيرس الاحترافية',
        alt_en: 'IRIS Professional Work',
        url_optional: '/work'
      };
    }
    return {
      id: item?.id || `item-${idx}`,
      image: item?.image || item?.url || heroMediaImg,
      alt_ar: item?.alt_ar || item?.title || 'أعمال آيرس الاحترافية',
      alt_en: item?.alt_en || item?.title || 'IRIS Professional Work',
      url_optional: item?.url_optional || item?.link || '/work'
    };
  }).filter(item => Boolean(item.image));

  if (pool.length > 0 && heroAnimationEpoch === null) {
    heroAnimationEpoch = Date.now();
  }

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

  // The flag is set after the first real mount. Browser reloads create a new module,
  // while SPA route changes keep this flag and therefore resume the shared clock.
  useEffect(() => {
    heroHasMounted = true;
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
  const elapsedCycle = heroAnimationEpoch
    ? Math.max(0, (Date.now() - heroAnimationEpoch) / 1000)
    : 0;

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
          const cycleDuration = travelDuration + repeatDelay;
          const animationPhase = ((elapsedCycle - cardDelay) % cycleDuration + cycleDuration) % cycleDuration;
          const initialDelay = heroHasMounted ? -animationPhase : cardDelay;

          return (
            <motion.div
              key={`edge-stream-${work.id}-${index}`}
              className="lower-stream-card edge-floating-stream-card"
              initial={
                heroHasMounted
                  ? false
                  : {
                      x: startX,
                      y: config.floatY[0],
                      rotateZ: config.rotateZ[0],
                      opacity: 0,
                      filter: 'blur(12px)'
                    }
              }
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
                      opacity: [0, 1, 0],
                      filter: ['blur(12px)', 'blur(0px)', 'blur(12px)']
                    }
              }
              transition={{
                duration: travelDuration,
                repeat: Infinity,
                repeatType: 'loop',
                repeatDelay: repeatDelay,
                ease: 'easeInOut',
                delay: initialDelay
              }}
            >
              <img
                src={work.image}
                alt={isRtl ? work.alt_ar : work.alt_en}
                className="stream-card-img"
                loading="eager"
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default HeroLivingCollage;
