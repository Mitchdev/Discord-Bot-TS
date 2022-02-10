import { client, db } from '..';
import Scheduled from '../structures/Scheduled';

export default new Scheduled('regularUsersUpdate', 1800, true, async () => {
  const role = client.guilds.resolve(process.env.GUILD_ID).roles.resolve(process.env.ROLE_REGULAR);
  role.members.forEach(async (member) => {
    const user = await db.messages.findByPk(member.id);
    if (user) {
      if (user.sevenDays.length < 100) {
        await member.roles.remove(role);
      }
    }
  });
});
