import './styles/reels-enhancements.css';

const PROFILE_SELECTOR = '.reel-canvas-layer .instagram-caption-profile-row';
const STATIC_PROFILE_CLASS = 'reels-static-profile-header';
const CONTROLS_CLASS = 'iris-reel-media-controls';
const PLAY_BUTTON_CLASS = 'iris-reel-play-button';
const SOUND_BUTTON_CLASS = 'iris-reel-sound-button';
let syncQueued = false;
let observedVideo = null;

const getFrame = () => document.querySelector('.iris-reels-viewer-wrapper .reel-frame');
const getVideos = () => Array.from(document.querySelectorAll('.iris-reels-viewer-wrapper .reel-canvas-layer video'));
const getActiveVideo = () => {
  const videos = getVideos();
  return videos.length ? videos[videos.length - 1] : null;
};

const icon = (name) => {
  if (name === 'play') {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5.1v13.8c0 .8.9 1.3 1.6.8l10-6.9a1 1 0 0 0 0-1.6l-10-6.9A1 1 0 0 0 8 5.1Z" fill="currentColor"/></svg>';
  }
  if (name === 'muted') {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 9v6h4l5 4V5L8 9H4Z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><path d="m17 9 4 6M21 9l-4 6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>';
  }
  return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 9v6h4l5 4V5L8 9H4Z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><path d="M17 9a5 5 0 0 1 0 6M19.8 6.4a9 9 0 0 1 0 11.2" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>';
};

const pauseInactiveVideos = (activeVideo) => {
  getVideos().forEach((video) => {
    if (video !== activeVideo) {
      video.pause();
      video.muted = true;
    }
  });
};

const syncStaticProfile = () => {
  const frame = getFrame();
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
      pauseInactiveVideos(video);
      video.play().then(() => setControlsVisible(frame, false)).catch(() => {});
    });

    controls.append(soundButton, playButton);
    layer.appendChild(controls);
  }

  updateSoundButton(video);
};

const ensureVideoBehavior = (video) => {
  if (!video) return;
  const frame = video.closest('.reel-frame');
  buildControls(frame, video);

  if (video !== observedVideo) {
    observedVideo = video;

    // A newly entered Reel starts with audio on.
    video.muted = false;
    video.defaultMuted = false;

    video.addEventListener('play', () => {
      pauseInactiveVideos(video);
      setControlsVisible(frame, false);
    });
    video.addEventListener('pause', () => setControlsVisible(frame, true));
    video.addEventListener('ended', () => setControlsVisible(frame, true));

    // One tap/click pauses the active Reel. There is no double-click gesture.
    video.addEventListener('click', (event) => {
      if (event.defaultPrevented) return;
      video.pause();
    });

    const tryAutoplay = () => {
      if (video !== getActiveVideo()) return;
      video.muted = false;
      pauseInactiveVideos(video);
      video.play().then(() => setControlsVisible(frame, false)).catch(() => setControlsVisible(frame, true));
    };

    video.addEventListener('loadedmetadata', tryAutoplay, { once: true });
    tryAutoplay();
  }

  // Critical: every sync kills audio/playback from all exited Reel layers.
  pauseInactiveVideos(video === getActiveVideo() ? video : getActiveVideo());
  updateSoundButton(video);
};

const scheduleSync = () => {
  if (syncQueued) return;
  syncQueued = true;
  requestAnimationFrame(() => {
    syncQueued = false;
    syncStaticProfile();
    const activeVideo = getActiveVideo();
    if (activeVideo) ensureVideoBehavior(activeVideo);
    pauseInactiveVideos(activeVideo);
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
