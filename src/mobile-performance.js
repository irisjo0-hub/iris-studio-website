/* IRIS mobile performance layer — visual/performance only.
 * Reel interaction stays in reels-enhancements.js exactly as designed:
 * single click = mute/unmute, double click = pause/play.
 */

const installPerformanceStyles = () => {
  if (document.getElementById('iris-mobile-performance-fix')) return;

  const style = document.createElement('style');
  style.id = 'iris-mobile-performance-fix';
  style.textContent = `
    @media (max-width: 768px) {
      .iris-reels-viewer-wrapper .reels-bg-ambient-layer,
      .iris-reels-viewer-wrapper .reels-grain-overlay { display: none !important; }

      .iris-reels-viewer-wrapper .reels-glow-purple-top,
      .iris-reels-viewer-wrapper .reels-glow-green-bottom,
      .iris-reels-viewer-wrapper .reels-glow-gold-center {
        animation: none !important;
        filter: none !important;
      }

      .iris-reels-viewer-wrapper .reel-static-img {
        transition: none !important;
        will-change: auto !important;
        transform: translate3d(0,0,0) !important;
      }

      .iris-reels-viewer-wrapper .reels-action-circle-btn,
      .iris-reels-viewer-wrapper .reels-hamburger-btn,
      .iris-reels-viewer-wrapper .reels-counter-pill-tag {
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }

      .iris-dark-hero-root .lower-stream-card,
      .iris-dark-hero-root .lower-stream-card * { filter: none !important; }

      .iris-dark-hero-root .stream-card-img {
        transition: none !important;
        will-change: auto !important;
      }

      .home-page { overscroll-behavior-x: none; }
    }

    /* The existing fourth action group is the real sound control. */
    .iris-reels-viewer-wrapper .reels-action-rail .reels-action-btn-group-single:nth-child(4) {
      display: flex !important;
    }
  `;
  document.head.appendChild(style);
};

const prepareMedia = () => {
  document.querySelectorAll('.lower-stream-card img').forEach((img) => {
    img.loading = 'lazy';
    img.decoding = 'async';
    img.setAttribute('fetchpriority', 'low');
  });

  document.querySelectorAll('.reel-canvas-layer video').forEach((video) => {
    video.preload = 'metadata';
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', 'true');
  });
};

const boot = () => {
  installPerformanceStyles();
  prepareMedia();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
