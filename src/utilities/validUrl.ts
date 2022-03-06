/**
 * Tests if string is a url or not.
 * @param {string} url string to test.
 * @returns {boolean} returns if string is url or not.
 */
export default function validUrl(url: string): boolean {
  try {
    const validURL = new URL(url);
    return (validURL?.protocol === 'http:' || validURL?.protocol === 'https:');
  } catch (_) {
    return false;
  }
}
