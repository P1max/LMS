'use strict';

function parseId(value) {
  if (typeof value !== 'string' || value.length > 16 || !/^\d+$/.test(value)) {
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
      if (rules.maxLength && value.length > rules.maxLength) {
        return `Field "${field}" must not exceed ${rules.maxLength} characters`;
      }
    } else if (rules.type === 'email') {
      if (
        typeof value !== 'string' ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
      ) {
        return `Field "${field}" must be a valid email address`;
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        return `Field "${field}" must not exceed ${rules.maxLength} characters`;
      }
    } else if (rules.type === 'positiveNumber') {
      if (
        typeof value !== 'number' ||
        !Number.isFinite(value) ||
        value < (rules.minimum ?? Number.MIN_VALUE) ||
        (rules.maximum !== undefined && value > rules.maximum)
      ) {
        return `Field "${field}" must be between ${rules.minimum ?? 0} and ${rules.maximum ?? 'the allowed limit'}`;
      }
    } else if (rules.type === 'positiveInteger') {
      if (
        !Number.isSafeInteger(value) ||
        value < (rules.minimum ?? 1) ||
        (rules.maximum !== undefined && value > rules.maximum)
      ) {
        return `Field "${field}" must be an integer between ${rules.minimum ?? 1} and ${rules.maximum ?? 'the allowed limit'}`;
      }
    }

    if (rules.values && !rules.values.includes(value)) {
      return `Field "${field}" must be one of: ${rules.values.join(', ')}`;
    }
  }

  return null;
}

module.exports = { parseId, validatePayload };
