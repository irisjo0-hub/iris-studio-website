import './styles/reels-enhancements.css';

const PROFILE_SELECTOR = '.reel-canvas-layer .instagram-caption-profile-row';
const STATIC_PROFILE_CLASS = 'reels-static-profile-header';
const CONTROLS_CLASS = 'iris-reel-media-controls';
const PLAY_BUTTON_CLASS = 'iris-reel-play-button';
const SOUND_BUTTON_CLASS = 'iris-reel-sound-button';
let syncQueued = false;
let observedVideo = null;

const getActiveFrame = () => document.querySelector('.iris-reels-viewer-wrapper .reel-frame');
const getActiveVideo = (frame) => frame?.querySelector('.reel-canvas-layer video') || null;

const icon = (name) => {
  if (name === 'play') {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5.1v13.8c0 .8.9 1.3 1.6.8l10-6.9a1 1 0 0 0 0-1.6l-10-6.9A1 1 0 0 0 8 5.1Z" fill="currentColor"/></svg>';
  }
  if (name === 'muted') {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 9v6h4l5 4V5L8 9H4Z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><path d="m17 9 4 6M21 9l-4 6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>';
  }
  return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 9v6h4l5 4V5L8 9H4Z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><path d="M17 9a5 5 0 0 1 0 6M19.8 6.4a9 9 0 0 1 0 11.2" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>';
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

  if (existing && existing !== source) existing.remove();
  if (source.parentElement !== layer) layer.appendChild(source);
};

const setControlsVisible = (frame, visible) => {
  const controls = frame?.querySelector(`.${CONTROLS_CLASS}`);
  controls?.classList.toggle('is-visible', visible);
};

const updateSoundButton = (video) => {
  const frame = video?.closest('.reel-frame');
  const button = frame?.querySelector(`.${SOUND_BUTTON_CLASS}`);
  if (!button) return;
  const muted = Boolean(video.muted);
  button.innerHTML = muted ? icon('muted') : icon('volume');
  button.setAttribute('aria-label', muted ? 'تشغيل الصوت' : 'كتم الصوت');
  button.setAttribute('title', muted ? 'تشغيل الصوت' : 'كتم الصوت');
};

const buildControls = (frame, video) => {
  const layer = frame?.querySelector('.reels-persistent-ui-layer');
  if (!layer || !video) return;

  let controls = layer.querySelector(`.${CONTROLS_CLASS}`);
  if (!controls) {
    controls = document.createElement('div');
    controls.className = CONTROLS_CLASS;

    const soundButton = document.createElement('button');
    soundButton.type = 'button';
    soundButton.className = SOUND_BUTTON_CLASS;
    soundButton.setAttribute('aria-label', 'كتم الصوت');
    soundButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      video.muted = !video.muted;
      updateSoundButton(video);
    });

    const playButton = document.createElement('button');
    playButton.type = 'button';
    playButton.className = PLAY_BUTTON_CLASS;
    playButton.innerHTML = icon('play');
    playButton.setAttribute('aria-label', 'تشغيل الريل');
    playButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      video.play().then(() => setControlsVisible(frame, false)).catch(() => {});
    });

    controls.append(soundButton, playButton);
    layer.appendChild(controls);
  }

  updateSoundButton(video);
};

const ensureVideoBehavior = (video) => {
  if (!video || video === observedVideo) return;
  observedVideo = video;
  const frame = video.closest('.reel-frame');
  buildControls(frame, video);

  // Default is sound ON. Autoplay may still be blocked by the browser;
  // the visible play control is then the first user gesture.
  video.muted = false;
  video.defaultMuted = false;

  const syncPlayback = () => {
    if (!document.body.contains(video)) return;
    video.muted = false;
    const promise = video.play();
    if (promise?.then) {
      promise.then(() => setControlsVisible(frame, false)).catch(() => setControlsVisible(frame, true));
    }
  };

  video.addEventListener('play', () => setControlsVisible(frame, false));
  video.addEventListener('pause', () => setControlsVisible(frame, true));
  video.addEventListener('loadedmetadata', syncPlayback, { once: true });

  // One tap/click pauses the Reel. No double-click gesture is used.
  video.addEventListener('click', (event) => {
    if (event.defaultPrevented) return;
    video.pause();
  });

  syncPlayback();
};

const scheduleSync = () => {
  if (syncQueued) return;
  syncQueued = true;
  requestAnimationFrame(() => {
    syncQueued = false;
    syncStaticProfile();
    const frame = getActiveFrame();
    const video = getActiveVideo(frame);
    if (video) ensureVideoBehavior(video);
  });
};

const setupObserver = () => {
  const observer = new MutationObserver(scheduleSync);
  observer.observe(document.body, { childList: true, subtree: true });
  scheduleSync();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupObserver, { once: true });
} else {
  setupObserver();
}
