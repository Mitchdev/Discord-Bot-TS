import { Message, TextChannel, WebhookClient } from 'discord.js';
import Event from '../../structures/Event';
import Embed from '../../typings/Embed';

export default new Event('on', 'messageDelete', (message: Message) => {
  if (message.author.id !== process.env.BOT_ID && message.author.id !== process.env.WEBHOOK_LOG_ID) {
    const embed = new Embed()
      .setTitle(`**${message.author.username}s deleted message in #${(message.channel as TextChannel).name}**`)
      .setDescription(message.content?.length > 0 ? message.content ?? 'null' : 'null');

    new WebhookClient({
      id: process.env.WEBHOOK_LOG_ID,
      token: process.env.WEBHOOK_LOG_TOKEN
    }).send({embeds: [embed]});
  }
});
