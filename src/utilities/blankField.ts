export default function blankField(inline = true): {
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
