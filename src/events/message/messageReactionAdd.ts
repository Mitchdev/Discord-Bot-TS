import { MessageReaction, User } from 'discord.js';
import { db } from '../..';
import Event from '../../structures/Event';

export default new Event('on', 'messageReactionAdd', async (reaction: MessageReaction, user: | User) => {
  if (user.id !== process.env.BOT_ID) {
    if (reaction.emoji.name === '📌') {
      if (reaction.users.cache.size === 5) {
        reaction.message.pin();
      }
    }

    if (reaction.emoji.id) {
      const emote = await db.emotes.findByPk(reaction.emoji.id);
      if (emote) {
        emote.set('name', reaction.emoji.name);
        emote.set('last_used_date', new Date());
        emote.set('last_used_user', user.id);
        emote.addSevenDaysTime(new Date());
        await emote.increment('uses');
        await emote.save();
      } else {
        const emoteExists = reaction.message.guild.emojis.cache.get(reaction.emoji.id) ? true : false;
        db.emotes.create({
          id: reaction.emoji.id,
          name: reaction.emoji.name,
          animated: reaction.emoji.animated ?? false,
          guild: emoteExists,
        });
      }
    }
  }
});
