import { GuildMember } from 'discord.js';
import { Op } from 'sequelize';
import { client, db } from '..';
import Scheduled from '../structures/Scheduled';

export default new Scheduled('temp_roles_removal', 10, false, async () => {
  const expired = await db.tempRoles.findAll({ where: { expireAt: { [Op.lte]: new Date() } } });
  for (let i = 0; i < expired.length; i++) {
    const guild = client.guilds.resolve(process.env.GUILD_ID);
    guild.members.fetch(process.env.BOT_ID).then(async (botMember: GuildMember) => {
      const role = guild.roles.resolve(expired[i].roleid);
      if (botMember.roles.highest.position > role.position) {
        guild.members.fetch(expired[i].userid).then((member: GuildMember) => {
          member.roles.remove(expired[i].roleid).then(async () => {
            await expired[i].destroy();
          }).catch((error) => console.log(error));
        }).catch((error) => console.log(error));
      } else {
        await expired[i].destroy();
        console.log(`Bot does not have permissions to auto-remove ${role.name}`);
      }
    });
  }
});
