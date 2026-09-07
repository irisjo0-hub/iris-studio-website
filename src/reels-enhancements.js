import './styles/reels-enhancements.css';

const PROFILE_SELECTOR = '.reel-canvas-layer .instagram-caption-profile-row';
const STATIC_PROFILE_CLASS = 'reels-static-profile-header';
const CONTROLS_CLASS = 'iris-reel-media-controls';
const PLAY_BUTTON_CLASS = 'iris-reel-play-button';
const SOUND_BUTTON_CLASS = 'iris-reel-sound-button';
let syncQueued = false;
let activeVideo = null;

const getFrame = () => document.querySelector('.iris-reels-viewer-wrapper .reel-frame');
const getVideos = () => Array.from(document.querySelectorAll('.iris-reels-viewer-wrapper .reel-canvas-layer video'));
const getActiveVideo = () => {
  const videos = getVideos();
  return videos.length ? videos[videos.length - 1] : null;
};

const icon = (name) => {
  if (name === 'play') {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6c0 .8.9 1.3 1.6.8l10-6.8a1 1 0 0 0 0-1.6l-10-6.8A1 1 0 0 0 8 5.2Z" fill="currentColor"/></svg>';
  }
  if (name === 'muted') {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><path d="m17 9 4 6M21 9l-4 6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>';
  }
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><path d="M17 9a5 5 0 0 1 0 6M19.8 6.4a9 9 0 0 1 0 11.2" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>';
};

const stopAllInactiveVideos = (keep = null) => {
  getVideos().forEach((video) => {
    if (video === keep) return;
    video.pause();
    video.muted = true;
  });
};

const setControlsVisible = (frame, visible) => {
  frame?.querySelector(`.${CONTROLS_CLASS}`)?.classList.toggle('is-visible', visible);
};

const updateSoundButton = (video) => {
  const button = video?.closest('.reel-frame')?.querySelector(`.${SOUND_BUTTON_CLASS}`);
  if (!button) return;
  button.innerHTML = video.muted ? icon('muted') : icon('volume');
  button.setAttribute('aria-label', video.muted ? 'تشغيل الصوت' : 'كتم الصوت');
  button.setAttribute('title', video.muted ? 'تشغيل الصوت' : 'كتم الصوت');
};

const buildControls = (frame, video) => {
  const layer = frame?.querySelector('.reels-persistent-ui-layer');
  if (!layer || !video) return;
  let controls = layer.querySelector(`.${CONTROLS_CLASS}`);
  if (controls) return;

  controls = document.createElement('div');
  controls.className = CONTROLS_CLASS;

  const soundButton = document.createElement('button');
  soundButton.type = 'button';
  soundButton.className = SOUND_BUTTON_CLASS;
  soundButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const current = getActiveVideo();
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
    const current = getActiveVideo();
    if (!current) return;
    stopAllInactiveVideos(current);
    current.play().then(() => setControlsVisible(frame, false)).catch(() => {});
  });

  controls.append(soundButton, playButton);
  layer.appendChild(controls);
  updateSoundButton(video);
};

const bindVideo = (video) => {
  if (!video || video === activeVideo) return;
  if (activeVideo) {
    activeVideo.pause();
    activeVideo.muted = true;
  }
  activeVideo = video;

  const frame = video.closest('.reel-frame');
  buildControls(frame, video);
  stopAllInactiveVideos(video);

  // Every newly entered Reel starts with sound on.
  video.muted = false;
  video.defaultMuted = false;

  const onPlay = () => {
    stopAllInactiveVideos(video);
    setControlsVisible(frame, false);
  };
  const onPause = () => setControlsVisible(frame, true);
  const onVolumeChange = () => updateSoundButton(video);
  const onClick = (event) => {
    if (event.defaultPrevented) return;
    if (video === getActiveVideo()) video.pause();
  };

  video.addEventListener('play', onPlay);
  video.addEventListener('pause', onPause);
  video.addEventListener('volumechange', onVolumeChange);
  video.addEventListener('click', onClick);

  const start = () => {
    if (video !== getActiveVideo()) return;
    stopAllInactiveVideos(video);
    video.muted = false;
    video.play().then(() => setControlsVisible(frame, false)).catch(() => setControlsVisible(frame, true));
  };
  video.addEventListener('loadedmetadata', start, { once: true });
  start();
};

const sync = () => {
  const frame = getFrame();
  if (!frame) {
    stopAllInactiveVideos();
    activeVideo = null;
    return;
  }

  // Keep the original profile node in the persistent overlay without cloning it.
  const layer = frame.querySelector('.reels-persistent-ui-layer');
  const source = frame.querySelector(PROFILE_SELECTOR) || layer?.querySelector(`.${STATIC_PROFILE_CLASS}`);
  if (source && layer) {
    source.classList.add(STATIC_PROFILE_CLASS);
    source.style.setProperty('bottom', '104px', 'important');
    source.style.setProperty('top', 'auto', 'important');
    source.style.setProperty('transition', 'none', 'important');
    if (source.parentElement !== layer) layer.appendChild(source);
  }

  const nextVideo = getActiveVideo();
  if (nextVideo) bindVideo(nextVideo);
  else {
    stopAllInactiveVideos();
    activeVideo = null;
  }
};

const scheduleSync = () => {
  if (syncQueued) return;
  syncQueued = requestAnimationFrame(() => {
    syncQueued = 0;
    sync();
  });
};

const observer = new MutationObserver(scheduleSync);
observer.observe(document.body, { childList: true, subtree: true });

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') stopAllInactiveVideos();
});
window.addEventListener('pagehide', () => stopAllInactiveVideos());

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleSync, { once: true });
} else {
  scheduleSync();
}
