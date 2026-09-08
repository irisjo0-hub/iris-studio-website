import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import heroMediaImg from '../../assets/hero.png';
import '../../styles/hero-living-collage.css';

export const HeroLivingCollage = () => {
  const navigate = useNavigate();
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
    } catch {
      parsedPool = [];
    }
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

  useEffect(() => {
    const handleVisibilityChange = () => setIsPaused(document.hidden);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => setIsPaused(!entry.isIntersecting)),
      { threshold: 0.05 }
    );

    if (stageRef.current) observer.observe(stageRef.current);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
    };
  }, []);

  const handleCardClick = (url) => {
    if (url) navigate(url);
  };

  if (pool.length === 0) return null;

  const channelConfigs = [
    { top: '4%', width: 'clamp(175px, 19vw, 280px)', rotateZ: [-3, 2, -3], floatY: [-6, 6, -6] },
    { top: '36%', width: 'clamp(210px, 22vw, 320px)', rotateZ: [2, -3, 2], floatY: [7, -7, 7] },
    { top: '68%', width: 'clamp(185px, 20vw, 290px)', rotateZ: [-2, 3, -2], floatY: [-6, 6, -6] }
  ];

  const N = pool.length;
  const travelDuration = 24;
  const staggerStep = N === 1 ? 24 : 4.5;
  const totalLoopCycle = N === 1 ? 24 : Math.max(travelDuration + staggerStep, N * staggerStep);
  const repeatDelay = totalLoopCycle - travelDuration;

  return (
    <div ref={stageRef} className={`iris-hero-lower-stage ${isPaused ? 'is-paused' : ''}`}>
      <div className="lower-stage-container edge-to-edge-stream-container">
        {pool.map((work, index) => {
          const config = channelConfigs[index % channelConfigs.length];
          const startX = isRtl ? '-130vw' : '130vw';
          const midX = '0vw';
          const endX = isRtl ? '130vw' : '-130vw';
          const cardDelay = index * staggerStep;
          const isInitialFrame = index < channelConfigs.length;

          return (
            <motion.div
              key={`edge-stream-${work.id}-${index}`}
              className="lower-stream-card edge-floating-stream-card"
              style={{
                top: config.top,
                width: config.width,
                aspectRatio: 'auto',
                left: '50%',
                transform: 'translateX(-50%)'
              }}
              initial={{ x: startX, y: 0, opacity: 0, filter: 'blur(12px)' }}
              animate={isPaused ? {} : {
                x: [startX, midX, endX],
                y: config.floatY,
                rotateZ: config.rotateZ,
                opacity: [0, 1, 0],
                filter: ['blur(12px)', 'blur(0px)', 'blur(12px)']
              }}
              transition={{
                duration: travelDuration,
                repeat: Infinity,
                repeatType: 'loop',
                repeatDelay,
                ease: 'easeInOut',
                delay: cardDelay
              }}
              whileHover={{ scale: 1.08, zIndex: 60, transition: { duration: 0.3 } }}
              onClick={() => handleCardClick(work.url_optional)}
            >
              <img
                src={work.image}
                alt={isRtl ? work.alt_ar : work.alt_en}
                className="stream-card-img"
                loading={isInitialFrame ? 'eager' : 'lazy'}
                fetchPriority={isInitialFrame ? 'high' : 'auto'}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default HeroLivingCollage;
