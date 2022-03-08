/**
 * Adds a blank field to an embed builder.
 * @param {boolean} inline if the field in inline or not.
 * @returns {APIEmbedField} embed builder field.
 * @example Util.blankField(true): { name: '\u200B', value: '\u200B', inline: true }
 */
// eslint-disable-next-line @typescript-eslint/no-inferrable-types
export default function blankField(inline: boolean = true): {
  name: string,
  value: string,
  inline: boolean
} {
  return {
    name: '\u200B',
    value: '\u200B',
    inline: inline
  };
}
