/**
 * Converts rgb color values to int color.
 * @param {number} red - color red value.
 * @param {number} green color green value.
 * @param {number} blue  color blue value.
 * @returns {number} color int value.
 */
export default function rgbToInt(red: number, green: number, blue: number): number {
  return (red << 16) + (green << 8) + blue;
}
