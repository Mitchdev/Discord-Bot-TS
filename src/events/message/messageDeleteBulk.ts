import { Collection, Message, Snowflake } from 'discord.js';
import { client } from '../..';
import Event from '../../structures/Event';

export default new Event('on', 'messageDeleteBulk', async (messages: Collection<Snowflake, Message>) => {
  messages.forEach(async (message) => {
    client.emit('messageDelete', message);
  });
});
