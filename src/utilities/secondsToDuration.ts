/**
 * Converts seconds to duration.
 * @param {number} seconds seconds.
 * @returns {string} returns duration string.
 * @example Util.secondsToDhms(600): '10m'
 */
export default function secondsToDuration(seconds: number): string {
  const d = Math.floor(seconds / (3600*24));
  const h = Math.floor(seconds % (3600*24) / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 60);

  if (d > 0) return `${d}d`;
  else if (h > 0) return `${h}h`;
  else if (m > 0) return `${m}m`;
  else return `${s}s`;
}
