import { ApplicationCommandType, Embed, GuildMember } from 'discord.js';
import { getColorFromURL } from 'color-thief-node';
import Command from '../../structures/Command';
import { rgbToInt } from '../../structures/Utilities';
import ExtendedEmbed from '../../typings/Embed';

export default new Command({
  idType: 'UserContextMenuCommandInteraction',
  name: 'avatar',
  type: ApplicationCommandType.User,
  run: async ({ client, interaction }) => {
    await interaction.deferReply({ephemeral: true});

    const member = interaction.options.get('user')?.member ? interaction.options.get('user').member as GuildMember : interaction.member;
    const user = interaction.options.get('user')?.user ? interaction.options.get('user').user : interaction.user;
    await client.users.fetch(user, {force: true}); // force reload cache
    const image = member ? member.displayAvatarURL({extension: 'png', size: 256}) : user.avatarURL({extension: 'png', size: 256, forceStatic: true});

    if (image) {
      const color = await getColorFromURL(image);
      const embed = new Embed()
        .setTitle(member?.displayName ? `${member.displayName}${member.displayName !== user.username ? ` (${user.username})` : ''}` : user.username)
        .setImage(image)
        .setColor(rgbToInt(color[0], color[1], color[2]));

      interaction.editReply({embeds: [embed]});
    } else {
      interaction.editReply(`${member?.displayName ? `${member.displayName}${member.displayName !== user.username ? ` (${user.username})` : ''}` : user.username} does not have an avatar`);
    }
  }
});

