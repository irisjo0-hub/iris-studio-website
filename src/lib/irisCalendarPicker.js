const CALENDAR_SECTION_SELECTOR = '.calendar-picker-section';
const CALENDAR_READY_ATTR = 'data-iris-calendar-picker';

const formatTriggerDate = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return 'اختر التاريخ المناسب';

  const parts = raw.split('-');
  if (parts.length !== 3) return raw;

  const [year, month, day] = parts;
  const months = [
    'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران',
    'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'
  ];

  const monthIndex = Number(month) - 1;
  return Number.isInteger(monthIndex) && months[monthIndex]
    ? `${day} ${months[monthIndex]} ${year}`
    : raw;
};

const getSelectedDate = (section) =>
  section.querySelector('.selected-date-display strong')?.textContent?.trim() || '';

const CALENDAR_ICON_SVG = `
  <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
    <path d="M8 14h.01" />
    <path d="M12 14h.01" />
    <path d="M16 14h.01" />
    <path d="M8 18h.01" />
    <path d="M12 18h.01" />
    <path d="M16 18h.01" />
  </svg>
`;

const syncTrigger = (section, trigger, valueNode) => {
  const selected = getSelectedDate(section);
  trigger.classList.toggle('has-value', Boolean(selected));
  if (valueNode) valueNode.textContent = formatTriggerDate(selected);
};

const lockBody = () => document.body.classList.add('iris-calendar-body-lock');
const unlockBody = () => document.body.classList.remove('iris-calendar-body-lock');

const closeCalendar = (section, trigger, valueNode) => {
  section.classList.remove('calendar-expanded');
  section.classList.add('calendar-collapsed');
  trigger?.setAttribute('aria-expanded', 'false');
  unlockBody();
  if (trigger && valueNode) syncTrigger(section, trigger, valueNode);
};

const openCalendar = (section, trigger) => {
  section.classList.remove('calendar-collapsed');
  section.classList.add('calendar-expanded');
  trigger.setAttribute('aria-expanded', 'true');
  lockBody();
};

const wireCalendarSection = (section) => {
  if (!(section instanceof HTMLElement) || section.getAttribute(CALENDAR_READY_ATTR)) return;

  const calendar = section.querySelector('.custom-calendar-box');
  if (!calendar) return;

  section.setAttribute(CALENDAR_READY_ATTR, 'true');
  section.classList.add('iris-calendar-popover-section');

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'iris-calendar-trigger';
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-label', 'فتح اختيار تاريخ الجلسة');

  const icon = document.createElement('span');
  icon.className = 'iris-calendar-trigger-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.innerHTML = CALENDAR_ICON_SVG;

  const copy = document.createElement('span');
  copy.className = 'iris-calendar-trigger-copy';

  const labelNode = document.createElement('span');
  labelNode.className = 'iris-calendar-trigger-label';
  labelNode.textContent = 'تاريخ الجلسة';

  const valueNode = document.createElement('strong');
  copy.append(labelNode, valueNode);

  const action = document.createElement('span');
  action.className = 'iris-calendar-trigger-chevron';
  action.setAttribute('aria-hidden', 'true');

  trigger.append(icon, copy, action);
  section.insertBefore(trigger, calendar);

  const backdrop = document.createElement('div');
  backdrop.className = 'iris-calendar-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'iris-calendar-close';
  closeButton.setAttribute('aria-label', 'إغلاق اختيار التاريخ');
  closeButton.textContent = '×';

  section.append(backdrop, closeButton);
  syncTrigger(section, trigger, valueNode);
  closeCalendar(section, trigger, valueNode);

  trigger.addEventListener('click', () => openCalendar(section, trigger));
  backdrop.addEventListener('click', () => closeCalendar(section, trigger, valueNode));
  closeButton.addEventListener('click', () => closeCalendar(section, trigger, valueNode));

  section.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const dayButton = target.closest('.day-btn');
    if (dayButton && !dayButton.disabled && section.classList.contains('calendar-expanded')) {
      window.setTimeout(() => closeCalendar(section, trigger, valueNode), 0);
    }
  });

  section.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && section.classList.contains('calendar-expanded')) {
      closeCalendar(section, trigger, valueNode);
    }
  });
};

let initScheduled = false;
const scheduleInit = () => {
  if (initScheduled) return;
  initScheduled = true;
  const run = () => {
    initScheduled = false;
    document.querySelectorAll(CALENDAR_SECTION_SELECTOR).forEach(wireCalendarSection);
  };

  if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
    window.requestAnimationFrame(run);
  } else {
    setTimeout(run, 0);
  }
};

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const start = () => {
    scheduleInit();

    // Observe only the React root. The previous body-wide observer reacted to
    // unrelated DOM changes across the entire application.
    const root = document.getElementById('root') || document.body;
    const observer = new MutationObserver(scheduleInit);
    observer.observe(root, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
}

export default scheduleInit;
