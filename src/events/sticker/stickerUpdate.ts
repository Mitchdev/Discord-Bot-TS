import { AuditLogEvent, Collection, EmbedBuilder, GuildAuditLogsEntry, Sticker, TextChannel } from 'discord.js';
import { client } from '../..';
import Color from '../../enums/Color';
import Event from '../../structures/Event';

export default new Event('on', 'stickerUpdate', async (oldSticker: Sticker, newSticker: Sticker) => {
  newSticker.guild.fetchAuditLogs().then(async (audit) => {
    const logs = audit.entries as unknown as Collection<string, GuildAuditLogsEntry<AuditLogEvent.StickerUpdate>>;
    logs.filter((entry) => (entry.changes ? entry.changes[0]?.key === 'name' : false) && (entry.targetType === 'Sticker'));
    if (logs.size > 0) {
      const latestEmojiUpdate = logs.first();
      const embed = new EmbedBuilder()
        .setTitle(`Sticker Edited by ${latestEmojiUpdate.executor.username}#${latestEmojiUpdate.executor.discriminator}`)
        .setColor(Color.YELLOW)
        .setImage(newSticker.url)
        .addFields([{
          name: 'Old Sticker Name',
          value: oldSticker.name
        }, {
          name: 'Old Sticker Description',
          value: oldSticker.description ?? 'null',
          inline: true
        }, {
          name: 'New Sticker',
          value: newSticker.name
        }, {
          name: 'New Sticker Description',
          value: newSticker.description ?? 'null',
          inline: true
        }]);

      (client.channels.resolve(process.env.CHANNEL_EMOTE) as TextChannel).send({embeds: [embed]});
    }
  });
});
