/* IRIS MOBILE PERFORMANCE + REELS STABILITY FIX
 * Keeps the visual design intact while removing the expensive mobile work
 * that was causing scroll jank, delayed media, and broken Hero/Reels transitions.
 */

const MOBILE_QUERY = '(max-width: 768px)';

const installMobileStyles = () => {
  if (!window.matchMedia(MOBILE_QUERY).matches) return;
  if (document.getElementById('iris-mobile-performance-fix')) return;

  const style = document.createElement('style');
  style.id = 'iris-mobile-performance-fix';
  style.textContent = `
    /* Keep the mobile GPU workload predictable. */
    .iris-reels-viewer-wrapper .reels-bg-ambient-layer,
    .iris-reels-viewer-wrapper .reels-grain-overlay { display: none !important; }
    .iris-reels-viewer-wrapper .reels-glow-purple-top,
    .iris-reels-viewer-wrapper .reels-glow-green-bottom,
    .iris-reels-viewer-wrapper .reels-glow-gold-center { animation: none !important; filter: none !important; }
    .iris-reels-viewer-wrapper .reel-static-img { transition: none !important; will-change: auto !important; transform: translate3d(0,0,0) !important; }
    .iris-reels-viewer-wrapper .reel-canvas-layer { will-change: transform; }
    .iris-reels-viewer-wrapper .reels-action-circle-btn,
    .iris-reels-viewer-wrapper .reels-hamburger-btn,
    .iris-reels-viewer-wrapper .reels-counter-pill-tag { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }

    /* The Hero should not spend a frame continuously blurring every moving image. */
    .iris-dark-hero-root .lower-stream-card,
    .iris-dark-hero-root .lower-stream-card * { filter: none !important; }
    .iris-dark-hero-root .stream-card-img { transition: none !important; will-change: auto !important; }

    /* Native browser scrolling is more reliable than synthetic smooth scrolling on phones. */
    .home-page { overscroll-behavior-x: none; }
    .iris-reels-viewer-wrapper { -webkit-overflow-scrolling: touch; }
  `;
  document.head.appendChild(style);
};

const prepareMedia = (root = document) => {
  const images = root.querySelectorAll('img');
  images.forEach((img) => {
    if (img.closest('.reel-canvas-layer')) {
      img.loading = 'eager';
      img.decoding = 'async';
      return;
    }

    if (img.closest('.lower-stream-card')) {
      img.loading = 'lazy';
      img.decoding = 'async';
      img.setAttribute('fetchpriority', 'low');
    }
  });

  const videos = root.querySelectorAll('.reel-canvas-layer video');
  videos.forEach((video) => {
    video.preload = 'metadata';
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', 'true');
  });
};

const installReelLifecycle = () => {
  const root = document.querySelector('.iris-reels-viewer-wrapper');
  if (!root || root.dataset.mobileLifecycleInstalled === 'true') return;
  root.dataset.mobileLifecycleInstalled = 'true';

  let userChangedSound = false;
  let firstVideoHandled = false;

  const setMutedState = (muted) => {
    const video = root.querySelector('.reel-canvas-layer video');
    if (!video) return;
    video.muted = muted;
    video.defaultMuted = muted;
    if (muted) video.setAttribute('muted', '');
    else video.removeAttribute('muted');
  };

  const notifyReactMute = (muted) => {
    window.dispatchEvent(new CustomEvent('iris-reel-mute-change', { detail: { muted } }));
  };

  const syncActiveVideo = () => {
    const video = root.querySelector('.reel-canvas-layer video');
    if (!video) return;

    video.preload = 'metadata';
    video.playsInline = true;

    if (!firstVideoHandled) {
      firstVideoHandled = true;
      userChangedSound = false;
      setMutedState(true);
      notifyReactMute(true);
    } else if (!userChangedSound) {
      setMutedState(true);
    }
  };

  root.addEventListener('click', (event) => {
    const soundControl = event.target.closest('.reels-action-btn-group-single:nth-child(4)');
    if (soundControl) {
      userChangedSound = true;
    }
  }, { passive: true });

  const observer = new MutationObserver(() => {
    prepareMedia(root);
    syncActiveVideo();
  });
  observer.observe(root, { childList: true, subtree: true });

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    const video = root.querySelector('.reel-canvas-layer video');
    if (!video) return;

    if (entry.isIntersecting && document.visibilityState === 'visible') {
      syncActiveVideo();
      video.play().catch(() => {});
    } else {
      video.pause();
      /* Returning to Hero must never leave audio/video running in the background. */
      video.muted = true;
      video.defaultMuted = true;
    }
  }, { threshold: 0.55 });
  visibilityObserver.observe(root);

  document.addEventListener('visibilitychange', () => {
    const video = root.querySelector('.reel-canvas-layer video');
    if (!video) return;
    if (document.visibilityState !== 'visible') video.pause();
  }, { passive: true });

  prepareMedia(root);
  syncActiveVideo();
};

const boot = () => {
  installMobileStyles();
  prepareMedia(document);
  installReelLifecycle();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

const appObserver = new MutationObserver(() => {
  installMobileStyles();
  prepareMedia(document);
  installReelLifecycle();
});
appObserver.observe(document.getElementById('root') || document.body, { childList: true, subtree: true });
