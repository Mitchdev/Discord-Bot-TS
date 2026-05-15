import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import Command from '../../structures/Command';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'search',
  description: 'Searches Google',
  options: [{
    name: 'image',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Searches Google Images',
    options: [{
      name: 'term',
      type: ApplicationCommandOptionType.String,
      description: 'Search Term',
      required: true,
    }]
  }],
  run: async ({ interaction }) => {
    await interaction.deferReply();
    const term = interaction.options.get('term').value as string;
    const data = await (await fetch(process.env.GOOGLE_SEARCH.replace('|phrase|', term))).json() as { items?: { link: string }[] };
    const embed = new EmbedBuilder()
      .setTitle(`**${term}**`);

    if (data.items?.length > 0) {
      embed.setImage(data.items[0].link);
    } else {
      embed.setDescription('No Results');
    }

    interaction.editReply({embeds: [embed]});
  }
});
