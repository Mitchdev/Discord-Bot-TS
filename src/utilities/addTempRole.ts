import { CommandInteraction, Message, Snowflake } from 'discord.js';
import { client, db } from '..';

export default async function addTempRole(role: {
  id: Snowflake,
  name: string
}, user: {
  id: Snowflake,
  username: string
}, time: {
  seconds: number,
  duration: string
}, message: Message | CommandInteraction = null, success: string = null, fail: string = null) {
  const guild = client.guilds.resolve(process.env.GUILD_ID);
  const botMember = await guild.members.fetch(process.env.BOT_ID);
  const requestedRole = guild.roles.resolve(role.id);
  if (botMember.roles.highest.position >= requestedRole?.position) {
    const member = await guild.members.fetch(user.id);
    if (member.roles.resolve(role.id) && message && fail) {
      if ('commandId' in message) return message.editReply(fail);
      else return message.reply(fail);
    }
    member.roles.add(role.id).then(async () => {
      db.tempRoles.build({
        userid: user.id,
        username: user.username,
        roleid: role.id,
        rolename: role.name,
        expireAt: new Date(new Date().getTime() + (time.seconds * 1000)),
        duration: time.duration,
        byid: client.user.id,
        byusername: client.user.username
      }).save();
      if (message && success) {
        if ('commandId' in message) message.editReply(success);
        else message.reply(success);
      }
    }).catch((error) => console.log(error));
  } else {
    if ('commandId' in message) message.editReply(`Bot does not have permissions to add **${role.name}**`);
    else message.reply(`Bot does not have permissions to add **${role.name}**`);
  }
}
