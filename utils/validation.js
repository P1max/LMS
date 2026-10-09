'use strict';

function parseId(value) {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    return null;
  }

  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function validatePayload(body, schema, { requireAll = false } = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'Request body must be a JSON object';
  }

  const fields = Object.keys(body);
  if (fields.length === 0) {
    return 'Request body must contain at least one field';
  }

  const unexpectedField = fields.find((field) => !schema[field]);
  if (unexpectedField) {
    return `Unexpected field "${unexpectedField}"`;
  }

  if (requireAll) {
    const missingField = Object.entries(schema).find(
      ([field, rules]) => rules.required && body[field] === undefined,
    );

    if (missingField) {
      return `Field "${missingField[0]}" is required`;
    }
  }

  for (const [field, value] of Object.entries(body)) {
    const rules = schema[field];

    if (rules.type === 'string') {
      if (typeof value !== 'string' || value.trim() === '') {
        return `Field "${field}" must be a non-empty string`;
      }
    } else if (rules.type === 'email') {
      if (
        typeof value !== 'string' ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
      ) {
        return `Field "${field}" must be a valid email address`;
      }
    } else if (rules.type === 'positiveNumber') {
      if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
        return `Field "${field}" must be a positive number`;
      }
    } else if (rules.type === 'positiveInteger') {
      if (!Number.isSafeInteger(value) || value <= 0) {
        return `Field "${field}" must be a positive integer`;
      }
    }

    if (rules.values && !rules.values.includes(value)) {
      return `Field "${field}" must be one of: ${rules.values.join(', ')}`;
    }
  }

  return null;
}

module.exports = { parseId, validatePayload };
