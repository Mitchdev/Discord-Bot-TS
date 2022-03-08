/**
 * capitalize the first character in a string.
 * @param {string} string string to capitalize.
 * @returns {string} returns capitalized string.
 * @example Util.capitalze('hello world'): 'Hello world'
 */
export default function capitalize(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
