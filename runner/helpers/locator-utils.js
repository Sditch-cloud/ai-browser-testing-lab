'use strict';

const LOCATOR_DESCRIPTOR_FIELDS = ['selector', 'testId', 'label', 'role', 'name', 'text', 'placeholder', 'locator'];
const STEP_TYPES_WITH_LOCATOR = new Set(['click', 'fill', 'select', 'hover']);
const ASSERTION_TYPES_WITH_LOCATOR = new Set([
  'element-visible',
  'element-text',
  'element-count',
  'attribute-equals',
]);

function hasExplicitLocator(descriptor = {}) {
  return LOCATOR_DESCRIPTOR_FIELDS.some((field) => descriptor[field] !== undefined && descriptor[field] !== '');
}

/**
 * Determines whether a step or assertion needs AI locator resolution.
 * Descriptors with explicit locator fields skip resolution to avoid overriding
 * user intent.
 *
 * @param {object} descriptor
 * @returns {boolean}
 */
function needsLocatorResolution(descriptor = {}) {
  if (!descriptor || typeof descriptor !== 'object') {
    return false;
  }

  if (hasExplicitLocator(descriptor)) {
    return false;
  }

  if (descriptor.type === 'wait') {
    return Boolean(descriptor.target);
  }

  if (STEP_TYPES_WITH_LOCATOR.has(descriptor.type) || ASSERTION_TYPES_WITH_LOCATOR.has(descriptor.type)) {
    return Boolean(descriptor.target || descriptor.description);
  }

  return false;
}

function applyResolvedLocator(descriptor, resolved = {}) {
  if (!resolved.locator || typeof resolved.locator !== 'object') {
    return { ...descriptor };
  }

  return {
    ...descriptor,
    ...resolved.locator,
  };
}

module.exports = {
  applyResolvedLocator,
  hasExplicitLocator,
  needsLocatorResolution,
};