import './styles/reels-enhancements.css';

const PROFILE_SELECTOR = '.reel-canvas-layer .instagram-caption-profile-row';
const STATIC_PROFILE_CLASS = 'reels-static-profile-header';
let gestureClickTimer = null;
let syncQueued = false;
let indicatorTimer = null;

const getActiveFrame = () => document.querySelector('.iris-reels-viewer-wrapper .reel-frame');
const isInteractiveTarget = (target) => Boolean(target?.closest?.('.reels-persistent-ui-layer, .reels-floating-skip-pill, .reels-feedback-drawer-overlay, button, a, input, textarea, select'));

const showPlaybackIndicator = (frame, isPlaying) => {
  if (!frame) return;
  let indicator = frame.querySelector('.iris-reel-playback-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.className = 'iris-reel-playback-indicator';
    frame.appendChild(indicator);
  }
  indicator.textContent = isPlaying ? '▶' : 'Ⅱ';
  indicator.classList.remove('is-visible');
  void indicator.offsetWidth;
  requestAnimationFrame(() => indicator.classList.add('is-visible'));
};

const showSoundIndicator = (frame, isMuted) => {
  if (!frame) return;
  let indicator = frame.querySelector('.iris-reel-sound-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.className = 'iris-reel-sound-indicator';
    frame.appendChild(indicator);
  }

  indicator.innerHTML = isMuted
    ? '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="m17 9 4 6M21 9l-4 6"/></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M17 9a5 5 0 0 1 0 6M19.8 6.4a9 9 0 0 1 0 11.2"/></svg>';

  indicator.classList.remove('is-visible');
  void indicator.offsetWidth;
  requestAnimationFrame(() => indicator.classList.add('is-visible'));

  window.clearTimeout(indicatorTimer);
  indicatorTimer = window.setTimeout(() => {
    indicator?.classList.remove('is-visible');
  }, 650);
};

const toggleVideoPlayback = (video) => {
  const frame = video?.closest('.reel-frame');
  if (!video || !frame) return;

  if (video.paused) {
    video.play().then(() => showPlaybackIndicator(frame, true)).catch(() => {});
  } else {
    video.pause();
    showPlaybackIndicator(frame, false);
  }
};

const syncStaticProfile = () => {
  const frame = getActiveFrame();
  if (!frame) return;

  const source = frame.querySelector(PROFILE_SELECTOR);
  const layer = frame.querySelector('.reels-persistent-ui-layer');
  if (!source || !layer) return;

  const existing = layer.querySelector(`.${STATIC_PROFILE_CLASS}`);
  source.classList.add(STATIC_PROFILE_CLASS);
  source.setAttribute('aria-hidden', 'true');
  source.querySelectorAll('button, a, input, textarea, select').forEach((el) => {
    el.setAttribute('tabindex', '-1');
    el.setAttribute('aria-hidden', 'true');
  });

  // Move the REAL profile node into the persistent UI layer instead of cloning it.
  // This keeps the original visual position while preventing it from sliding with the Reel canvas.
  if (existing && existing !== source) {
    existing.remove();
    layer.appendChild(source);
  } else if (!existing) {
    layer.appendChild(source);
  }
};

const scheduleProfileSync = () => {
  if (syncQueued) return;
  syncQueued = true;
  requestAnimationFrame(() => {
    syncQueued = false;
    syncStaticProfile();
  });
};

const handleMediaClick = (event) => {
  const video = event.target.closest?.('.reel-canvas-layer video');
  if (!video || event.defaultPrevented || isInteractiveTarget(event.target)) return;

  // Second click of the same gesture = pause/play. This makes the interaction
  // reliable even when the browser delays or suppresses dblclick on touch devices.
  if (event.detail >= 2) {
    window.clearTimeout(gestureClickTimer);
    gestureClickTimer = null;
    toggleVideoPlayback(video);
    return;
  }

  window.clearTimeout(gestureClickTimer);
  gestureClickTimer = window.setTimeout(() => {
    video.muted = !video.muted;
    showSoundIndicator(video.closest('.reel-frame'), video.muted);
  }, 240);
};

const setupObserver = () => {
  const observer = new MutationObserver(() => scheduleProfileSync());
  observer.observe(document.body, { childList: true, subtree: true });
  scheduleProfileSync();
};

document.addEventListener('click', handleMediaClick, true);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupObserver, { once: true });
} else {
  setupObserver();
}
