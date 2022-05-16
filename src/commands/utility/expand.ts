import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { Util } from '../..';
import Command from '../../structures/Command';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'expand',
  description: 'Shows where the url redirects to.',
  options: [{
    name: 'url',
    type: ApplicationCommandOptionType.String,
    description: 'Url to expand',
    required: true
  }],
  run: async ({ interaction }) => {
    if (Util.validUrl(interaction.options.get('url').value as string)) {
      await interaction.deferReply();
      const urls = await Util.followRedirect(interaction.options.get('url').value as string);

      const embed = new EmbedBuilder()
        .setTitle(`${urls.length - 1} redirects`)
        .setDescription(urls.map((url, index) => `${index === 0 ? '**Original**' : index === urls.length - 1 ? '**Final**' : '**Redirect**'}: ${url}`).join('\n'));

      await interaction.editReply({ embeds: [embed] });
    } else {
      await interaction.deferReply({ ephemeral: true });
      await interaction.editReply('Invalid URL');
    }
  }
});
