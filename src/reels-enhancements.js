import './styles/reels-enhancements.css';

const PROFILE_SELECTOR = '.reel-canvas-layer .instagram-caption-profile-row';
const STATIC_PROFILE_CLASS = 'reels-static-profile-header';
const CONTROLS_CLASS = 'iris-reel-media-controls';
const PLAY_BUTTON_CLASS = 'iris-reel-play-button';
const SOUND_BUTTON_CLASS = 'iris-reel-sound-button';
let syncQueued = false;
let activeVideo = null;
let gesture = null;
let suppressNextClick = false;

const getFrame = () => document.querySelector('.iris-reels-viewer-wrapper .reel-frame');
const getCanvasLayers = (frame = getFrame()) => Array.from(frame?.querySelectorAll(':scope > .reel-canvas-layer, .reel-canvas-layer') || []);
const getCurrentCanvas = (frame = getFrame()) => {
  const layers = getCanvasLayers(frame);
  return layers.length ? layers[layers.length - 1] : null;
};
const getVideos = () => Array.from(document.querySelectorAll('.iris-reels-viewer-wrapper .reel-canvas-layer video'));

// IMPORTANT: the last canvas is the currently rendered Reel. Never treat a video
// from the exiting canvas as active when the new Reel is an image.
const getActiveVideo = (frame = getFrame()) => {
  const currentCanvas = getCurrentCanvas(frame);
  if (!currentCanvas) return null;
  return currentCanvas.querySelector('video');
};

const icon = (name) => {
  if (name === 'play') return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6c0 .8.9 1.3 1.6.8l10-6.8a1 1 0 0 0 0-1.6l-10-6.8A1 1 0 0 0 8 5.2Z" fill="currentColor"/></svg>';
  if (name === 'muted') return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><path d="m17 9 4 6M21 9l-4 6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>';
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><path d="M17 9a5 5 0 0 1 0 6M19.8 6.4a9 9 0 0 1 0 11.2" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>';
};

const stopAllVideosExcept = (keep = null) => {
  getVideos().forEach((video) => {
    if (video === keep) return;
    video.pause();
    video.muted = true;
  });
};

const setControlsVisible = (frame, visible) => {
  const controls = frame?.querySelector(`.${CONTROLS_CLASS}`);
  if (!controls) return;
  controls.classList.toggle('is-visible', visible);
};

const updateSoundButton = (video) => {
  const frame = video?.closest('.reel-frame');
  const button = frame?.querySelector(`.${SOUND_BUTTON_CLASS}`);
  if (!button) return;
  button.innerHTML = video.muted ? icon('muted') : icon('volume');
  button.setAttribute('aria-label', video.muted ? 'تشغيل الصوت' : 'كتم الصوت');
  button.setAttribute('title', video.muted ? 'تشغيل الصوت' : 'كتم الصوت');
};

const buildControls = (frame, video) => {
  if (!frame || !video) return;
  const layer = frame.querySelector('.reels-persistent-ui-layer');
  if (!layer) return;

  let controls = layer.querySelector(`.${CONTROLS_CLASS}`);
  if (!controls) {
    controls = document.createElement('div');
    controls.className = CONTROLS_CLASS;

    const soundButton = document.createElement('button');
    soundButton.type = 'button';
    soundButton.className = SOUND_BUTTON_CLASS;
    soundButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const current = getActiveVideo(frame);
      if (!current) return;
      current.muted = !current.muted;
      updateSoundButton(current);
    });

    const playButton = document.createElement('button');
    playButton.type = 'button';
    playButton.className = PLAY_BUTTON_CLASS;
    playButton.innerHTML = icon('play');
    playButton.setAttribute('aria-label', 'تشغيل الريل');
    playButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const current = getActiveVideo(frame);
      if (!current) return;
      stopAllVideosExcept(current);
      current.play().then(() => setControlsVisible(frame, false)).catch(() => {});
    });

    controls.append(soundButton, playButton);
    layer.appendChild(controls);
  }

  updateSoundButton(video);
};

const moveProfileToPersistentLayer = (frame) => {
  const layer = frame?.querySelector('.reels-persistent-ui-layer');
  if (!layer) return;
  const source = frame.querySelector(PROFILE_SELECTOR) || layer.querySelector(`.${STATIC_PROFILE_CLASS}`);
  if (!source) return;
  source.classList.add(STATIC_PROFILE_CLASS);
  source.style.setProperty('bottom', '104px', 'important');
  source.style.setProperty('top', 'auto', 'important');
  source.style.setProperty('transition', 'none', 'important');
  if (source.parentElement !== layer) layer.appendChild(source);
};

const bindVideo = (video) => {
  const frame = video?.closest('.reel-frame');
  if (!frame || video === activeVideo) return;

  if (activeVideo) {
    activeVideo.pause();
    activeVideo.muted = true;
  }

  activeVideo = video;
  buildControls(frame, video);
  stopAllVideosExcept(video);

  // New Reels start with sound ON. The browser may still reject audible autoplay;
  // in that case the paused controls remain visible so the user can start it.
  video.muted = false;
  video.defaultMuted = false;
  video.playsInline = true;

  video.addEventListener('play', () => {
    // A play event from an exiting Reel must never keep audio alive.
    if (getActiveVideo(frame) !== video) {
      video.pause();
      video.muted = true;
      return;
    }
    stopAllVideosExcept(video);
    setControlsVisible(frame, false);
  });

  video.addEventListener('pause', () => {
    if (getActiveVideo(frame) === video) setControlsVisible(frame, true);
  });

  video.addEventListener('volumechange', () => updateSoundButton(video));

  // Single click = pause. No double-click handling.
  video.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (getActiveVideo(frame) !== video) return;
    video.pause();
    video.muted = false;
    updateSoundButton(video);
  });

  const start = () => {
    if (getActiveVideo(frame) !== video) return;
    stopAllVideosExcept(video);
    video.muted = false;
    video.play()
      .then(() => setControlsVisible(frame, false))
      .catch(() => setControlsVisible(frame, true));
  };

  if (video.readyState >= 1) start();
  else video.addEventListener('loadedmetadata', start, { once: true });
};

const cancelAnimations = (element) => {
  if (!element?.getAnimations) return;
  element.getAnimations().forEach((animation) => animation.cancel());
};

const animateLayer = (layer, fromY, toY, duration = 440) => {
  if (!layer) return Promise.resolve();
  cancelAnimations(layer);
  layer.style.willChange = 'transform';
  layer.style.backfaceVisibility = 'hidden';
  return layer.animate(
    [
      { transform: `translate3d(0, ${fromY}px, 0)` },
      { transform: `translate3d(0, ${toY}px, 0)` }
    ],
    { duration, easing: 'cubic-bezier(0.22, 0.9, 0.24, 1)', fill: 'forwards' }
  ).finished.catch(() => {});
};

const finishNativeSwipe = (frame, deltaY) => {
  const layers = getCanvasLayers(frame);
  if (layers.length < 2) return;
  const incoming = layers[layers.length - 1];
  const outgoing = layers[layers.length - 2];
  const height = frame.clientHeight || frame.getBoundingClientRect().height || window.innerHeight;
  const direction = deltaY < 0 ? 1 : -1;

  cancelAnimations(incoming);
  cancelAnimations(outgoing);
  incoming.style.transform = `translate3d(0, ${direction * height}px, 0)`;
  outgoing.style.transform = 'translate3d(0, 0, 0)';

  void incoming.offsetWidth;
  animateLayer(outgoing, 0, -direction * height, 420);
  animateLayer(incoming, direction * height, 0, 420);
};

const bindGestureDriver = () => {
  const wrapper = document.querySelector('.iris-reels-viewer-wrapper');
  if (!wrapper || wrapper.dataset.gestureDriverBound === 'true') return;
  wrapper.dataset.gestureDriverBound = 'true';

  wrapper.addEventListener('touchstart', (event) => {
    if (event.touches.length !== 1) return;
    const frame = getFrame();
    if (!frame || !frame.contains(event.target)) return;
    gesture = {
      startY: event.touches[0].clientY,
      lastY: event.touches[0].clientY,
      frame,
      layer: getCurrentCanvas(frame)
    };
    if (gesture.layer) gesture.layer.style.transition = 'none';
  }, { passive: true });

  wrapper.addEventListener('touchmove', (event) => {
    if (!gesture || event.touches.length !== 1) return;
    const currentY = event.touches[0].clientY;
    gesture.lastY = currentY;
    const delta = currentY - gesture.startY;
    if (Math.abs(delta) < 3 || !gesture.layer) return;
    gesture.layer.style.transform = `translate3d(0, ${delta}px, 0)`;
  }, { passive: false });

  wrapper.addEventListener('touchend', () => {
    if (!gesture) return;
    const deltaY = gesture.lastY - gesture.startY;
    const frame = gesture.frame;
    const layer = gesture.layer;
    gesture = null;
    if (Math.abs(deltaY) < 50) {
      if (layer) layer.style.transform = '';
      return;
    }
    suppressNextClick = true;
    window.setTimeout(() => { suppressNextClick = false; }, 500);
    window.requestAnimationFrame(() => finishNativeSwipe(frame, deltaY));
  }, { passive: true });
};

const sync = () => {
  const frame = getFrame();
  if (!frame) {
    stopAllVideosExcept();
    activeVideo = null;
    return;
  }

  moveProfileToPersistentLayer(frame);

  const nextVideo = getActiveVideo(frame);
  if (nextVideo) {
    if (activeVideo !== nextVideo) bindVideo(nextVideo);
    else updateSoundButton(nextVideo);
  } else {
    // New Reel is an image: kill every exiting video immediately and hide controls.
    stopAllVideosExcept();
    activeVideo = null;
    setControlsVisible(frame, false);
  }

  bindGestureDriver();
};

const scheduleSync = () => {
  if (syncQueued) return;
  syncQueued = requestAnimationFrame(() => {
    syncQueued = 0;
    sync();
  });
};

new MutationObserver(scheduleSync).observe(document.body, { childList: true, subtree: true });
document.addEventListener('click', (event) => {
  if (suppressNextClick) {
    event.preventDefault();
    event.stopPropagation();
  }
}, true);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') stopAllVideosExcept();
});
window.addEventListener('pagehide', () => stopAllVideosExcept());

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scheduleSync, { once: true });
else scheduleSync();
