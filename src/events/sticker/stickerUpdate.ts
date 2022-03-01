import { Collection, GuildAuditLogsEntry, Sticker, TextChannel } from 'discord.js';
import { client } from '../..';
import Color from '../../enums/Color';
import Event from '../../structures/Event';
import Embed from '../../typings/Embed';

export default new Event('on', 'stickerUpdate', async (oldSticker: Sticker, newSticker: Sticker) => {
  newSticker.guild.fetchAuditLogs().then(async (audit) => {
    const logs = audit.entries as unknown as Collection<string, GuildAuditLogsEntry<'StickerUpdate'>>;
    logs.filter((entry) => (entry.changes ? entry.changes[0]?.key === 'name' : false) && (entry.targetType === 'Sticker'));
    if (logs.size > 0) {
      const latestEmojiUpdate = logs.first();
      const embed = new Embed()
        .setTitle(`Sticker Edited by ${latestEmojiUpdate.executor.username}#${latestEmojiUpdate.executor.discriminator}`)
        .setColor(Color.YELLOW)
        .setImage(newSticker.url)
        .addField({
          name: 'Old Sticker Name',
          value: oldSticker.name
        })
        .addField({
          name: 'Old Sticker Description',
          value: oldSticker.description ?? 'null',
          inline: true
        })
        .addField({
          name: 'New Sticker',
          value: newSticker.name
        })
        .addField({
          name: 'New Sticker Description',
          value: newSticker.description ?? 'null',
          inline: true
        });

      (client.channels.resolve(process.env.CHANNEL_EMOTE) as TextChannel).send({embeds: [embed]});
    }
  });
});
