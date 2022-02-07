import { GuildMember, TextChannel } from 'discord.js';
import { client } from '../..';
import Color from '../../enums/Color';
import Event from '../../structures/Event';
import Embed from '../../typings/Embed';

export default new Event('on', 'guildMemberRemove', (member: GuildMember) => {
  const embed = new Embed()
    .setTitle('User Leave')
    .setColor(Color.RED)
    .addFields({
      name: 'Username',
      value: `${member.user.username}#${member.user.discriminator}`,
      inline: true,
    })
    .addField({
      name: 'Nickname',
      value: member.nickname ? member.nickname : 'null',
      inline: true,
    })
    .addField({
      name: 'User',
      value: `<@${member.user.id}>`,
      inline: true,
    });
  (client.channels.resolve(process.env.CHANNEL_MOD) as TextChannel).send({embeds: [embed]});
});
