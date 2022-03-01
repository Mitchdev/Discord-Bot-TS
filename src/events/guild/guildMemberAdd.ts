import { GuildMember, TextChannel } from 'discord.js';
import { client, db } from '../..';
import Color from '../../enums/Color';
import Event from '../../structures/Event';
import ExtendedEmbed from '../../typings/Embed';

export default new Event('on', 'guildMemberAdd', async (member: GuildMember) => {
  const user = await db.messages.findByPk(member.user.id);
  if (!user) {
    await db.messages.build({
      id: member.user.id,
      username: member.user.username,
      discriminator: member.user.discriminator
    }).save();
  }

  let found = false;
  const embed = new ExtendedEmbed()
    .setTitle('User Join')
    .setColor(Color.GREEN)
    .addFields({
      name: 'Username',
      value: `${member.user.username}#${member.user.discriminator}`,
      inline: true,
    });

  const newInvites = await member.guild.invites.fetch();
  newInvites.forEach(async (invite) => {
    const oldInvite = await db.invites.findByPk(invite.code);
    if (invite.uses > oldInvite.uses) {
      found = true;
      oldInvite.set('uses', invite.uses).save();

      embed.addField({
          name: 'Inviter',
          value: invite.inviter.username,
          inline: true,
        })
        .addField({
          name: 'Invite Code',
          value: invite.code,
          inline: true,
        });

      (client.channels.resolve(process.env.CHANNEL_MOD) as TextChannel).send({embeds: [embed]});
    }
  });

  if (!found) {
    embed.addFields({
        name: 'Inviter',
        value: 'Vanity',
        inline: true,
      })
      .addField({
        name: 'Invite Code',
        value: member.guild.vanityURLCode ?? 'null',
        inline: true,
      });
    (client.channels.resolve(process.env.CHANNEL_MOD) as TextChannel).send({embeds: [embed]});
  }
});
