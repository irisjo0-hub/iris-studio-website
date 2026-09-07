import './styles/reels-enhancements.css';

const PROFILE_SELECTOR = '.reel-canvas-layer .instagram-caption-profile-row';
const STATIC_PROFILE_CLASS = 'reels-static-profile-header';
const PROFILE_PLACEHOLDER_CLASS = 'reels-profile-placeholder';
let gestureClickTimer = null;
let syncQueued = false;

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
  indicator.textContent = isMuted ? '🔇' : '🔊';
  indicator.classList.remove('is-visible');
  requestAnimationFrame(() => indicator.classList.add('is-visible'));
};

const createPlaceholder = (source) => {
  const placeholder = document.createElement('div');
  placeholder.className = PROFILE_PLACEHOLDER_CLASS;
  placeholder.setAttribute('aria-hidden', 'true');
  placeholder.style.width = `${source.offsetWidth || 0}px`;
  placeholder.style.height = `${source.offsetHeight || 0}px`;
  placeholder.style.visibility = 'hidden';
  placeholder.style.pointerEvents = 'none';
  return placeholder;
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

  let placeholder = frame.querySelector(`.${PROFILE_PLACEHOLDER_CLASS}`);
  if (!placeholder) {
    placeholder = createPlaceholder(source);
    source.parentElement?.insertBefore(placeholder, source);
  }

  if (existing && existing !== source) existing.remove();
  if (source.parentElement !== layer) layer.appendChild(source);
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

  window.clearTimeout(gestureClickTimer);
  gestureClickTimer = window.setTimeout(() => {
    const frame = video.closest('.reel-frame');
    video.muted = !video.muted;
    showSoundIndicator(frame, video.muted);
  }, 220);
};

const handleMediaDoubleClick = (event) => {
  const video = event.target.closest?.('.reel-canvas-layer video');
  if (!video || isInteractiveTarget(event.target)) return;

  window.clearTimeout(gestureClickTimer);
  gestureClickTimer = null;

  if (video.paused) {
    video.play().catch(() => {});
    showPlaybackIndicator(video.closest('.reel-frame'), true);
  } else {
    video.pause();
    showPlaybackIndicator(video.closest('.reel-frame'), false);
  }
};

const setupObserver = () => {
  const observer = new MutationObserver(() => scheduleProfileSync());
  observer.observe(document.body, { childList: true, subtree: true });
  scheduleProfileSync();
};

document.addEventListener('click', handleMediaClick, true);
document.addEventListener('dblclick', handleMediaDoubleClick, true);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupObserver, { once: true });
} else {
  setupObserver();
}
