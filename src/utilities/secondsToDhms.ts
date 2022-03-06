/**
 * Converts seconds to dhms.
 * @param {number} seconds seconds.
 * @param {boolean} ago include 'ago' in string .
 * @returns {string} returns dhms string.
 */
// eslint-disable-next-line @typescript-eslint/no-inferrable-types
export default function secondsToDhms(seconds: number, ago: boolean = true): string {
  const d = Math.floor(seconds / (3600*24));
  const h = Math.floor(seconds % (3600*24) / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 60);

  if (d > 0) return `${d}d ${h}h${ago ? ' ago' : ''}`;
  else if (h > 0) return `${h}h ${m}m${ago ? ' ago' : ''}`;
  else if (m > 0) return `${m}m ${s}s${ago ? ' ago' : ''}`;
  else return `${s}s${ago ? ' ago' : ''}`;
}
