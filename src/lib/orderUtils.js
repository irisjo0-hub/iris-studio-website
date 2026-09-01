/**
 * Utility to generate clean, sequential order numbers starting from 1000.
 * Examples: ORD-1001, ORD-1002, GRAD-1003, BOOK-1004.
 */

const COUNTER_KEY = 'iris_order_sequence_counter';

export const getNextOrderNumber = (prefix = 'ORD') => {
  let currentSeq = 1000;

  try {
    const storedSeq = localStorage.getItem(COUNTER_KEY);
    if (storedSeq) {
      currentSeq = parseInt(storedSeq, 10);
    } else {
      let maxNum = 1000;
      ['iris_printing_orders', 'iris_graduation_orders', 'iris_bookings'].forEach(key => {
        try {
          const items = JSON.parse(localStorage.getItem(key) || '[]');
          if (Array.isArray(items)) {
            items.forEach(item => {
              const numMatch = String(item.order_number || item.id || '').match(/\d+/g);
              if (numMatch) {
                numMatch.forEach(n => {
                  const parsedN = parseInt(n, 10);
                  if (parsedN >= 1000 && parsedN < 999999) {
                    if (parsedN > maxNum) maxNum = parsedN;
                  }
                });
              }
            });
          }
        } catch (e) {}
      });
      currentSeq = maxNum;
    }
  } catch (err) {
    console.warn('Failed to calculate order sequence:', err);
  }

  const nextSeq = currentSeq + 1;
  try {
    localStorage.setItem(COUNTER_KEY, nextSeq.toString());
  } catch (e) {}

  return `${prefix}-${nextSeq}`;
};

/**
 * Format any order ID or timestamp string into a clean user-facing badge string.
 * Converts ord_1787467305966 to #ORD-5966 or clean format.
 */
export const formatOrderNumberDisplay = (orderObj) => {
  if (!orderObj) return '#ORD-1000';
  if (orderObj.order_number) return `#${orderObj.order_number.replace(/^#/, '')}`;
  if (typeof orderObj.id === 'string' && orderObj.id.startsWith('ORD-')) return `#${orderObj.id}`;
  if (typeof orderObj.id === 'string' && orderObj.id.startsWith('ord_')) {
    const digits = orderObj.id.replace(/\D/g, '');
    const shortCode = digits.length >= 4 ? digits.slice(-4) : '1000';
    return `#ORD-${shortCode}`;
  }
  return `#${String(orderObj.id || 'ORD-1000').replace(/^#/, '')}`;
};
