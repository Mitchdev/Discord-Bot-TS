import { ApplicationCommandType, EmbedBuilder } from 'discord.js';
import { getColorFromURL } from 'color-thief-node';
import Command from '../../structures/Command';
import { Util } from '../..';

export default new Command({
  idType: 'UserContextMenuCommandInteraction',
  name: 'Get Banner',
  type: ApplicationCommandType.User,
  run: async ({ client, interaction }) => {
    await interaction.deferReply({ephemeral: true});

    const user = interaction.options.get('user')?.user ? interaction.options.get('user').user : interaction.user;
    await client.users.fetch(user, {force: true}); // force reload cache
    const image = user.bannerURL({extension: 'png', size: 256, forceStatic: true});

    if (image) {
      const color = await getColorFromURL(image);
      const embed = new EmbedBuilder()
        .setTitle(user.username)
        .setImage(image)
        .setColor(Util.rgbToInt(color[0], color[1], color[2]));

      interaction.editReply({embeds: [embed]});
    } else {
      interaction.editReply(`${user.username} does not have a banner`);
    }
  }
});
