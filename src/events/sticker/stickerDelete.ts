import { AuditLogEvent, Collection, Embed, GuildAuditLogsEntry, Sticker, TextChannel } from 'discord.js';
import { client } from '../..';
import Color from '../../enums/Color';
import Event from '../../structures/Event';

export default new Event('on', 'stickerDelete', async (sticker: Sticker) => {
  sticker.guild.fetchAuditLogs().then(async (audit) => {
    const logs = audit.entries as unknown as Collection<string, GuildAuditLogsEntry<AuditLogEvent.StickerDelete>>;
    logs.filter((entry) => (entry.changes ? entry.changes[0]?.key === 'name' : false) && (entry.targetType === 'Sticker'));
    if (logs.size > 0) {
      const latestEmojiDeleted = logs.first();
      if (latestEmojiDeleted.executor.id !== process.env.BOT_ID) {
        const embed = new Embed()
        .setTitle(`Sticker Deleted by ${latestEmojiDeleted.executor.username}#${latestEmojiDeleted.executor.discriminator}`)
        .setColor(Color.RED)
        .setDescription(`**${sticker.name}**\n${sticker.description}`)
        .setImage(sticker.url);

        (client.channels.resolve(process.env.CHANNEL_EMOTE) as TextChannel).send({embeds: [embed]});
      }
    }
  });
});
