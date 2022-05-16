import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import { Util } from '../..';
import Command from '../../structures/Command';
import Smmry from '../../typings/apis/Smmry';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'tldr',
  description: 'Creates a tldr summery of an article',
  options: [{
    name: 'url',
    type: ApplicationCommandOptionType.String,
    description: 'Article url to summarize',
    required: true
  }],
  run: async ({ interaction }) => {
    if (Util.validUrl(interaction.options.get('url').value as string)) {
      await interaction.deferReply();
      const tldr: Smmry = await (await fetch(process.env.SMMRY_API + interaction.options.get('url').value)).json();
      if (!tldr.sm_api_error) {
        const embed = new EmbedBuilder()
          .setTitle(tldr.sm_api_title)
          .setURL(interaction.options.get('url').value as string)
          .setDescription(tldr.sm_api_content.replaceAll('[BREAK]', '\n\n'))
          .setFooter({ text: `Article reduced by ${tldr.sm_api_content_reduced}` });
        await interaction.editReply({embeds: [embed]});
      } else await interaction.editReply({content: 'Could not summarize article'});
    } else {
      await interaction.deferReply({ ephemeral: true });
      await interaction.editReply('Invalid url');
    }
  }
});
