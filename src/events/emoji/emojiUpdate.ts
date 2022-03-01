import { Collection, GuildAuditLogsEntry, GuildEmoji, TextChannel } from 'discord.js';
import { client, db } from '../..';
import Color from '../../enums/Color';
import Event from '../../structures/Event';
import Embed from '../../typings/Embed';

export default new Event('on', 'emojiUpdate', async (oldEmoji: GuildEmoji, newEmoji: GuildEmoji) => {
  const emote = await db.emotes.findByPk(oldEmoji.id);
  emote.set('name', newEmoji.name).save();

  newEmoji.guild.fetchAuditLogs().then(async (audit) => {
    const logs = audit.entries as unknown as Collection<string, GuildAuditLogsEntry<'EmojiUpdate'>>;
    logs.filter((entry) => (entry.changes ? entry.changes[0]?.key === 'name' : false) && (entry.targetType === 'Emoji'));
    if (logs.size > 0) {
      const latestEmojiUpdate = logs.first();
      const embed = new Embed()
        .setTitle(`Emoji Edited by ${latestEmojiUpdate.executor.username}#${latestEmojiUpdate.executor.discriminator}`)
        .setColor(Color.YELLOW)
        .addField({
          name: 'Old Emote',
          value: `\`<${oldEmoji.animated ? 'a' : ''}:${oldEmoji.name}:${oldEmoji.id}>\``
        })
        .addField({
          name: 'New Emote',
          value: `\`<${newEmoji.animated ? 'a' : ''}:${newEmoji.name}:${newEmoji.id}>\``
        })
        .setImage(newEmoji.url);

      (client.channels.resolve(process.env.CHANNEL_EMOTE) as TextChannel).send({embeds: [embed]});
    }
  });
});
