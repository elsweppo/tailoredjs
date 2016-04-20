'use strict';

/**
 * Registers listeners that produce output on process termination
 *
 * @param logger
 * @param moduleName
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerExitListeners = registerExitListeners;
exports.getDuration = getDuration;
exports.replaceTokens = replaceTokens;
function registerExitListeners(logger) {
  var moduleName = arguments.length <= 1 || arguments[1] === undefined ? 'module' : arguments[1];

  function getListener(sig) {
    return function () {
      logger.verbose('---- ' + moduleName + ' exiting via ' + sig + ' ----');
      process.exit();
    };
  }
  process.on('SIGTERM', getListener('SIGTERM'));
  process.on('SIGINT', getListener('SIGINT'));

  process.on('exit', function (code) {
    logger.info('++++ ' + moduleName + ' exiting with code ' + code + ' ++++');
  });

  logger.debug('Exit listeners registered.');
}

/**
 * Returns the difference between two Date objects in seconds - will instantiate a new Date object if no finish parameter is provided.
 *
 * @param start
 * @param finish
 */
function getDuration(start, finish) {
  return ((finish || new Date()) - start) / 1000;
}

/**
 * Replaces tokens in a string with values from the provided "replacements" object
 *
 * All tokens will be replaced with the values of the corresponding property in the replacements object, if such a
 * property exists (i.e. is not undefined). Otherwise, token literals will be returned.
 *
 * E.g.
 *
 * replaceTokens('this {fancyProp} will be replaced, {poorMe} will not', { fancyProp: 'strange thing' })
 * // -> "this strange thing will be replaced, {poorMe} will not"
 *
 * Why not just use str.replace() you ask? Glad you mention this.
 * str.replace() will come around to bite you in the arse as soon as the string you're trying to insert contains
 * regex special characters like '$' or '^' in the wrong places. E.g. passwords ending with two dollar signs will
 * suddenly end with only one, if the replaced token happens to be at the end of the string. This makes login attempts
 * using such passwords somewhat difficult.
 * Why not just use a regex escaping module then, I hear you say. Well, because escaping these special characters
 * will, for reasons unknown to me, subsequently include the escape characters in the resulting string. Which, again,
 * complicates matters when we're dealing with passwords. Attempt to .replace() "{token}" with "pa$$" in the string
 * "password={token}" and you'll end up with "password=pa\\$\\$". Maddening.
 *
 * @param str
 * @param replacements
 * @param tokenStart
 * @param tokenEnd
 * @returns {string}
 */
function replaceTokens(str, replacements) {
  var tokenStart = arguments.length <= 2 || arguments[2] === undefined ? '{' : arguments[2];
  var tokenEnd = arguments.length <= 3 || arguments[3] === undefined ? '}' : arguments[3];

  return str.split(/(\{[a-z]+\})/i).map(function (part) {
    if (part.startsWith(tokenStart) && part.endsWith(tokenEnd)) {
      var token = part.substring(1, part.length - 1);

      if (typeof replacements[token] !== 'undefined') {
        return replacements[token];
      }
    }

    return part;
  }).join('');
}