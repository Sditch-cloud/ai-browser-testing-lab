'use strict';

const { resolveLocator } = require('../execution/resolve-locator');
const { parseTestCase } = require('./parse-test-case');
const { executeStepAction } = require('../_services/step-action-executor');
const { executeAssertion } = require('../_services/assertion-executor');
const { logRecorder } = require('../_services/log-recorder');
const { beforeTest } = require('../lifecycle/before-test');
const { afterTest } = require('../lifecycle/after-test');
const { onError } = require('../lifecycle/on-error');
const reporters = require('../reporters');

/**
 * Builds the dependency bag consumed by the runner.
 * It accepts both legacy override names and clearer internal names so tests and
 * phased refactors can move independently.
 *
 * @param {object} [customDependencies]
 * @returns {{skills: object, hooks: object, reporters: object}}
 */
function createRunnerDependencies(customDependencies = {}) {
  const customSkills = customDependencies.skills || {};
  const customHooks = customDependencies.hooks || {};
  const customReporters = customDependencies.reporters || {};

  return {
    skills: {
      parseTestCase: customSkills.parseTestCase || parseTestCase,
      resolveLocator: customSkills.resolveLocator || resolveLocator,
      executeStepAction: customSkills.executeStepAction || customSkills.browserAction || executeStepAction,
      executeAssertion: customSkills.executeAssertion || customSkills.assert || executeAssertion,
      recordLog: customSkills.recordLog || customSkills.logRecorder || logRecorder,
    },
    hooks: {
      beforeTest: customHooks.beforeTest || beforeTest,
      afterTest: customHooks.afterTest || afterTest,
      onError: customHooks.onError || onError,
    },
    reporters: {
      ...reporters,
      ...customReporters,
    },
  };
}

module.exports = {
  createRunnerDependencies,
};