import { CommandInteraction, Message, Snowflake } from 'discord.js';
import { client, db } from '..';

/**
 * Removes temporary role from a user.
 * @param {{ id: Snowflake, name: string }} role role to remove.
 * @param {{ id: Snowflake, username: string }} user user to remove role from.
 * @param {Message | CommandInteraction} message message or interaction to reply to.
 * @param {string} success message to reply if function successful.
 * @example Util.removeTempRole({ id: '829613714483183631', name: 'Muted' }, { id: '399186129288560651', username: 'John' }, message, 'Removed role!')
 */
export default async function removeTempRole(role: {
  id: Snowflake,
  name: string
}, user: {
  id: Snowflake
  username: string
}, message: Message | CommandInteraction = null, success: string = null) {
  const remove = await db.tempRoles.findAll({ where: { roleid: role.id, userid: user.id } });
  for (let i = 0; i < remove.length; i++) remove[i].destroy();

  const guild = client.guilds.resolve(process.env.GUILD_ID);
  const botMember = await guild.members.fetch(process.env.BOT_ID);
  const requestedRole = guild.roles.resolve(role.id);
  if (botMember.roles.highest.position >= requestedRole.position) {
    const member = await guild.members.fetch(user.id);
    if (member) {
      member.roles.remove(role.id).then(async () => {
        if (message && success) {
          if ('commandId' in message) message.editReply(success);
          else message.reply(success);
        }
      }).catch((error) => console.log(error));
    } else {
      console.log('Could not find member: ', member);
    }
  } else {
    if (message) {
      if ('commandId' in message) message.editReply(`Bot does not have permissions to remove **${role.name}**`);
      else message.reply(`Bot does not have permissions to remove **${role.name}**`);
    }
  }
}
