'use strict';

const { attributeEquals } = require('./attribute-equals');
const { elementCount } = require('./element-count');
const { elementText } = require('./element-text');
const { elementVisible } = require('./element-visible');
const { titleEquals } = require('./title-equals');
const { urlContains } = require('./url-contains');

module.exports = {
  'attribute-equals': attributeEquals,
  'element-count': elementCount,
  'element-text': elementText,
  'element-visible': elementVisible,
  'title-equals': titleEquals,
  'url-contains': urlContains,
};
