/**
 * Converts hex color value to int color.
 * @param {string} hex - color hex value
 * @returns {number} color int value.
 */
export default function hexToInt(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}
