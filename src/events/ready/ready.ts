import { client, db, timers } from '../..';
import Event from '../../structures/Event';

export default new Event('once', 'ready', async () => {
  console.log(`${client.user.username} is online`);

  for (const key in db) {
    // if (key === 'suggestions') db[key].sync({ alter: true });
    db[key].sync();
  }

  setTimeout(() => {
    for (const key in timers) timers[key].start();
  }, 2500);

  await  db.embededTweets.destroy({ where: {}, truncate: true });
  await  db.invites.destroy({ where: {}, truncate: true });

  const invites = await client.guilds.resolve(process.env.GUILD_ID).invites.fetch();
  invites.forEach(async (invite) => {
    await db.invites.build({
      id: invite.code,
      username: invite.inviter.username,
      uses: invite.uses
    }).save();
  });
});
