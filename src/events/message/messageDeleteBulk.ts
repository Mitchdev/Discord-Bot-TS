import { Message, OmitPartialGroupDMChannel, PartialMessage, ReadonlyCollection, Snowflake } from 'discord.js';
import { client } from '../..';
import Event from '../../structures/Event';

export default new Event('on', 'messageDeleteBulk', async (messages: ReadonlyCollection<Snowflake, OmitPartialGroupDMChannel<Message | PartialMessage>>) => {
  messages.forEach(async (message) => {
    client.emit('messageDelete', message);
  });
});
