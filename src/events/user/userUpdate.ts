import { TextChannel, User } from 'discord.js';
import { client } from '../..';
import Event from '../../structures/Event';

export default new Event('on', 'userUpdate', (oldUser: User, newUser: User) => {
  if (oldUser.username !== newUser.username) {
    (client.channels.resolve(process.env.CHANNEL_MOD) as TextChannel).send({content: `**${oldUser.username}** changed their username to **${newUser.username}**.`});
  }
});
