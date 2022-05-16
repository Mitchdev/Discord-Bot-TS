import { AuditLogEvent, EmbedBuilder, GuildAuditLogsEntry, Message, TextChannel, WebhookClient } from 'discord.js';
import { client, db } from '../..';
import Color from '../../enums/Color';
import Event from '../../structures/Event';

export default new Event('on', 'messageDelete', async (message: Message) => {
  if (message.author.id !== process.env.BOT_ID && message.author.id !== process.env.WEBHOOK_LOG_ID) {

    const twitterURL = new RegExp(/(?:https|http):\/\/(?:.+?\.)?twitter.com\/(?:.+?)\/status\/([0-9]+?)(?:$|\n|\s|\?)/, 'gmi').exec(message.content) ?? [];
    if (twitterURL.length > 0) {
      const found = await db.embededTweets.findByPk(message.id);
      if (found) {
        await (client.channels.resolve(found.channel_id) as TextChannel).messages.resolve(found.bot_message_id).delete();
        await found.destroy();
      }
    }

    message.guild.fetchAuditLogs().then(async (audit) => {
      let logs = audit.entries.first(5) as unknown as GuildAuditLogsEntry<AuditLogEvent.MessageDelete>[];
      logs = logs.filter((entry) => entry.actionType.toUpperCase() === 'DELETE' && entry.targetType.toUpperCase() === 'MESSAGE');

      const embed = new EmbedBuilder()
        .setColor(Color.RED)
        .setDescription(message.content?.length > 0 ? message.content ?? 'null' : 'null');

      if (logs.length > 0) {
        const latestMessageDelete = logs[0];
        embed.setTitle(`**${
          message.author.id === latestMessageDelete.target.id ?
            latestMessageDelete.executor.username : message.author.username
        } deleted ${
          message.author.id === latestMessageDelete.target.id ?
            `${message.author.username}s` : 'their own'} message in #${(message.channel as TextChannel).name
        }**`);
      } else {
        embed.setTitle(`**${message.author.username} deleted their own message in #${(message.channel as TextChannel).name}**`);
      }

      if (message.attachments.size > 0) embed.setFooter({ text: `Including ${message.attachments.size} attachment(s) below` });

      await new WebhookClient({
        id: process.env.WEBHOOK_LOG_ID,
        token: process.env.WEBHOOK_LOG_TOKEN
      }).send({embeds: [embed]});

      if (message.attachments.size > 0) (client.channels.resolve(process.env.CHANNEL_LOGS) as TextChannel).send({content: '**Attachment(s)**', files: message.attachments.map((attachment) => attachment.url)});
    });
  }
});
