'use strict';

function validateSearchQuery(value, maxLength) {
  if (value === undefined) {
    return { error: null, search: '' };
  }

  if (typeof value !== 'string') {
    return { error: 'Параметр поиска должен содержать один текстовый запрос', search: '' };
  }

  if (value.length > maxLength) {
    return {
      error: `Поисковый запрос не должен превышать ${maxLength} символов`,
      search: '',
    };
  }

  return { error: null, search: value.trim() };
}

module.exports = validateSearchQuery;
