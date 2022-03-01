import { GuildTextBasedChannel, Message, TextChannel, WebhookClient } from 'discord.js';
import { client } from '../..';
import Color from '../../enums/Color';
import Event from '../../structures/Event';
import Embed from '../../typings/Embed';

export default new Event('on', 'messageUpdate', (oldMessage: Message, newMessage: Message) => {
  if (newMessage.author.id !== process.env.BOT_ID && oldMessage.content !== newMessage.content) {
    const embed = new Embed()
      .setTitle(`**${newMessage.author.username}s edited message in #${(newMessage.channel as TextChannel).name}**`)
      .setColor(Color.YELLOW)
      .setURL(`https://discord.com/channels/${(newMessage.channel as GuildTextBasedChannel).guild.id}/${newMessage.channel.id}/${newMessage.id}`)
      .addField({
        name: 'Old',
        value: oldMessage.content?.length > 1024 ? 'too_long see message above' : oldMessage.content?.length > 0 ? oldMessage.content ?? 'null' : 'null',
      })
      .addField({
        name: 'New',
        value: newMessage.content?.length > 1024 ? 'too_long see message above' : newMessage.content?.length > 0 ? newMessage.content ?? 'null' : 'null',
      });

    if (oldMessage.content?.length > 1024) {
      (client.channels.resolve(process.env.CHANNEL_LOGS) as TextChannel).send(`**Old**\n${oldMessage.content}`);
    }

    if (newMessage.content?.length > 1024) {
      (client.channels.resolve(process.env.CHANNEL_LOGS) as TextChannel).send(`**New**\n${oldMessage.content}`);
    }

    new WebhookClient({
      id: process.env.WEBHOOK_LOG_ID,
      token: process.env.WEBHOOK_LOG_TOKEN
    }).send({embeds: [embed]});
  }
});
