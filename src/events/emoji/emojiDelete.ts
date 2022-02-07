import { GuildEmoji } from 'discord.js';
import { db } from '../..';
import Event from '../../structures/Event';

export default new Event('on', 'emojiDelete', async (emoji: GuildEmoji) => {
  const emote = await db.emotes.findByPk(emoji.id);
  emote.set('deleted', true);
  emote.save();
});
