import { Collection, GuildAuditLogsEntry, GuildEmoji, TextChannel } from 'discord.js';
import { client, db } from '../..';
import Color from '../../enums/Color';
import Event from '../../structures/Event';
import Embed from '../../typings/Embed';

export default new Event('on', 'emojiDelete', async (emoji: GuildEmoji) => {
  const emote = await db.emotes.findByPk(emoji.id);
  emote.set('deleted', true).save();

  emoji.guild.fetchAuditLogs().then(async (audit) => {
    const logs = audit.entries as unknown as Collection<string, GuildAuditLogsEntry<'EmojiDelete'>>;
    logs.filter((entry) => (entry.changes ? entry.changes[0]?.key === 'name' : false) && (entry.targetType === 'Emoji'));
    if (logs.size > 0) {
      const latestEmojiDeleted = logs.first();
      if (latestEmojiDeleted.executor.id !== process.env.BOT_ID) {
        const embed = new Embed()
        .setTitle(`Emoji Deleted by ${latestEmojiDeleted.executor.username}#${latestEmojiDeleted.executor.discriminator}`)
        .setColor(Color.RED)
        .setDescription(`\`<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>\``)
        .setImage(emoji.url);

        (client.channels.resolve(process.env.CHANNEL_EMOTE) as TextChannel).send({embeds: [embed]});
      }
    }
  });
});
