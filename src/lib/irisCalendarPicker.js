const CALENDAR_SECTION_SELECTOR = '.calendar-picker-section';
const CALENDAR_READY_ATTR = 'data-iris-calendar-picker';

const syncCalendarState = (section) => {
  const hasSelectedDate = Boolean(section.querySelector('.selected-date-display'));
  section.classList.toggle('has-selected-date', hasSelectedDate);
};

const collapseCalendar = (section) => {
  syncCalendarState(section);
  section.classList.remove('calendar-expanded');
  section.classList.add('calendar-collapsed');
};

const expandCalendar = (section) => {
  syncCalendarState(section);
  section.classList.remove('calendar-collapsed');
  section.classList.add('calendar-expanded');
};

const wireCalendarSection = (section) => {
  if (!(section instanceof HTMLElement) || section.getAttribute(CALENDAR_READY_ATTR)) return;

  section.setAttribute(CALENDAR_READY_ATTR, 'true');
  collapseCalendar(section);

  section.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const dayButton = target.closest('.day-btn');
    const title = target.closest('.cal-title');

    if (section.classList.contains('calendar-collapsed')) {
      expandCalendar(section);
      return;
    }

    if (dayButton) {
      window.setTimeout(() => collapseCalendar(section), 0);
      return;
    }

    if (title) {
      collapseCalendar(section);
    }
  });

  const observer = new MutationObserver(() => syncCalendarState(section));
  observer.observe(section, { childList: true, subtree: true });
};

const initIrisCalendarPicker = () => {
  document.querySelectorAll(CALENDAR_SECTION_SELECTOR).forEach(wireCalendarSection);
};

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  initIrisCalendarPicker();

  const observer = new MutationObserver(initIrisCalendarPicker);
  observer.observe(document.body, { childList: true, subtree: true });
}

export default initIrisCalendarPicker;
