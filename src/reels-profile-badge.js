/* Dedicated persistent Reel profile element. It is separate from the sliding Reel canvas. */
const BADGE_CLASS = 'iris-reels-profile-badge';

const mountProfileBadge = () => {
  const layer = document.querySelector('.iris-reels-viewer-wrapper .reels-persistent-ui-layer');
  if (!layer || layer.querySelector(`.${BADGE_CLASS}`)) return;

  const sourceLogo = document.querySelector('.instagram-avatar-img');
  if (!sourceLogo) return;

  const badge = document.createElement('div');
  badge.className = BADGE_CLASS;
  badge.setAttribute('aria-hidden', 'true');

  const logo = sourceLogo.cloneNode(true);
  logo.className = 'iris-reels-profile-badge__logo';
  logo.removeAttribute('alt');

  const meta = document.createElement('div');
  meta.className = 'iris-reels-profile-badge__meta';

  const name = document.createElement('span');
  name.className = 'iris-reels-profile-badge__name';
  name.textContent = 'IRIS HOME';

  const handle = document.createElement('span');
  handle.className = 'iris-reels-profile-badge__handle';
  handle.textContent = '@iris.jo';

  meta.append(name, handle);
  badge.append(logo, meta);
  layer.appendChild(badge);
};

const appRoot = document.getElementById('root');
const observerTarget = appRoot || document.body;
const observer = new MutationObserver(() => mountProfileBadge());
observer.observe(observerTarget, { childList: true, subtree: true });

mountProfileBadge();
