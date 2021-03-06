'use strict';

/**
 * Module dependencies.
 */
const _ = require('lodash');
const { extractModuleLineAndColumn } = require('./parse-stack-trace');
var Base = require('mocha').reporters.Base;
var JSON = require('json3');
const stringify = a => require('json-stringify-safe')(a) + '\n';

/**
 * Expose `List`.
 */

exports = module.exports = MochaJsonStreamier;

/**
 * Initialize a new `MochaJsonStreamier` test reporter.
 *
 * @api public
 * @param {Runner} runner
 */
function MochaJsonStreamier(runner) {
  Base.call(this, runner);

  var self = this;
  var total = runner.total;

  runner.on('start', function() {
    process.stdout.write(stringify(['start', { total: total }]));
  });

  runner.on('pass', function(test) {
    process.stdout.write(stringify(['pass', clean(test)]));
  });

  runner.on('fail', function(test, err) {
    test = clean(test);
    const moduleLineColumn = extractModuleLineAndColumn(err.stack);
    _.merge(err, moduleLineColumn);
    test.err = cleanObjectForJSON(err);
    process.stdout.write(stringify(['fail', test]));
  });

  runner.on('end', function() {
    process.stdout.write(stringify(['end', self.stats]));
  });
}

/**
 * Return a plain-object representation of `test`
 * free of cyclic properties etc.
 *
 * @api private
 * @param {Object} test
 * @return {Object}
 */
function clean(test) {
  return {
    title: test.title,
    fullTitle: test.fullTitle(),
    duration: test.duration,
    currentRetry: test.currentRetry(),
  };
}

/**
 * Transform `error` into a JSON object.
 *
 * @api private
 * @param {Error} err
 * @return {Object}
 */
function cleanObjectForJSON(err) {
  var res = {};
  Object.getOwnPropertyNames(err).forEach(function(key) {
    if (err[key] !== null) {
      res[key] = err[key];
    }
  }, err);
  return res;
}
