import { BaseGuildTextChannel, BaseGuildVoiceChannel, CategoryChannel, ChannelType, GuildMember, Message } from 'discord.js';
import { client, db } from '../..';
import Event from '../../structures/Event';

export default new Event('on', 'messageCreate', async (message: Message) => {
  if (message.author.id === process.env.USER_MITCH) {
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
      const channels = await client.guilds.resolve(process.env.GUILD_ID).channels.cache;
      const categories = await channels.filter((channel) => channel.type === ChannelType.GuildCategory);
      const text = await channels.filter((channel) => channel.type === ChannelType.GuildText);
      const voice = await channels.filter((channel) => channel.type === ChannelType.GuildVoice);
      const thread = await channels.filter((channel) => channel.type === ChannelType.GuildPublicThread || channel.type === ChannelType.GuildPrivateThread);

      await categories.forEach((category) => {
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

      await text.forEach((channel) => {
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

      await voice.forEach((channel) => {
        const parentIndex = list.findIndex((parent) => parent.id === channel.parentId);
        list[parentIndex].voices.push({
          name: channel.name,
          type: channel.type,
          id: channel.id,
          pos: (channel as BaseGuildVoiceChannel).rawPosition,
        });
        list[parentIndex].voices.sort((a, b) => a.pos - b.pos);
      });

      await thread.forEach((thread) => {
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

  if (message.author.id !== process.env.BOT_ID && message.author.id !== process.env.BOT_LOGS_ID) {

    if (message.content.length >= 750) {
      message.react(message.guild.emojis.resolve('773295613558128671')); // donowall
    }

    const bannedPhrases = await db.bannedPhrases.findAll({ where: {} });
    const phrases = bannedPhrases.filter((phrase) => {
      return new RegExp(`([^A-Za-z]|^)${phrase.phrase.toLowerCase()}([^A-Za-z]|$)`, 'gmi').test(message.content.toLowerCase());
    }).sort((a, b) => b.seconds - a.seconds);

    if (phrases.length > 0) {
      const guild = client.guilds.resolve(process.env.GUILD_ID);
      guild.members.fetch(process.env.BOT_ID).then((botMember: GuildMember) => {
        if (botMember.roles.highest.position >= guild.roles.resolve(phrases[0].roleid).position) {
          guild.members.fetch(message.author.id).then((member: GuildMember) => {
            if (member.roles.resolve(phrases[0].roleid)) return;
            member.roles.add(phrases[0].roleid).then(async () => {
              db.tempRoles.build({
                userid: message.author.id,
                username: message.author.username,
                roleid: phrases[0].roleid,
                rolename: phrases[0].rolename,
                expireAt: new Date(new Date().getTime() + (phrases[0].seconds * 1000)),
                duration: phrases[0].duration,
                byid: client.user.id,
                byusername: client.user.username
              }).save();
              message.channel.send(`Added **${phrases[0].rolename}** to **${member.displayName ?? message.author.username}** for **${phrases[0].duration}**\nfor using banned phrase **${phrases[0].phrase}**`);
            }).catch((error) => console.log(error));
          }).catch((error) => console.log(error));
        }
      });
    }

    const user = await db.messages.findByPk(message.author.id);
    if (user) {
      user.set('username', message.author.username);
      user.set('discriminator', message.author.discriminator);
      user.set('nickname', message.member.nickname);
      user.addSevenDaysTime(new Date());
      await user.increment('total');
      await user.save();
    }

    const emotes = message.content.match(/<(a)?:.+?:\d+>/gmi);
    if (emotes) {
      const addedEmotes = {};
      for (let i = 0; i < emotes.length; i++) {
        const messageEmote = {
          id: emotes[i].replace('<:', '').replace('<a:', '').replace('>', '').split(':')[1],
          name: emotes[i].replace('<:', '').replace('<a:', '').replace('>', '').split(':')[0],
          animated: emotes[i].startsWith('<a:')
        };
        if (!addedEmotes[messageEmote.id]) addedEmotes[messageEmote.id] = 0;
        if (addedEmotes[messageEmote.id] < 5) {
          addedEmotes[messageEmote.id]++;
          const emote = await db.emotes.findByPk(messageEmote.id);
          if (emote) {
            emote.set('name', messageEmote.name);
            emote.set('last_used_date', new Date());
            emote.set('last_used_user', message.author.id);
            emote.addSevenDaysTime(new Date());
            await emote.increment('uses');
            await emote.save();
          } else {
            const emoteExists = message.guild.emojis.cache.get(messageEmote.id) ? true : false;
            db.emotes.build({
              id: messageEmote.id,
              name: messageEmote.name,
              animated: messageEmote.animated,
              guild: emoteExists,
            }).save();
          }
        }
      }
    }
  }
});
