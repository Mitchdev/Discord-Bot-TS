/**
 * Converts duration to seconds.
 * @param {string} duration duration code \[0-9\](dhms) .
 * @returns {number | null} returns seconds or null if duration is invalid.
 */
export default function durationToSeconds(duration: string): number | null {
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
