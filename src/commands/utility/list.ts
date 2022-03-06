import { Embed } from 'discord.js';
import { db, Util } from '../..';
import Command from '../../structures/Command';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'list',
  description: 'Lists all temporarily roled users',
  run: async ({ interaction }) => {
    await interaction.deferReply();

    const embed = new Embed().setTitle('List of temporarily roled users');
    const roles = await db.tempRoles.findAll({
      attributes: ['rolename', 'roleid'],
      order: [['expireAt', 'DESC']],
      group: 'roleid',
    });

    if (roles.length > 0) {
      for (let i = 0; i < roles.length; i++) {
        const users = await db.tempRoles.findAll({
          where: { roleid: roles[i].roleid },
          order: [['expireAt', 'DESC']]
        });
        embed.addFields({
          name: roles[i].rolename,
          value: users.map((user) => user.username).join('\n'),
          inline: true
        }, Util.blankField(), {
          name: 'Time left',
          value: users.map((user) => Util.secondsToDhms((user.expireAt.getTime() / 1000) - (new Date().getTime() / 1000), false)).join('\n'),
          inline: true
        });
      }
    } else embed.setDescription('Nobody!');

    interaction.editReply({embeds: [embed]});
  }
});
