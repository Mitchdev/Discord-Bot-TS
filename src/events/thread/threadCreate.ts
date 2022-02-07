import { ThreadChannel } from 'discord.js';
import Event from '../../structures/Event';

export default new Event('on', 'threadCreate', async (threadChannel: ThreadChannel) => {
  if (threadChannel.joinable) threadChannel.join();
});
