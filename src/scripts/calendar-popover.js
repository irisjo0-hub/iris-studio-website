/* IRIS booking calendar popover enhancer.
 * Keeps the existing React calendar logic untouched, but turns its visual container
 * into a compact trigger that opens the full calendar as a polished modal.
 */
(() => {
  const READY_ATTR = 'data-iris-calendar-popover-ready';

  const getSelectedDate = (section) => {
    const value = section.querySelector('.selected-date-display strong')?.textContent?.trim();
    return value || '';
  };

  const enhanceSection = (section) => {
    if (!section || section.getAttribute(READY_ATTR) === 'true') return;

    const calendar = section.querySelector('.custom-calendar-box');
    if (!calendar) return;

    section.setAttribute(READY_ATTR, 'true');
    section.classList.add('iris-calendar-popover-section');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'iris-calendar-trigger';
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-expanded', 'false');

    const updateTrigger = () => {
      const selected = getSelectedDate(section);
      trigger.innerHTML = `
        <span class="iris-calendar-trigger-icon" aria-hidden="true">📅</span>
        <span class="iris-calendar-trigger-copy">
          <span class="iris-calendar-trigger-label">${selected ? 'تاريخ الجلسة' : 'اختر تاريخ الجلسة'}</span>
          <strong>${selected || 'اضغط لاختيار الموعد'}</strong>
        </span>
        <span class="iris-calendar-trigger-chevron" aria-hidden="true">←</span>
      `;
    };
    updateTrigger();

    const backdrop = document.createElement('div');
    backdrop.className = 'iris-calendar-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'iris-calendar-close';
    closeButton.setAttribute('aria-label', 'إغلاق التقويم');
    closeButton.textContent = '×';

    const open = () => {
      section.classList.add('iris-calendar-is-open');
      trigger.setAttribute('aria-expanded', 'true');
      document.body.classList.add('iris-calendar-body-lock');
    };

    const close = () => {
      section.classList.remove('iris-calendar-is-open');
      trigger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('iris-calendar-body-lock');
      updateTrigger();
    };

    trigger.addEventListener('click', open);
    backdrop.addEventListener('click', close);
    closeButton.addEventListener('click', close);

    section.appendChild(trigger);
    section.appendChild(backdrop);
    section.appendChild(closeButton);

    section.addEventListener('click', (event) => {
      const dayButton = event.target.closest('.day-btn');
      if (!dayButton || dayButton.disabled || !section.classList.contains('iris-calendar-is-open')) return;
      window.setTimeout(close, 0);
    });

    section.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && section.classList.contains('iris-calendar-is-open')) {
        close();
      }
    });

    const observer = new MutationObserver(() => updateTrigger());
    observer.observe(section, { subtree: true, childList: true, characterData: true });
  };

  const scan = () => {
    document.querySelectorAll('.calendar-picker-section').forEach(enhanceSection);
  };

  const observer = new MutationObserver(scan);
  observer.observe(document.body, { childList: true, subtree: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scan, { once: true });
  } else {
    scan();
  }
})();
