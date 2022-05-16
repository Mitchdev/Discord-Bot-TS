/**
 * Adds commas to a number.
 * @param {string | number} number number to add commas to.
 * @returns {string} returns number with commas.
 * @example Util.commaNumber(20000): '20,000'
 */
 export default function commaNumber(number: string | number): string {
   return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
