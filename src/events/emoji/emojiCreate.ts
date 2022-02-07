import { GuildEmoji } from 'discord.js';
import { db } from '../..';
import Event from '../../structures/Event';

export default new Event('on', 'emojiCreate', async (emoji: GuildEmoji) => {
  await db.emotes.build({
    id: emoji.id,
    name: emoji.name,
    animated: emoji.animated ?? false,
    guild: true
  }).save();
});
