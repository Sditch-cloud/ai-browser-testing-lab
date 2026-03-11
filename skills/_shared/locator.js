'use strict';

function firstNonEmpty(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

function normalizeText(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function tokenize(...values) {
  const stopWords = new Set([
    'a',
    'an',
    'and',
    'be',
    'button',
    'capture',
    'check',
    'choose',
    'click',
    'confirm',
    'enter',
    'field',
    'fill',
    'for',
    'form',
    'input',
    'into',
    'message',
    'of',
    'on',
    'open',
    'page',
    'press',
    'screen',
    'screenshot',
    'see',
    'select',
    'should',
    'show',
    'submit',
    'success',
    'text',
    'the',
    'to',
    'verify',
    'visible',
    'wait',
    'with',
  ]);

  return [...new Set(
    values
      .filter(Boolean)
      .flatMap((value) => normalizeText(value).split(/[^a-z0-9]+/))
      .filter((token) => token && !stopWords.has(token))
  )];
}

function uniqueNonEmpty(values) {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))];
}

function describeLocator(locator) {
  if (locator.selector) return `selector "${locator.selector}"`;
  if (locator.testId) return `test id "${locator.testId}"`;
  if (locator.label) return `label "${locator.label}"`;
  if (locator.role && locator.name) return `role "${locator.role}" with name "${locator.name}"`;
  if (locator.placeholder) return `placeholder "${locator.placeholder}"`;
  if (locator.text) return `text "${locator.text}"`;
  return 'resolved locator';
}

function explicitLocatorFromDescriptor(descriptor = {}) {
  const locator = descriptor.locator && typeof descriptor.locator === 'object' ? descriptor.locator : {};

  const selector = firstNonEmpty(descriptor.selector, locator.selector);
  if (selector) return { locator: { selector }, strategy: 'selector' };

  const testId = firstNonEmpty(descriptor.testId, locator.testId);
  if (testId) return { locator: { testId }, strategy: 'testId' };

  const label = firstNonEmpty(descriptor.label, locator.label);
  if (label) return { locator: { label }, strategy: 'label' };

  const placeholder = firstNonEmpty(descriptor.placeholder, locator.placeholder);
  if (placeholder) return { locator: { placeholder }, strategy: 'placeholder' };

  const role = firstNonEmpty(descriptor.role, locator.role);
  const name = firstNonEmpty(descriptor.name, locator.name);
  if (role && name) return { locator: { role, name }, strategy: 'role' };

  const text = firstNonEmpty(descriptor.text, locator.text);
  if (text) return { locator: { text }, strategy: 'text' };

  return null;
}

function inferCssSelectorFromId(id) {
  if (/^[A-Za-z_][A-Za-z0-9_:\-.]*$/.test(id)) {
    return `#${id}`;
  }

  return `[id="${String(id).replace(/"/g, '\\"')}"]`;
}

function scoreCandidate(candidate, descriptor, target) {
  const queryTokens = tokenize(target, descriptor.description, descriptor.target);
  const queryText = normalizeText(target);
  const texts = uniqueNonEmpty([
    candidate.dataTestId,
    candidate.id,
    candidate.accessibleName,
    candidate.ariaLabel,
    candidate.placeholder,
    candidate.text,
    candidate.value,
    candidate.nameAttr,
    ...(Array.isArray(candidate.labels) ? candidate.labels : []),
  ]);

  let score = 0;

  for (const text of texts) {
    const normalized = normalizeText(text);
    const tokens = tokenize(text);

    if (!normalized) {
      continue;
    }

    if (queryText && normalized === queryText) {
      score += 30;
    }

    const overlap = queryTokens.filter((token) => tokens.includes(token)).length;
    score += overlap * (candidate.dataTestId ? 10 : 6);

    if (queryText && normalized.includes(queryText)) {
      score += 8;
    }
  }

  if (descriptor.type === 'click' && candidate.role === 'button') {
    score += 5;
  }

  if ((descriptor.type === 'fill' || descriptor.type === 'select') && ['textbox', 'searchbox', 'combobox'].includes(candidate.role)) {
    score += 5;
  }

  if (descriptor.type === 'hover' && candidate.role) {
    score += 2;
  }

  return score;
}

async function collectLocatorCandidates(page) {
  return page.evaluate(() => {
    const inferRole = (element) => {
      const tagName = element.tagName.toLowerCase();
      const type = (element.getAttribute('type') || '').toLowerCase();

      if (tagName === 'button') return 'button';
      if (tagName === 'a' && element.href) return 'link';
      if (tagName === 'select') return 'combobox';
      if (tagName === 'textarea') return 'textbox';
      if (tagName === 'input' && ['button', 'submit', 'reset'].includes(type)) return 'button';
      if (tagName === 'input' && type === 'checkbox') return 'checkbox';
      if (tagName === 'input' && type === 'radio') return 'radio';
      if (tagName === 'input' && type === 'search') return 'searchbox';
      if (tagName === 'input') return 'textbox';
      return element.getAttribute('role') || '';
    };

    const isVisible = (element) => {
      const style = window.getComputedStyle(element);
      return style.display !== 'none' && style.visibility !== 'hidden' && element.getClientRects().length > 0;
    };

    const elements = Array.from(document.querySelectorAll('input, textarea, select, button, a, [role], [data-testid]'));

    return elements
      .filter((element) => element instanceof HTMLElement && isVisible(element))
      .map((element) => {
        const labels = element.labels
          ? Array.from(element.labels).map((label) => (label.textContent || '').trim()).filter(Boolean)
          : [];

        const fallbackLabels = labels.length > 0
          ? labels
          : Array.from(document.querySelectorAll('label'))
              .filter((label) => label.htmlFor && label.htmlFor === element.id)
              .map((label) => (label.textContent || '').trim())
              .filter(Boolean);

        const ariaLabel = (element.getAttribute('aria-label') || '').trim();
        const placeholder = (element.getAttribute('placeholder') || '').trim();
        const text = ((element.innerText || element.textContent || '')).trim();
        const value = 'value' in element ? String(element.value || '').trim() : '';
        const nameAttr = (element.getAttribute('name') || '').trim();
        const dataTestId = (element.getAttribute('data-testid') || '').trim();
        const id = (element.id || '').trim();
        const role = (element.getAttribute('role') || '').trim() || inferRole(element);
        const accessibleName = [ariaLabel, ...fallbackLabels, text, placeholder, nameAttr].find(Boolean) || '';

        return {
          tagName: element.tagName.toLowerCase(),
          type: (element.getAttribute('type') || '').toLowerCase(),
          role,
          dataTestId,
          id,
          ariaLabel,
          placeholder,
          text,
          value,
          nameAttr,
          labels: fallbackLabels,
          accessibleName,
        };
      });
  });
}

function candidateToLocator(candidate) {
  if (candidate.dataTestId) {
    return { locator: { testId: candidate.dataTestId }, strategy: 'inferred:testId' };
  }

  const label = Array.isArray(candidate.labels) ? candidate.labels.find(Boolean) : '';
  if (label) {
    return { locator: { label }, strategy: 'inferred:label' };
  }

  if (candidate.role && candidate.accessibleName) {
    return {
      locator: { role: candidate.role, name: candidate.accessibleName },
      strategy: 'inferred:role',
    };
  }

  if (candidate.placeholder) {
    return { locator: { placeholder: candidate.placeholder }, strategy: 'inferred:placeholder' };
  }

  if (candidate.text) {
    return { locator: { text: candidate.text }, strategy: 'inferred:text' };
  }

  if (candidate.id) {
    return {
      locator: { selector: inferCssSelectorFromId(candidate.id) },
      strategy: 'inferred:selector',
    };
  }

  return null;
}

async function inferLocatorFromPage(descriptor, page) {
  const target = firstNonEmpty(descriptor.target, descriptor.description);
  if (!page || !target) {
    return null;
  }

  const candidates = await collectLocatorCandidates(page);
  const ranked = candidates
    .map((candidate) => ({ candidate, score: scoreCandidate(candidate, descriptor, target) }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score);

  if (ranked.length === 0 || ranked[0].score < 8) {
    return null;
  }

  if (ranked[1] && ranked[0].score - ranked[1].score < 3) {
    throw new Error(`Unable to uniquely resolve locator for target "${target}".`);
  }

  const resolved = candidateToLocator(ranked[0].candidate);
  if (!resolved) {
    return null;
  }

  return {
    locator: resolved.locator,
    strategy: resolved.strategy,
    detail: `Resolved ${describeLocator(resolved.locator)} from target "${target}"`,
  };
}

function getLocatorHandle(page, locator) {
  if (locator.selector) return page.locator(locator.selector);
  if (locator.testId) return page.getByTestId(locator.testId);
  if (locator.label) return page.getByLabel(locator.label, { exact: false });
  if (locator.role && locator.name) return page.getByRole(locator.role, { name: locator.name, exact: false });
  if (locator.placeholder) return page.getByPlaceholder(locator.placeholder, { exact: false });
  if (locator.text) return page.getByText(locator.text, { exact: false });
  throw new Error('No supported locator could be constructed.');
}

async function resolveDescriptorLocator(descriptor, context, options = {}) {
  const explicit = explicitLocatorFromDescriptor(descriptor);
  if (explicit) {
    return {
      locator: explicit.locator,
      strategy: explicit.strategy,
      detail: `Using ${describeLocator(explicit.locator)}`,
      handle: context && context.page ? getLocatorHandle(context.page, explicit.locator) : undefined,
    };
  }

  const inferred = await inferLocatorFromPage(descriptor, context && context.page);
  if (inferred) {
    return {
      ...inferred,
      handle: context && context.page ? getLocatorHandle(context.page, inferred.locator) : undefined,
    };
  }

  if (options.required !== false) {
    throw new Error(`No locator information found for ${options.subject || 'descriptor'}.`);
  }

  return null;
}

module.exports = {
  describeLocator,
  getLocatorHandle,
  resolveDescriptorLocator,
};
