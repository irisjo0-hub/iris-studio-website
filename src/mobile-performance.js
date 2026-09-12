/* IRIS mobile performance layer — performance only.
 * Reel interaction stays in IrisReelsViewer.jsx exactly as designed.
 * This file must never add, remove, or reinterpret reel gestures.
 */

const STYLE_ID = 'iris-mobile-performance-fix';
const REELS_SELECTOR = '.iris-reels-viewer-wrapper';

const installPerformanceStyles = () => {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @media (max-width: 768px) {
      /* Remove expensive decorative work from the mobile compositor. */
      .iris-reels-viewer-wrapper .reels-bg-ambient-layer,
      .iris-reels-viewer-wrapper .reels-grain-overlay {
        display: none !important;
      }

      .iris-reels-viewer-wrapper .reels-glow-purple-top,
      .iris-reels-viewer-wrapper .reels-glow-green-bottom,
      .iris-reels-viewer-wrapper .reels-glow-gold-center {
        animation: none !important;
        filter: none !important;
      }

      .iris-reels-viewer-wrapper .reel-frame {
        contain: layout paint style;
        isolation: isolate;
      }

      .iris-reels-viewer-wrapper .reel-canvas-layer {
        contain: layout paint;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
      }

      .iris-reels-viewer-wrapper .reel-static-img {
        transition: none !important;
      }

      .iris-reels-viewer-wrapper .reels-action-circle-btn,
      .iris-reels-viewer-wrapper .reels-hamburger-btn,
      .iris-reels-viewer-wrapper .reels-counter-pill-tag {
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }

      .iris-dark-hero-root .lower-stream-card,
      .iris-dark-hero-root .lower-stream-card * {
        filter: none !important;
      }

      .iris-dark-hero-root .stream-card-img {
        transition: none !important;
        will-change: auto !important;
      }

      .home-page {
        overscroll-behavior-x: none;
      }
    }
  `;
  document.head.appendChild(style);
};

const prepareImages = (root = document) => {
  root.querySelectorAll('.lower-stream-card img').forEach((img) => {
    img.loading = 'lazy';
    img.decoding = 'async';
    img.setAttribute('fetchpriority', 'low');
  });
};

const prepareVideo = (video, isActive = false) => {
  if (!video) return;

  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', 'true');

  /* Never preload an inactive/transitioning reel. The active reel may load normally. */
  if (!isActive) {
    video.preload = 'metadata';
    video.setAttribute('fetchpriority', 'low');
  }
};

const prepareReelMedia = (root) => {
  if (!root) return;
  const frame = root.querySelector('.reel-frame');
  if (!frame) return;

  prepareImages(root);

  const videos = frame.querySelectorAll('.reel-canvas-layer video');
  videos.forEach((video, index) => {
    const isActive = index === videos.length - 1;
    /* The last/currently mounted canvas is the only one allowed to play/load normally. */
    if (!isActive) {
      video.pause();
      video.autoplay = false;
      video.preload = 'metadata';
    }
    prepareVideo(video, isActive);
  });
};

const installReelObserver = (root) => {
  if (!root || root.dataset.mobilePerformanceObserver === 'true') return;
  root.dataset.mobilePerformanceObserver = 'true';

  const frameObserver = new MutationObserver(() => {
    if (frameObserver.queued) return;
    frameObserver.queued = true;
    requestAnimationFrame(() => {
      frameObserver.queued = false;
      prepareReelMedia(root);
    });
  });

  const frame = root.querySelector('.reel-frame');
  if (frame) {
    frameObserver.observe(frame, { childList: true });
  }

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) {
      root.querySelectorAll('video').forEach((video) => {
        video.pause();
        video.preload = 'metadata';
      });
    }
  }, { threshold: 0.05 });

  visibilityObserver.observe(root);
  prepareReelMedia(root);
};

const boot = () => {
  installPerformanceStyles();
  prepareImages();

  const root = document.querySelector(REELS_SELECTOR);
  if (root) installReelObserver(root);

  /* React mounts the Reels section after this file runs. Poll only until it exists,
     then stop permanently — no document-wide MutationObserver. */
  if (!root) {
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      const reelsRoot = document.querySelector(REELS_SELECTOR);
      if (reelsRoot) {
        window.clearInterval(timer);
        installReelObserver(reelsRoot);
        return;
      }
      if (attempts >= 120) window.clearInterval(timer);
    }, 50);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
