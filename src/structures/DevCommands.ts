import { BaseGuildTextChannel, BaseGuildVoiceChannel, CategoryChannel, ChannelType, Message } from 'discord.js';
import { client } from '..';

async function devCommands(message: Message) {

  if (message.content === '!restart' && process.argv[2] === 'prod') {
    message.reply('Restarting bot.');
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }

  if (message.content === '!reload') {
    client.reload();
    message.reply('Reloading events and commands.');
  }

  if (message.content === '!clearcommands' && process.argv[2] === 'dev') {
    const response = await client.removeCommands();
    message.reply(response);
  }

  if (message.content === '!channels') {
    const list = [];
    const channels = client.guilds.resolve(process.env.GUILD_ID).channels.cache;
    const categories = channels.filter((channel) => channel.type === ChannelType.GuildCategory);
    const text = channels.filter((channel) => channel.type === ChannelType.GuildText);
    const voice = channels.filter((channel) => channel.type === ChannelType.GuildVoice);
    const thread = channels.filter((channel) => channel.type === ChannelType.GuildPublicThread || channel.type === ChannelType.GuildPrivateThread);

    categories.forEach((category) => {
      list.push({
        name: category.name,
        type: category.type,
        id: category.id,
        pos: (category as CategoryChannel).rawPosition,
        texts: [],
        voices: [],
      });
      list.sort((a, b) => a.pos - b.pos);
    });

    text.forEach((channel) => {
      const parentIndex = list.findIndex((parent) => parent.id === channel.parentId);
      list[parentIndex].texts.push({
        name: channel.name,
        type: channel.type,
        id: channel.id,
        pos: (channel as BaseGuildTextChannel).rawPosition,
        threads: [],
      });
      list[parentIndex].texts.sort((a, b) => a.pos - b.pos);
    });

    voice.forEach((channel) => {
      const parentIndex = list.findIndex((parent) => parent.id === channel.parentId);
      list[parentIndex].voices.push({
        name: channel.name,
        type: channel.type,
        id: channel.id,
        pos: (channel as BaseGuildVoiceChannel).rawPosition,
      });
      list[parentIndex].voices.sort((a, b) => a.pos - b.pos);
    });

    thread.forEach((thread) => {
      const parentParentIndex = list.findIndex((parent) => parent.id === thread.parent.parentId);
      const parentIndex = list[parentParentIndex].texts.findIndex((parent) => parent.id === thread.parentId);
      list[parentParentIndex].texts[parentIndex].threads.push({
        name: thread.name,
        type: thread.type,
        id: thread.id,
      });
    });

    message.reply(`\`\`\`markdown\n${list.map((category) => {
      return `#${category.name}\n> Text Channels${category.texts.length > 0 ? '\n' : ''}${category.texts.map((channel) => {
        return ` ⮡ ${channel.name}${channel.threads.length > 0 ? '\n' : ''}${channel.threads.map((thread) => {
          return `   ⮡ ${thread.name}`;
        }).join('\n')}`;
      }).join('\n')}\n> Voice Channels${category.voices.length > 0 ? '\n' : ''}${category.voices.map((channel) => {
        return ` ⮡ ${channel.name}`;
      }).join('\n')}`;
    }).join('\n\n')}\`\`\``);
  }
}

export default devCommands;
