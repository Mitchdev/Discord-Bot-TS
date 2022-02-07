import { GuildEmoji } from 'discord.js';
import { db } from '../..';
import Event from '../../structures/Event';

export default new Event('on', 'emojiUpdate', async (oldEmoji: GuildEmoji, newEmoji: GuildEmoji) => {
  const emote = await db.emotes.findByPk(oldEmoji.id);
  emote.set('name', newEmoji.name);
  emote.save();
});
