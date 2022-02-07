import { MessageAttachment } from 'discord.js';
import * as fs from 'fs';
import Command from '../../structures/Command';
import Embed from '../../typings/Embed';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'coinflip',
  description: 'Coin flip',
  run: async ({ interaction }) => {
    await interaction.deferReply();

    const result = Math.floor(Math.random() * 2) === 1 ? 'Heads' : 'Tails';
    const embed = new Embed()
      .setTitle('Heads or Tails')
      .setDescription(result)
      .setThumbnail(`attachment://${result}.png`);

    interaction.editReply({files: [new MessageAttachment(fs.readFileSync(`./src/resources/coin/${result}.png`), `${result}.png`)], embeds: [embed]});
  }
});
