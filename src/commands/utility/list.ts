import { db } from '../..';
import Command from '../../structures/Command';
import { secondsToDhms } from '../../structures/Utilities';
import Embed from '../../typings/Embed';

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
        embed.addField({
          name: roles[i].rolename,
          value: users.map((user) => user.username).join('\n'),
          inline: true
        })
        .addBlankField()
        .addField({
          name: 'Time left',
          value: users.map((user) => secondsToDhms((user.expireAt.getTime() / 1000) - (new Date().getTime() / 1000))).join('\n'),
          inline: true
        });
      }
    } else embed.setDescription('Nobody!');

    interaction.editReply({embeds: [embed]});
  }
});
