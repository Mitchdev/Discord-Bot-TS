import { ApplicationCommandOptionType, TextChannel } from 'discord.js';
import Command from '../../structures/Command';
import { db } from '../..';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'recycled',
  description: 'See when twitter / reddit link was posted first.',
  options: [{
    name: 'url',
    type: ApplicationCommandOptionType.String,
    description: 'links you want to check',
    required: true,
  }],
  run: async ({ client, interaction }) => {

    let url = null;
    const twitterURL = new RegExp(/(?:https|http):\/\/(?:.+?\.)?((?:twitter.com|fxtwitter.com|nitter.net)\/(?:.+?)\/status\/([0-9]+?)(?:\/|$|\n|\s|\?))/, 'gmi').exec(interaction.options.get('url').value as string) ?? [];
    const redditURL = new RegExp(/(?:https|http):\/\/(?:.+?\.)?(reddit.com\/(?:.+?)\/(?:comment|comments)\/(?:.+?))(?:\/)?(?:$|\n|\s|\?)/, 'gmi').exec(interaction.options.get('url').value as string) ?? [];
    if (twitterURL.length > 0) url = twitterURL[2];
    else if (redditURL.length > 0) url = redditURL[1];
    else {
      await interaction.deferReply({ ephemeral: true });
      await interaction.editReply('Not a twitter / reddit link');
      return;
    }

    await interaction.deferReply();
    const recycled = await db.recycledLinks.findByPk(url);
    if (recycled) {
      const channel = client.channels.resolve(recycled.channel) as TextChannel;
      await interaction.editReply(`${channel ? `#${channel.name}\n` : ''}https://discord.com/channels/${recycled.guild}/${recycled.channel}/${recycled.message}`);
    } else {
      await interaction.editReply(`Couldn't find \`${interaction.options.get('url').value}\``);
    }
  }
});
