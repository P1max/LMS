'use strict';

function validateStatusQuery(value, allowedStatuses) {
  if (value === undefined || value === '') {
    return { error: null, status: '' };
  }

  if (typeof value !== 'string') {
    return {
      error: 'Параметр статуса должен содержать одно значение',
      status: '',
    };
  }

  if (!allowedStatuses.includes(value)) {
    return {
      error: 'Указан недопустимый статус курса',
      status: '',
    };
  }

  return { error: null, status: value };
}

module.exports = validateStatusQuery;
