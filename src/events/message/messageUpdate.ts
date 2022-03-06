import { Embed, GuildTextBasedChannel, Message, TextChannel, WebhookClient } from 'discord.js';
import { client } from '../..';
import Color from '../../enums/Color';
import Event from '../../structures/Event';

export default new Event('on', 'messageUpdate', async (oldMessage: Message, newMessage: Message) => {
  if (newMessage.author.id !== process.env.BOT_ID && oldMessage.content !== newMessage.content) {
    const embed = new Embed()
      .setTitle(`**${newMessage.author.username}s edited message in #${(newMessage.channel as TextChannel).name}**`)
      .setColor(Color.YELLOW)
      .setURL(`https://discord.com/channels/${(newMessage.channel as GuildTextBasedChannel).guild.id}/${newMessage.channel.id}/${newMessage.id}`)
      .addFields({
        name: 'Old',
        value: oldMessage.content?.length > 1024 ? 'too_long see message above' : oldMessage.content?.length > 0 ? oldMessage.content ?? 'null' : 'null',
      }, {
        name: 'New',
        value: newMessage.content?.length > 1024 ? 'too_long see message above' : newMessage.content?.length > 0 ? newMessage.content ?? 'null' : 'null',
      });

    await new WebhookClient({
      id: process.env.WEBHOOK_LOG_ID,
      token: process.env.WEBHOOK_LOG_TOKEN
    }).send({embeds: [embed]});

    if (oldMessage.content?.length > 1024) (client.channels.resolve(process.env.CHANNEL_LOGS) as TextChannel).send(`**Old**\n${oldMessage.content}`);
    if (newMessage.content?.length > 1024) (client.channels.resolve(process.env.CHANNEL_LOGS) as TextChannel).send(`**New**\n${oldMessage.content}`);
  } else if (oldMessage.attachments.size !== newMessage.attachments.size) {
    const oldAttachments = oldMessage.attachments.map((attachment) => attachment.url).join('\n');
    const newAttachments = newMessage.attachments.map((attachment) => attachment.url).join('\n');
    const embed = new Embed()
      .setTitle(`**${newMessage.author.username}s removed an attachment from their message in #${(newMessage.channel as TextChannel).name}**`)
      .setColor(Color.YELLOW)
      .setURL(`https://discord.com/channels/${(newMessage.channel as GuildTextBasedChannel).guild.id}/${newMessage.channel.id}/${newMessage.id}`)
      .addFields({
        name: 'Old Attachments',
        value: oldAttachments?.length > 1024 ? 'too_long see message above' : oldAttachments?.length > 0 ? oldAttachments ?? 'null' : 'null',
      }, {
        name: 'New Attachments',
        value: newAttachments?.length > 1024 ? 'too_long see message above' : newAttachments?.length > 0 ? newAttachments ?? 'null' : 'null',
      });

    await new WebhookClient({
      id: process.env.WEBHOOK_LOG_ID,
      token: process.env.WEBHOOK_LOG_TOKEN
    }).send({embeds: [embed]});

    if (oldMessage.content?.length > 1024) (client.channels.resolve(process.env.CHANNEL_LOGS) as TextChannel).send(`**Old Attachments**\n${oldAttachments}`);
    if (newMessage.content?.length > 1024) (client.channels.resolve(process.env.CHANNEL_LOGS) as TextChannel).send(`**New Attachments**\n${newAttachments}`);
  }
});
