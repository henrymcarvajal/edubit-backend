// FROM https://it.knightnet.org.uk/kb/node-js/get-properties/
import { MissingPropertyError } from './error.mjs';

/** Get a nested property from an object without returning any errors.
 * If the property or property chain doesn't exist, undefined is returned.
 * Property names with spaces may use either dot or bracket "[]" notation.
 * Note that bracketed property names without surrounding quotes will fail the lookup.
 *      e.g. embedded variables are not supported.
 * @param {object} obj The object to check
 * @param {string} prop The property or property chain to get (e.g. obj.prop1.prop1a or obj['prop1'].prop2)
 * @returns {*|undefined} The value of the objects property or undefined if the property doesn't exist
 */
export const getProp = (obj, prop) => {
  if (typeof obj !== 'object') throw 'getProp: obj is not an object'
  if (typeof prop !== 'string') throw 'getProp: prop is not a string'

  // Replace [] notation with dot notation
  prop = prop.replace(/[["'`](.*)["'`]]/g,".$1")

  return prop.split('.').reduce(function(prev, curr) {
    return prev ? prev[curr] : undefined
  }, obj || self)
} // --- end of fn getProp() --- //

export const checkProps = (body, props) => {
  for (const prop of props) {
    if (!getProp(body, prop)) {
      throw new MissingPropertyError(`Falta propiedad: ${prop}`);
    }
  }
};