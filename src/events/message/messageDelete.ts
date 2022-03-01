import { GuildAuditLogsEntry, Message, TextChannel, WebhookClient } from 'discord.js';
import Color from '../../enums/Color';
import Event from '../../structures/Event';
import Embed from '../../typings/Embed';

export default new Event('on', 'messageDelete', async (message: Message) => {
  if (message.author.id !== process.env.BOT_ID && message.author.id !== process.env.WEBHOOK_LOG_ID) {
    message.guild.fetchAuditLogs().then(async (audit) => {
      const logs = audit.entries.first(5) as unknown as GuildAuditLogsEntry<'MessageDelete'>[];
      logs.filter((entry) => entry.action === 'MessageDelete');
      if (logs.length > 0) {
        const latestMessageDelete = logs[0];
        const embed = new Embed()
          .setTitle(`**${message.author.id === latestMessageDelete.target.id ? latestMessageDelete.executor.username : message.author.username} deleted ${message.author.id === latestMessageDelete.target.id ? `${message.author.username}s` : 'their own'} message in #${(message.channel as TextChannel).name}**`)
          .setColor(Color.RED)
          .setDescription(message.content?.length > 0 ? message.content ?? 'null' : 'null');

        new WebhookClient({
          id: process.env.WEBHOOK_LOG_ID,
          token: process.env.WEBHOOK_LOG_TOKEN
        }).send({embeds: [embed]});
      } else {
        const embed = new Embed()
          .setTitle(`**${message.author.username} deleted their own message in #${(message.channel as TextChannel).name}**`)
          .setColor(Color.RED)
          .setDescription(message.content?.length > 0 ? message.content ?? 'null' : 'null');

        new WebhookClient({
          id: process.env.WEBHOOK_LOG_ID,
          token: process.env.WEBHOOK_LOG_TOKEN
        }).send({embeds: [embed]});
      }
    });
  }
});
