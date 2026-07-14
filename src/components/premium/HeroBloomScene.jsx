import React, { useEffect, useRef, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import irisLogo from "../../assets/iris_logo.png";
import heroMobileVideo from "../../assets/Hero.mp4";
import heroDesktopVideo from "../../assets/Hero Desktop.mp4";

gsap.registerPlugin(ScrollTrigger);

const HeroBloomScene = () => {
  const containerRef = useRef(null);
  const pinRef = useRef(null);
  const videoRef = useRef(null);
  const nextPanelRef = useRef(null);

  // Refs for brand reveal timeline elements
  const logoRef = useRef(null);
  const link1Ref = useRef(null);
  const link2Ref = useRef(null);
  const link3Ref = useRef(null);
  const link4Ref = useRef(null);
  const link5Ref = useRef(null);
  const link6Ref = useRef(null);
  const link7Ref = useRef(null);
  const sloganRef = useRef(null);
  const buttonsRef = useRef(null);
  const glowOverlayRef = useRef(null);

  // Store scroll progress without causing re-renders
  const progressRef = useRef(0);
  const { settings } = useSiteSettings();

  const getDesktopVideo = () => settings.hero_desktop_video_url || heroDesktopVideo;
  const getMobileVideo = () => settings.hero_mobile_video_url || heroMobileVideo;

  const [videoSrc, setVideoSrc] = useState(
    window.innerWidth >= 1024 ? getDesktopVideo() : getMobileVideo()
  );
  const [metadataLoaded, setMetadataLoaded] = useState(false);

  // Listen to resize events and dynamically swap sources
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      const targetSrc = isDesktop ? getDesktopVideo() : getMobileVideo();
      if (videoSrc !== targetSrc) {
        const video = videoRef.current;
        if (video) {
          let currentProgress = 0;
          if (video.duration) {
            currentProgress = video.currentTime / video.duration;
          }
          video.dataset.savedProgress = currentProgress.toString();
        }
        setMetadataLoaded(false);
        setVideoSrc(targetSrc);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [videoSrc, settings]);

  // Sync with settings updates
  useEffect(() => {
    const isDesktop = window.innerWidth >= 1024;
    const targetSrc = isDesktop ? getDesktopVideo() : getMobileVideo();
    setVideoSrc(targetSrc);
  }, [settings]);

  // Mount effect to check if video metadata is already cached/loaded
  useEffect(() => {
    if (videoRef.current && videoRef.current.readyState >= 1) {
      setMetadataLoaded(true);
    }
  }, [videoSrc]);

  // Sync scroll lock with video loading state to prevent early scrolling
  useEffect(() => {
    if (metadataLoaded) {
      document.body.classList.remove("scroll-lock");
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        ScrollTrigger.refresh();
      });
    } else {
      document.body.classList.add("scroll-lock");
    }
    return () => {
      document.body.classList.remove("scroll-lock");
    };
  }, [metadataLoaded]);

  const handleVideoMetadata = () => {
    if (videoRef.current) {
      // Restore playback progress ratio if any was saved
      const savedRatio = parseFloat(videoRef.current.dataset.savedProgress || "0");
      if (savedRatio > 0 && videoRef.current.duration) {
        videoRef.current.currentTime = savedRatio * videoRef.current.duration;
        videoRef.current.dataset.savedProgress = "0"; // reset
      } else {
        videoRef.current.currentTime = 0;
      }
      videoRef.current.pause();
      setMetadataLoaded(true);
    }
  };
  // Helper to clean up before navigation
  const handleNav = () => {
    if (videoRef.current) videoRef.current.pause();
    document.body.classList.remove('scroll-lock');
    ScrollTrigger.getAll().forEach(trigger => trigger.kill(true));
    ScrollTrigger.clearScrollMemory();
  };
  useEffect(() => {
    if (!metadataLoaded) return;

    const video = videoRef.current;
    const nextPanel = nextPanelRef.current;
    const container = containerRef.current;

    // Timeline elements
    const logo = logoRef.current;
    const link1 = link1Ref.current;
    const link2 = link2Ref.current;
    const link3 = link3Ref.current;
    const link4 = link4Ref.current;
    const link5 = link5Ref.current;
    const link6 = link6Ref.current;
    const link7 = link7Ref.current;
    const slogan = sloganRef.current;
    const buttons = buttonsRef.current;
    const glowOverlay = glowOverlayRef.current;

    if (!video || !nextPanel || !container) return;

    let active = true;
    let scrollTimeline = null;
    let rafId = null;
    let initRafId = null;

    const initTimeline = () => {
      if (!active) return;
      if (!video.duration || isNaN(video.duration) || video.duration < 0.1) {
        initRafId = requestAnimationFrame(initTimeline);
        return;
      }

      // Sibling elements to hide/reveal dynamically
      const whitePage = document.querySelector(".white-content-page");
      const footer = document.querySelector(".footer, footer");
      const navbar = document.querySelector(".navbar");

      // Hide old navbar initially
      if (navbar) {
        gsap.set(navbar, { display: "none", opacity: 0 });
      }

      video.pause();
      const targetTimeRef = { current: 0 };

      // Shared UI update function for initial load and scrolling
      const updateUI = (progress) => {
        progressRef.current = progress;
        if (video.duration) {
          const maxTime = video.duration - 0.05;
          // Scale progress so the flower reaches full bloom at 0.72 progress (at "عروضنا") and remains open
          const videoProgress = Math.min(1, progress / 0.72);
          targetTimeRef.current = videoProgress * Math.max(0, maxTime);
        }

        const isDesktop = window.innerWidth >= 1024;
        const centerX = isDesktop ? 240 : 105;
        const centerY = isDesktop ? 190 : 95;
        const radiusX = isDesktop ? 200 : 0;
        const radiusY = isDesktop ? 100 : 55;
        const depthZ = isDesktop ? 200 : 120;
        const numberOfItems = 7;
        const navStart = 0.12;
        const holdEnd = 0.22;
        const navEnd = 0.80;

        let navProgress = 0;
        if (progress > holdEnd) {
          navProgress = (progress - holdEnd) / (navEnd - holdEnd);
        }
        navProgress = Math.max(0, Math.min(navProgress, 1));
        const rotationRad = -navProgress * 2 * Math.PI;

        // Positioning cylinder navigation menu links
        const updateCylinderLink = (linkEl, index) => {
          if (!linkEl) return;
          const baseAngleRad = index * (2 * Math.PI / numberOfItems);
          const angle = baseAngleRad + rotationRad;
          const cosVal = Math.cos(angle);
          const sinVal = Math.sin(angle);
          const x = centerX + sinVal * radiusX;
          const y = centerY + (isDesktop ? cosVal : sinVal) * radiusY;
          const z = cosVal * depthZ;
          const scale = 0.89 + 0.17 * cosVal;
          const baseOpacity = 0.59 + 0.41 * cosVal;
          const blur = 1.0 * (1 - cosVal);
          const zIndex = Math.round((cosVal + 1) * 10);

          let finalOpacity = baseOpacity;

          // Cross-fade opacity reduction when page transitions past 0.8
          if (progress > 0.8) {
            const ratio = (progress - 0.8) / 0.2;
            finalOpacity *= (1 - ratio);
          }

          if (finalOpacity <= 0.01) {
            gsap.set(linkEl, { opacity: 0, pointerEvents: "none" });
          } else {
            const isFrontFocus = cosVal > 0.82;
            gsap.set(linkEl, { 
              opacity: finalOpacity, 
              x: x, 
              y: y, 
              z: z, 
              scale: scale, 
              filter: blur > 0.1 ? `blur(${blur}px)` : "blur(0px)", 
              zIndex: zIndex,
              xPercent: -50,
              yPercent: -50,
              pointerEvents: isFrontFocus && progress < 0.8 ? "auto" : "none" 
            });
            if (cosVal > 0.94) {
              linkEl.classList.add("focus-item");
            } else {
              linkEl.classList.remove("focus-item");
            }
          }
        };

        updateCylinderLink(link1, 0);
        updateCylinderLink(link2, 1);
        updateCylinderLink(link3, 2);
        updateCylinderLink(link4, 3);
        updateCylinderLink(link5, 4);
        updateCylinderLink(link6, 5);
        updateCylinderLink(link7, 6);

        // Core Layout Animations (Cross-Fade / Exit transitions past 0.8 progress)
        if (progress > 0.8) {
          // Hero exit: fades out quickly between 0.8 and 0.9
          let ratioExit = 0;
          if (progress > 0.8) {
            ratioExit = Math.min(1, (progress - 0.8) / 0.1);
          }
          const exitOpacity = 1 - ratioExit;

          gsap.set(video, { opacity: exitOpacity });
          if (logo) gsap.set(logo, { opacity: exitOpacity });
          if (buttons) gsap.set(buttons, { opacity: exitOpacity, y: ratioExit * 15 });
          if (slogan) gsap.set(slogan, { opacity: exitOpacity, y: ratioExit * -15 });
          if (glowOverlay) gsap.set(glowOverlay, { opacity: exitOpacity });

          // Sibling layout entrance: fades in and de-blurs between 0.86 and 1.0
          let ratioEnter = 0;
          if (progress > 0.86) {
            ratioEnter = Math.min(1, (progress - 0.86) / 0.14);
          }
          const blurVal = 12 * (1 - ratioEnter);

          if (whitePage) {
            gsap.set(whitePage, { 
              opacity: ratioEnter, 
              filter: blurVal > 0.1 ? `blur(${blurVal}px)` : "none",
              visibility: ratioEnter > 0.01 ? "visible" : "hidden" 
            });
          }
          if (footer) {
            gsap.set(footer, { 
              opacity: ratioEnter, 
              visibility: ratioEnter > 0.01 ? "visible" : "hidden" 
            });
          }
          if (navbar) {
            gsap.set(navbar, { 
              display: ratioEnter > 0.01 ? "block" : "none", 
              opacity: ratioEnter 
            });
          }
        } else {
          // Normal state (0.0 to 0.8 progress)
          gsap.set(video, { opacity: 1 });
          if (logo) gsap.set(logo, { opacity: 1, y: 0 });
          if (buttons) gsap.set(buttons, { opacity: 1, y: 0 });
          if (slogan) gsap.set(slogan, { opacity: 1, y: 0 });
          if (glowOverlay) gsap.set(glowOverlay, { opacity: 1 });

          if (whitePage) gsap.set(whitePage, { opacity: 0, filter: "blur(12px)", visibility: "hidden" });
          if (footer) gsap.set(footer, { opacity: 0, visibility: "hidden" });
          if (navbar) gsap.set(navbar, { display: "none", opacity: 0 });
        }
      };

      // GSAP timeline controlling UI animations and video scrubbing
      scrollTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "+=380%",
          scrub: 1.5,
          pin: pinRef.current,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => updateUI(self.progress)
        }
      });

      // Smooth video seeking using LERP to prevent decoder choking
      const smoothVideoSeek = () => {
        if (!active) return;
        if (video && !video.seeking) {
          const target = targetTimeRef.current;
          const current = video.currentTime;
          const diff = target - current;
          if (Math.abs(diff) > 0.01) {
            // Adaptive LERP factor: fast snaps for large scrolls, responsive catchup for small moves
            const lerpFactor = Math.abs(diff) > 0.25 ? 0.48 : 0.35;
            video.currentTime = current + diff * lerpFactor;
          }
        }
        rafId = requestAnimationFrame(smoothVideoSeek);
      };
      rafId = requestAnimationFrame(smoothVideoSeek);

      // Ensure video attributes and pause initially
      video.preload = "auto";
      video.muted = true;
      video.playsInline = true;
      video.pause();

      // Trigger initial UI update immediately to prevent jumbled states
      updateUI(0);

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    };

    initTimeline();

    return () => {
      active = false;

      // Cancel smooth video seek loop and wait loop
      if (rafId) cancelAnimationFrame(rafId);
      if (initRafId) cancelAnimationFrame(initRafId);

      // Kill the scroll timeline and its ScrollTrigger
      if (scrollTimeline) {
        const st = scrollTimeline.scrollTrigger;
        if (st) st.kill(true);
        scrollTimeline.kill();
      }

      // Kill ALL remaining ScrollTrigger instances to prevent stale state leaking to next page
      ScrollTrigger.getAll().forEach(trigger => trigger.kill(true));
      ScrollTrigger.clearScrollMemory();

      // Remove body scroll-lock class unconditionally
      document.body.classList.remove('scroll-lock');

      // Restore all GSAP-controlled elements to natural CSS state
      const navbar    = document.querySelector('.navbar');
      const whitePage = document.querySelector('.white-content-page');
      const footer    = document.querySelector('.footer, footer');

      if (navbar)    gsap.set(navbar,    { clearProps: 'all' });
      if (whitePage) gsap.set(whitePage, { clearProps: 'all' });
      if (footer)    gsap.set(footer,    { clearProps: 'all' });
    };
  }, [metadataLoaded]);

  return (
    <section ref={containerRef} className="hero-bloom-scroll">
      <div ref={pinRef} className="hero-bloom-pin">
        {/* Background Video */}
        <video
          ref={videoRef}
          className="hero-bloom-video"
          preload="auto"
          muted
          playsInline
          onLoadedMetadata={handleVideoMetadata}
          src={videoSrc}
        />

        {/* Soft Atmospheric Glow Overlay (Sits between video and text layers) */}
        <div ref={glowOverlayRef} className="hero-white-gradient" />

        {/* Brand Editorial Layout Container */}
        <div className="hero-ui-layer">
          {/* Left Brand Column */}
          <div className="brand-column">
            {/* Logo */}
            <div ref={logoRef} className="logo">
              <img src={settings.logo_url || irisLogo} alt="IRIS Studio" className="logo-img" />
            </div>
          </div>

          {/* Cylinder Navigation Menu */}
          <nav className="nav-depth-path" dir="ltr">
            <NavLink 
              ref={link1Ref} 
              to="/" 
              className="editorial-nav-item-wrapper"
              onClick={handleNav}
            >
              <span className="editorial-nav-item">الرئيسية</span>
            </NavLink>
            <NavLink 
              ref={link2Ref} 
              to="/booking" 
              className="editorial-nav-item-wrapper"
              onClick={handleNav}
            >
              <span className="editorial-nav-item">جلسات التصوير</span>
            </NavLink>
            <NavLink 
              ref={link3Ref} 
              to="/graduation-books" 
              className="editorial-nav-item-wrapper"
              onClick={handleNav}
            >
              <span className="editorial-nav-item">دفاتر التخرج</span>
            </NavLink>
            <NavLink 
              ref={link4Ref} 
              to="/graduation-book-order" 
              className="editorial-nav-item-wrapper"
              onClick={handleNav}
            >
              <span className="editorial-nav-item">طلب دفتر تخرج</span>
            </NavLink>
            <NavLink 
              ref={link5Ref} 
              to="/printing-products" 
              className="editorial-nav-item-wrapper"
              onClick={handleNav}
            >
              <span className="editorial-nav-item">المطبوعات</span>
            </NavLink>
            <NavLink 
              ref={link6Ref} 
              to="/work" 
              className="editorial-nav-item-wrapper"
              onClick={handleNav}
            >
              <span className="editorial-nav-item">أعمالنا</span>
            </NavLink>
            <NavLink 
              ref={link7Ref} 
              to="/packages" 
              className="editorial-nav-item-wrapper"
              onClick={handleNav}
            >
              <span className="editorial-nav-item">عروضنا</span>
            </NavLink>
          </nav>

          {/* Slogan, Paragraph and Buttons Block */}
          <div ref={sloganRef} className="hero-slogan-block">
            <h1 className="editorial-slogan">
              <span className="slogan-line-1">{settings.slogan_line_1}</span>
              <span className="slogan-line-2">{settings.slogan_line_2}</span>
            </h1>

            <p className="hero-supporting-text">
              {settings.supporting_text}
            </p>

            <div ref={buttonsRef} className="hero-actions">
              <Link 
                to="/booking" 
                className="btn btn-premium btn-premium-gold"
                onClick={handleNav}
              >
                ابدأ تجربتك
              </Link>
              
              <Link 
                to="/work" 
                className="btn btn-premium btn-premium-purple"
                onClick={handleNav}
              >
                استكشف أعمالنا
              </Link>
            </div>
          </div>
        </div>

        {/* Next Panel Cover — inside the pinned viewport layer */}
        <div ref={nextPanelRef} className="hero-next-panel">
          <div className="temporary-next-content">
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBloomScene;
