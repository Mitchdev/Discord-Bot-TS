/**
 * Converts rgb color values to int color.
 * @param {number} red - color red value.
 * @param {number} green color green value.
 * @param {number} blue  color blue value.
 * @returns {number} color int value.
 * @example Util.hexToInt(36, 107, 206): 2386894
 */
export default function rgbToInt(red: number, green: number, blue: number): number {
  return (red << 16) + (green << 8) + blue;
}
