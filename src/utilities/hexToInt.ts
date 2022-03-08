/**
 * Converts hex color value to int color.
 * @param {string} hex - color hex value.
 * @returns {number} color int value.
 * @example Util.hexToInt('246bce'): 2386894
 */
export default function hexToInt(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}
