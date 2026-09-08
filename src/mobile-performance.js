/* IRIS MOBILE PERFORMANCE + REELS STABILITY FIX
 * Keeps the visual design intact while removing expensive mobile work,
 * restoring the missing pause/mute controls, and making Reel media lifecycle safe.
 */

const MOBILE_QUERY = '(max-width: 768px)';

const installPerformanceStyles = () => {
  if (document.getElementById('iris-mobile-performance-fix')) return;

  const style = document.createElement('style');
  style.id = 'iris-mobile-performance-fix';
  style.textContent = `
    /* Mobile GPU budget: remove decorative effects that do not affect content. */
    @media (max-width: 768px) {
      .iris-reels-viewer-wrapper .reels-bg-ambient-layer,
      .iris-reels-viewer-wrapper .reels-grain-overlay { display: none !important; }
      .iris-reels-viewer-wrapper .reels-glow-purple-top,
      .iris-reels-viewer-wrapper .reels-glow-green-bottom,
      .iris-reels-viewer-wrapper .reels-glow-gold-center { animation: none !important; filter: none !important; }
      .iris-reels-viewer-wrapper .reel-static-img { transition: none !important; will-change: auto !important; transform: translate3d(0,0,0) !important; }
      .iris-reels-viewer-wrapper .reels-action-circle-btn,
      .iris-reels-viewer-wrapper .reels-hamburger-btn,
      .iris-reels-viewer-wrapper .reels-counter-pill-tag { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }

      .iris-dark-hero-root .lower-stream-card,
      .iris-dark-hero-root .lower-stream-card * { filter: none !important; }
      .iris-dark-hero-root .stream-card-img { transition: none !important; will-change: auto !important; }

      .home-page { overscroll-behavior-x: none; }
      .iris-reels-viewer-wrapper { -webkit-overflow-scrolling: touch; }
    }

    /* Restore the sound action that was hidden by the previous enhancement layer. */
    .iris-reels-viewer-wrapper .reels-action-rail .reels-action-btn-group-single:nth-child(4) {
      display: flex !important;
    }

    /* Missing pause/sound controls: use the classes already designed for them. */
    .iris-reels-viewer-wrapper .iris-reel-media-controls {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      z-index: 60;
      pointer-events: auto;
    }
    .iris-reels-viewer-wrapper .iris-reel-media-controls button {
      appearance: none;
      border: 1px solid rgba(255,255,255,.22);
      color: #fff;
      background: rgba(18,10,17,.58);
      display: grid;
      place-items: center;
      padding: 0;
      cursor: pointer;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    .iris-reels-viewer-wrapper .iris-reel-sound-button { width: 46px; height: 46px; border-radius: 50%; }
    .iris-reels-viewer-wrapper .iris-reel-play-button { width: 82px; height: 82px; border-radius: 50%; }
    .iris-reels-viewer-wrapper .iris-reel-media-controls svg { width: 22px; height: 22px; }
    .iris-reels-viewer-wrapper .iris-reel-play-button svg { width: 34px; height: 34px; }
    @media (max-width: 767px) {
      .iris-reels-viewer-wrapper .iris-reel-sound-button { width: 44px; height: 44px; }
      .iris-reels-viewer-wrapper .iris-reel-play-button { width: 76px; height: 76px; }
    }
  `;
  document.head.appendChild(style);
};

const prepareMedia = (root = document) => {
  root.querySelectorAll('img').forEach((img) => {
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

  root.querySelectorAll('.reel-canvas-layer video').forEach((video) => {
    video.preload = 'metadata';
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', 'true');
  });
};

const playIcon = () => `
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5.2v13.6c0 .9 1 1.45 1.8.98l10-6.8a1.18 1.18 0 0 0 0-1.96l-10-6.8C9 3.75 8 4.3 8 5.2Z"/>
  </svg>`;

const pauseIcon = () => `
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M7 5.5A1.5 1.5 0 0 1 8.5 4h1A1.5 1.5 0 0 1 11 5.5v13A1.5 1.5 0 0 1 9.5 20h-1A1.5 1.5 0 0 1 7 18.5v-13Zm6 0A1.5 1.5 0 0 1 14.5 4h1A1.5 1.5 0 0 1 17 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5v-13Z"/>
  </svg>`;

const soundOnIcon = () => `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M4 10v4h3l4 3V7l-4 3H4Z"/><path d="M15 9.5a3.8 3.8 0 0 1 0 5"/><path d="M17.5 7a7.5 7.5 0 0 1 0 10"/>
  </svg>`;

const soundOffIcon = () => `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M4 10v4h3l4 3V7l-4 3H4Z"/><path d="m16 10 4 4"/><path d="m20 10-4 4"/>
  </svg>`;

const installMediaControls = (root) => {
  const frame = root?.querySelector('.reel-frame');
  const video = root?.querySelector('.reel-canvas-layer video');
  if (!frame || !video) return;

  let controls = frame.querySelector('.iris-reel-media-controls');
  if (!controls) {
    controls = document.createElement('div');
    controls.className = 'iris-reel-media-controls';
    controls.innerHTML = `
      <button type="button" class="iris-reel-sound-button" aria-label="Mute">${soundOffIcon()}</button>
      <button type="button" class="iris-reel-play-button" aria-label="Pause">${pauseIcon()}</button>
    `;
    frame.appendChild(controls);

    const soundButton = controls.querySelector('.iris-reel-sound-button');
    const playButton = controls.querySelector('.iris-reel-play-button');

    soundButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      video.muted = !video.muted;
      video.defaultMuted = video.muted;
      soundButton.innerHTML = video.muted ? soundOffIcon() : soundOnIcon();
      soundButton.setAttribute('aria-label', video.muted ? 'Unmute' : 'Mute');
      window.dispatchEvent(new CustomEvent('iris-reel-mute-change', { detail: { muted: video.muted } }));
    });

    playButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', () => {
      playButton.innerHTML = pauseIcon();
      playButton.setAttribute('aria-label', 'Pause');
    });
    video.addEventListener('pause', () => {
      playButton.innerHTML = playIcon();
      playButton.setAttribute('aria-label', 'Play');
    });
  }

  const soundButton = controls.querySelector('.iris-reel-sound-button');
  const playButton = controls.querySelector('.iris-reel-play-button');
  if (soundButton) {
    soundButton.innerHTML = video.muted ? soundOffIcon() : soundOnIcon();
    soundButton.setAttribute('aria-label', video.muted ? 'Unmute' : 'Mute');
  }
  if (playButton) {
    playButton.innerHTML = video.paused ? playIcon() : pauseIcon();
  }
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

    installMediaControls(root);
  };

  root.addEventListener('click', (event) => {
    if (event.target.closest('.reels-action-btn-group-single:nth-child(4)')) {
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
  installPerformanceStyles();
  prepareMedia(document);
  installReelLifecycle();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

const appObserver = new MutationObserver(() => {
  installPerformanceStyles();
  prepareMedia(document);
  installReelLifecycle();
});
appObserver.observe(document.getElementById('root') || document.body, { childList: true, subtree: true });
