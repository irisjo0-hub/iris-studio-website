const CALENDAR_SECTION_SELECTOR = '.calendar-picker-section';
const CALENDAR_READY_ATTR = 'data-iris-calendar-picker';

const formatTriggerDate = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return 'اضغط لاختيار الموعد';

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

const getTriggerMarkup = (selected) => `
  <span class="iris-calendar-trigger-icon" aria-hidden="true">📅</span>
  <span class="iris-calendar-trigger-copy">
    <span class="iris-calendar-trigger-label">${selected ? 'تاريخ الجلسة' : 'اختر تاريخ الجلسة'}</span>
    <strong>${formatTriggerDate(selected)}</strong>
  </span>
  <span class="iris-calendar-trigger-chevron" aria-hidden="true">←</span>
`;

const syncTrigger = (section, trigger) => {
  const selected = getSelectedDate(section);
  const markup = getTriggerMarkup(selected);

  trigger.classList.toggle('has-value', Boolean(selected));

  // Important: MutationObserver watches this section. Never rewrite trigger.innerHTML
  // when nothing actually changed, otherwise the observer can trigger itself forever.
  if (trigger.innerHTML !== markup) {
    trigger.innerHTML = markup;
  }
};

const lockBody = () => {
  document.body.classList.add('iris-calendar-body-lock');
};

const unlockBody = () => {
  document.body.classList.remove('iris-calendar-body-lock');
};

const closeCalendar = (section, trigger) => {
  section.classList.remove('calendar-expanded');
  section.classList.add('calendar-collapsed');
  trigger?.setAttribute('aria-expanded', 'false');
  unlockBody();
  if (trigger) syncTrigger(section, trigger);
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
  syncTrigger(section, trigger);

  const backdrop = document.createElement('div');
  backdrop.className = 'iris-calendar-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'iris-calendar-close';
  closeButton.setAttribute('aria-label', 'إغلاق اختيار التاريخ');
  closeButton.textContent = '×';

  section.insertBefore(trigger, calendar);
  section.appendChild(backdrop);
  section.appendChild(closeButton);
  closeCalendar(section, trigger);

  trigger.addEventListener('click', () => openCalendar(section, trigger));
  backdrop.addEventListener('click', () => closeCalendar(section, trigger));
  closeButton.addEventListener('click', () => closeCalendar(section, trigger));

  section.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const dayButton = target.closest('.day-btn');
    if (dayButton && !dayButton.disabled && section.classList.contains('calendar-expanded')) {
      // Let React finish updating selectedDate first, then close the modal.
      window.setTimeout(() => closeCalendar(section, trigger), 0);
    }
  });

  section.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && section.classList.contains('calendar-expanded')) {
      closeCalendar(section, trigger);
    }
  });

  const stateObserver = new MutationObserver(() => syncTrigger(section, trigger));
  stateObserver.observe(section, {
    childList: true,
    subtree: true,
    characterData: true
  });
};

const initIrisCalendarPicker = () => {
  document.querySelectorAll(CALENDAR_SECTION_SELECTOR).forEach(wireCalendarSection);
};

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const start = () => {
    initIrisCalendarPicker();
    const observer = new MutationObserver(initIrisCalendarPicker);
    observer.observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
}

export default initIrisCalendarPicker;
