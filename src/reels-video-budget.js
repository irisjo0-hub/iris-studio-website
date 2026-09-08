// Phase 3B: keep AnimatePresence exit videos from consuming playback resources.
// This is intentionally scoped to the reels frame; it does not alter navigation or gestures.

const syncReelVideoBudget = (frame) => {
  const canvases = frame.querySelectorAll('.reel-canvas-layer');
  if (!canvases.length) return;

  const activeCanvas = canvases[canvases.length - 1];
  const videos = frame.querySelectorAll('.reel-canvas-layer video');

  videos.forEach((video) => {
    if (video.closest('.reel-canvas-layer') !== activeCanvas) {
      video.pause();
      video.preload = 'metadata';
    }
  });
};

const observeReelVideoBudget = () => {
  const frame = document.querySelector('.reel-frame');
  if (!frame) return false;

  const run = () => syncReelVideoBudget(frame);
  run();

  const observer = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.type === 'childList')) {
      requestAnimationFrame(run);
    }
  });

  observer.observe(frame, { childList: true, subtree: true });
  return true;
};

if (!observeReelVideoBudget()) {
  const bootObserver = new MutationObserver(() => {
    if (observeReelVideoBudget()) bootObserver.disconnect();
  });
  bootObserver.observe(document.body, { childList: true, subtree: true });
}
