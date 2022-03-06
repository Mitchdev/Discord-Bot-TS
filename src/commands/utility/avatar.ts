import { ApplicationCommandOptionType, Embed, GuildMember } from 'discord.js';
import { getColorFromURL } from 'color-thief-node';
import Command from '../../structures/Command';
import { rgbToInt } from '../../structures/Utilities';
import Embed from '../../typings/Embed';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'avatar',
  description: 'Gets user profile picture',
  options: [{
    name: 'user',
    type: ApplicationCommandOptionType.User,
    description: 'User you want to get the avatar from',
    required: false,
  }, {
    name: 'server',
    type: ApplicationCommandOptionType.Boolean,
    description: 'Get user server avatar',
    required: false,
  }],
  run: async ({ client, interaction }) => {
    await interaction.deferReply();

    const member = interaction.options.get('user')?.member ? interaction.options.get('user').member as GuildMember : interaction.member;
    const user = interaction.options.get('user')?.user ? interaction.options.get('user').user : interaction.user;
    await client.users.fetch(user, {force: true}); // force reload cache
    const image = (interaction.options.get('public')?.value ?? true) && member ? member.displayAvatarURL({extension: 'png', size: 256, forceStatic: true}) : user.avatarURL({extension: 'png', size: 256});

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
