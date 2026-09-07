import './styles/reels-enhancements.css';

const PROFILE_SELECTOR = '.reel-canvas-layer .instagram-caption-profile-row';
const STATIC_PROFILE_CLASS = 'reels-static-profile-header';
const CONTROLS_CLASS = 'iris-reel-media-controls';
const PLAY_BUTTON_CLASS = 'iris-reel-play-button';
const SOUND_BUTTON_CLASS = 'iris-reel-sound-button';
let syncQueued = false;
let activeVideo = null;

const getFrame = () => document.querySelector('.iris-reels-viewer-wrapper .reel-frame');
const getCanvasLayers = (frame = getFrame()) => Array.from(frame?.querySelectorAll(':scope > .reel-canvas-layer, .reel-canvas-layer') || []);
const getCurrentCanvas = (frame = getFrame()) => {
  const layers = getCanvasLayers(frame);
  return layers.length ? layers[layers.length - 1] : null;
};
const getVideos = () => Array.from(document.querySelectorAll('.iris-reels-viewer-wrapper .reel-canvas-layer video'));

const getActiveVideo = (frame = getFrame()) => {
  const currentCanvas = getCurrentCanvas(frame);
  return currentCanvas?.querySelector('video') || null;
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

      // React owns mute state. Reuse its existing control instead of mutating
      // the video directly, preventing React and this enhancement from fighting.
      const reactSoundButton = frame.querySelector('.reels-action-rail .reels-action-btn-group-single:nth-child(4) button');
      if (!reactSoundButton) return;
      reactSoundButton.click();
      window.requestAnimationFrame(() => {
        const current = getActiveVideo(frame);
        if (current) updateSoundButton(current);
      });
    });

    const playButton = document.createElement('button');
    playButton.type = 'button';
    playButton.className = PLAY_BUTTON_CLASS;
    playButton.innerHTML = icon('play');
    playButton.setAttribute('aria-label', 'تشغيل الريل');
    playButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const current = getActiveVideo(frame) || activeVideo;
      if (!current || current.closest('.reel-frame') !== frame) return;
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

  if (activeVideo) activeVideo.pause();
  activeVideo = video;
  buildControls(frame, video);
  stopAllVideosExcept(video);

  // Playback and mute are controlled by React. This enhancement only observes
  // the media element and provides the visual controls.
  video.addEventListener('play', () => {
    if (getActiveVideo(frame) !== video) {
      video.pause();
      return;
    }
    stopAllVideosExcept(video);
    setControlsVisible(frame, false);
  });

  video.addEventListener('pause', () => {
    if (getActiveVideo(frame) === video) setControlsVisible(frame, true);
  });

  video.addEventListener('volumechange', () => updateSoundButton(video));

  video.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (getActiveVideo(frame) !== video) return;
    video.pause();
    updateSoundButton(video);
  });
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
    stopAllVideosExcept();
    activeVideo = null;
    setControlsVisible(frame, false);
  }
};

const scheduleSync = () => {
  if (syncQueued) return;
  syncQueued = requestAnimationFrame(() => {
    syncQueued = 0;
    sync();
  });
};

new MutationObserver(scheduleSync).observe(document.body, { childList: true, subtree: true });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') stopAllVideosExcept();
});
window.addEventListener('pagehide', () => stopAllVideosExcept());

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scheduleSync, { once: true });
else scheduleSync();
