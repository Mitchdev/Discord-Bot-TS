import { Message, Util } from 'discord.js';

/**
 * Converts rgb color values to int color.
 * @param {number} red - color red value.
 * @param {number} green color green value.
 * @param {number} blue  color blue value.
 * @returns {number} color int value.
 */
export function rgbToInt(red: number, green: number, blue: number): number {
  return (red << 16) + (green << 8) + blue;
}

/**
 * Converts hex color value to int color.
 * @param {string} hex - color hex value
 * @returns {number} color int value.
 */
export function hexToInt(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}

/**
 * Converts seconds to dhms.
 * @param {number} seconds seconds.
 * @param {boolean} ago include 'ago' in string .
 * @returns {string} returns dhms string.
 */
// eslint-disable-next-line @typescript-eslint/no-inferrable-types
export function secondsToDhms(seconds: number, ago: boolean = true): string {
  const d = Math.floor(seconds / (3600*24));
  const h = Math.floor(seconds % (3600*24) / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 60);

  if (d > 0) return `${d}d ${h}h${ago ? ' ago' : ''}`;
  else if (h > 0) return `${h}h ${m}m${ago ? ' ago' : ''}`;
  else if (m > 0) return `${m}m ${s}s${ago ? ' ago' : ''}`;
  else return `${s}s${ago ? ' ago' : ''}`;
}

/**
 * Converts duration to seconds.
 * @param {string} duration duration code \[0-9\](dhms) .
 * @returns {number | null} returns seconds or null if duration is invalid.
 */
export function durationToSeconds(duration: string): number | null {
  let time: number = parseInt(duration.slice(0, -1));
  switch (duration.replace(time.toString(), '')) {
    case 'd':
      time *= 86400;
      break;
    case 'h':
      time *= 3600;
      break;
    case 'm':
      time *= 60;
      break;
    case 's':
      break;
    default:
      return null;
  }
  return time;
}

/**
 * Takes coordinate degree and converts it to a cardinal direction.
 * @param {number} deg coordinate degree.
 * @returns {string} returns cardinal direction.
 */
export function getCardinalDirection(deg: number): string {
  if ((deg > 348.75 && deg <= 360) || (deg < 11.25 && deg >= 0)) return 'N';
  if (deg > 11.25 && deg < 33.75) return 'NNE';
  if (deg > 33.75 && deg < 56.25) return 'NE';
  if (deg > 56.25 && deg < 78.75) return 'ENE';
  if (deg > 78.75 && deg < 101.25) return 'E';
  if (deg > 101.25 && deg < 123.75) return 'ESE';
  if (deg > 123.75 && deg < 146.25) return 'SE';
  if (deg > 146.25 && deg < 168.75) return 'SSE';
  if (deg > 168.75 && deg < 191.25) return 'S';
  if (deg > 191.25 && deg < 213.75) return 'SSW';
  if (deg > 213.75 && deg < 236.25) return 'SW';
  if (deg > 236.25 && deg < 258.75) return 'WSW';
  if (deg > 258.75 && deg < 281.25) return 'W';
  if (deg > 281.25 && deg < 303.75) return 'WNW';
  if (deg > 303.75 && deg < 326.25) return 'NW';
  if (deg > 326.25 && deg < 348.75) return 'NNW';
}

/**
 * capitalize the first character in a string.
 * @param {string} string string to capitalize.
 * @returns {string} returns capitalized string.
 */
export function capitalize(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export async function splitMessage(content: string | string[], message: Message, codeblock: string = null): Promise<void> {
  if (typeof content === 'string') {
    if (content.length > 0) {
      if (codeblock !== null) content = Util.cleanCodeBlockContent(content);
      content = Util.splitMessage(content);
    } else return;
  }
  if (content.length > 0) {
    const reply = await message.reply(`${codeblock ? `\`\`\`${codeblock}\n` : ''}${content[0]}${codeblock ? '```' : ''}`);
    content.shift();
    return await splitMessage(content, reply, codeblock);
  } else return;
}

/**
 * Tests if string is a url or not.
 * @param {string} url string to test.
 * @returns {boolean} returns if string is url or not.
 */
export function validURL(url: string): boolean {
  try {
    const validURL = new URL(url);
    return (validURL?.protocol === 'http:' || validURL?.protocol === 'https:');
  } catch (_) {
    return false;
  }
}
