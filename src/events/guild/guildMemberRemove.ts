import { Embed, GuildMember, TextChannel } from 'discord.js';
import { client } from '../..';
import Color from '../../enums/Color';
import Event from '../../structures/Event';

export default new Event('on', 'guildMemberRemove', (member: GuildMember) => {
  const roles = member.roles.cache.map((role) => role.name).join(', ');
  const embed = new Embed()
    .setTitle('User Leave')
    .setColor(Color.RED)
    .addFields({
      name: 'Username',
      value: `${member.user.username}#${member.user.discriminator}`,
      inline: true
    }, {
      name: 'Nickname',
      value: member.nickname ? member.nickname : 'null',
      inline: true
    }, {
      name: 'User',
      value: `<@${member.user.id}>`,
      inline: true
    }, {
      name: 'Roles',
      value: roles !== '' ? roles : 'none'
    });
  (client.channels.resolve(process.env.CHANNEL_MOD) as TextChannel).send({embeds: [embed]});
});
