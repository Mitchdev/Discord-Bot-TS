import { Embed } from 'discord.js';

export default class ExtendedEmbed extends Embed {
  addBlankField(inline = true): this {
    this.addField({
      name: '\u200B',
      value: '\u200B',
      inline: inline
    });
    return this;
  }
}
