/**
 * Makes a random string of specific length.
 * @param {number} length - length of string.
 * @returns {string} random string.
 * @example Util.hexToInt(5): a8snu
 */
 export default function randomString(length: number): string {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) result += characters.charAt(Math.floor(Math.random() * charactersLength));
  return result;
}
