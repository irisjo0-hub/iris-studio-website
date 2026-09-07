/*
 * IRIS Reels UX refinements.
 *
 * This is intentionally isolated from the main viewer component so the existing
 * Reel data/CTA/navigation behavior stays untouched while the visual shell and
 * media gestures are refined.
 */

import './styles/reels-enhancements.css';

const PROFILE_SELECTOR = '.reel-canvas-layer .instagram-caption-profile-row';
const STATIC_PROFILE_CLASS = 'reels-static-profile-header';
let gestureClickTimer = null;
let syncQueued = false;

const getActiveFrame = () => document.querySelector('.iris-reels-viewer-wrapper .reel-frame');

const isInteractiveTarget = (target) => Boolean(
  target?.closest?.(
    '.reels-persistent-ui-layer, .reels-floating-skip-pill, .reels-feedback-drawer-overlay, button, a, input, textarea, select'
  )
);

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

const getSoundToggleButton = (frame) => {
  return frame?.querySelector('.reels-action-rail .reels-action-btn-group-single:nth-child(4) button') || null;
};

const syncStaticProfile = () => {
  const frame = getActiveFrame();
  if (!frame) return;

  const source = frame.querySelector(PROFILE_SELECTOR);
  const layer = frame.querySelector('.reels-persistent-ui-layer');
  if (!source || !layer) return;

  let staticProfile = layer.querySelector(`.${STATIC_PROFILE_CLASS}`);
  const sourceMarkup = source.innerHTML;

  if (!staticProfile) {
    staticProfile = source.cloneNode(true);
    staticProfile.classList.add(STATIC_PROFILE_CLASS);
    staticProfile.setAttribute('aria-hidden', 'true');
    staticProfile.dataset.sourceMarkup = sourceMarkup;

    staticProfile.querySelectorAll('button, a, input, textarea, select').forEach((el) => {
      el.setAttribute('tabindex', '-1');
      el.setAttribute('aria-hidden', 'true');
    });

    layer.appendChild(staticProfile);
  } else if (staticProfile.dataset.sourceMarkup !== sourceMarkup) {
    staticProfile.innerHTML = sourceMarkup;
    staticProfile.dataset.sourceMarkup = sourceMarkup;
    staticProfile.classList.add(STATIC_PROFILE_CLASS);
    staticProfile.setAttribute('aria-hidden', 'true');

    staticProfile.querySelectorAll('button, a, input, textarea, select').forEach((el) => {
      el.setAttribute('tabindex', '-1');
      el.setAttribute('aria-hidden', 'true');
    });
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

  window.clearTimeout(gestureClickTimer);
  gestureClickTimer = window.setTimeout(() => {
    const frame = video.closest('.reel-frame');
    const soundButton = getSoundToggleButton(frame);

    if (soundButton) {
      soundButton.click();
    } else {
      video.muted = !video.muted;
    }
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
