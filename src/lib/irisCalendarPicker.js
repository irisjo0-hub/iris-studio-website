import React from 'react';
import { createRoot } from 'react-dom/client';
import { CalendarDays } from 'lucide-react';

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

const syncTrigger = (section, trigger, labelNode, valueNode) => {
  const selected = getSelectedDate(section);
  trigger.classList.toggle('has-value', Boolean(selected));
  labelNode.textContent = 'تاريخ الجلسة';
  valueNode.textContent = formatTriggerDate(selected);
};

const lockBody = () => {
  document.body.classList.add('iris-calendar-body-lock');
};

const unlockBody = () => {
  document.body.classList.remove('iris-calendar-body-lock');
};

const closeCalendar = (section, trigger, labelNode, valueNode) => {
  section.classList.remove('calendar-expanded');
  section.classList.add('calendar-collapsed');
  trigger?.setAttribute('aria-expanded', 'false');
  unlockBody();
  if (trigger && labelNode && valueNode) syncTrigger(section, trigger, labelNode, valueNode);
};

const openCalendar = (section, trigger) => {
  section.classList.remove('calendar-collapsed');
  section.classList.add('calendar-expanded');
  trigger.setAttribute('aria-expanded', 'true');
  lockBody();
};

const mountCalendarIcon = (host) => {
  const root = createRoot(host);
  root.render(
    React.createElement(CalendarDays, {
      size: 21,
      strokeWidth: 1.8,
      'aria-hidden': true,
      focusable: false,
    })
  );
  return root;
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

  const iconHost = document.createElement('span');
  iconHost.className = 'iris-calendar-trigger-icon';
  iconHost.setAttribute('aria-hidden', 'true');
  mountCalendarIcon(iconHost);

  const copy = document.createElement('span');
  copy.className = 'iris-calendar-trigger-copy';

  const labelNode = document.createElement('span');
  labelNode.className = 'iris-calendar-trigger-label';

  const valueNode = document.createElement('strong');

  copy.append(labelNode, valueNode);

  const action = document.createElement('span');
  action.className = 'iris-calendar-trigger-chevron';
  action.setAttribute('aria-hidden', 'true');

  trigger.append(iconHost, copy, action);
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
  syncTrigger(section, trigger, labelNode, valueNode);
  closeCalendar(section, trigger, labelNode, valueNode);

  trigger.addEventListener('click', () => openCalendar(section, trigger));
  backdrop.addEventListener('click', () => closeCalendar(section, trigger, labelNode, valueNode));
  closeButton.addEventListener('click', () => closeCalendar(section, trigger, labelNode, valueNode));

  section.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const dayButton = target.closest('.day-btn');
    if (dayButton && !dayButton.disabled && section.classList.contains('calendar-expanded')) {
      window.setTimeout(() => closeCalendar(section, trigger, labelNode, valueNode), 0);
    }
  });

  section.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && section.classList.contains('calendar-expanded')) {
      closeCalendar(section, trigger, labelNode, valueNode);
    }
  });

  const stateObserver = new MutationObserver(() => {
    if (section.isConnected) syncTrigger(section, trigger, labelNode, valueNode);
  });
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
