import { Message } from 'discord.js';
import { client, db, timers, Util } from '../..';
import devCommands from '../../structures/DevCommands';
import Event from '../../structures/Event';
import { writeFileSync } from 'fs';

export default new Event('on', 'messageCreate', async (message: Message) => {
  if (message.author.id === process.env.USER_MITCH) await devCommands(client, db, timers, message);
  if (message.author.id !== process.env.BOT_ID && message.author.id !== process.env.BOT_LOGS_ID && message.author.id !== process.env.BOT_ID_DEV) {
    let content = message.content;
    if (content !== '') {
      message.mentions.users.forEach((user) => {
        content = content.replaceAll(new RegExp(`<@${user.id}>`, 'gm'), user.globalName);
      });
      message.mentions.roles.forEach((role) => {
        content = content.replaceAll(new RegExp(`<@&${role.id}>`, 'gm'), role.name);
      });
      (await message.guild.channels.fetch()).forEach((channel) => {
        content = content.replaceAll(new RegExp(`<#${channel.id}>`, 'gm'), `#${channel.name}`);
      });
      if (message.mentions.repliedUser) {
        content = `${message.mentions.repliedUser.globalName} ${content}`;
      }
      if (client.messages.has(message.channelId)) {
        let messages = client.messages.get(message.channelId);
        messages.push({ name: message.author.globalName, message: content, timestamp: message.createdTimestamp });
        if (messages.length > 50) {
          messages = messages.slice(-50);
        }
        client.messages.set(message.channelId, messages);
      } else {
        client.messages.set(message.channelId, [{ name: message.author.globalName, message: content, timestamp: message.createdTimestamp }]);
      }

      writeFileSync('./messages.json', JSON.stringify(Object.fromEntries(client.messages)));
    }

    if (message.content.length >= 750) message.react(message.guild.emojis.resolve('773295613558128671')); // donowall

    const recycledTwitterURL = new RegExp(/(?:https|http):\/\/(?:.+?\.)?((?:twitter.com|fxtwitter.com|nitter.net)\/(?:.+?)\/status\/([0-9]+?)(?:\/|$|\n|\s|\?))/, 'gmi').exec(message.content) ?? [];
    if (recycledTwitterURL.length > 0) {
      const recycled = await db.recycledLinks.findByPk(recycledTwitterURL[2]);
      if (recycled) message.react('♻️');
      else {
        await db.recycledLinks.build({
          url: recycledTwitterURL[2],
          guild: message.guild.id,
          channel: message.channel.id,
          message: message.id
        }).save();
      }
    }

    const redditURL = new RegExp(/(?:https|http):\/\/(?:.+?\.)?(reddit.com\/(?:.+?)\/(?:comment|comments)\/(?:.+?))(?:\/)?(?:$|\n|\s|\?)/, 'gmi').exec(message.content) ?? [];
    if (redditURL.length > 0) {
      const recycled = await db.recycledLinks.findByPk(redditURL[1]);
      if (recycled) message.react('♻️');
      else {
        await db.recycledLinks.build({
          url: redditURL[1],
          guild: message.guild.id,
          channel: message.channel.id,
          message: message.id
        }).save();
      }
    }

    const timeout = await db.timeouts.findByPk(message.author.id);
    if (timeout) timeout.destroy();

    const bannedPhrases = await db.bannedPhrases.findAll({ where: {} });
    const phrases = bannedPhrases.filter((phrase) => {
      return new RegExp(`([^A-Za-z]|^)${phrase.phrase.toLowerCase()}([^A-Za-z]|$)`, 'gmi').test(message.content.toLowerCase());
    }).sort((a, b) => b.seconds - a.seconds);

    if (phrases.length > 0) {
      const member = await client.guilds.resolve(process.env.GUILD_ID).members.fetch(message.author.id);
      Util.addTempRole({
        id: phrases[0].roleid,
        name: phrases[0].rolename
      }, {
        id: message.author.id,
        username: message.author.username
      }, {
        seconds: phrases[0].seconds,
        duration: phrases[0].duration
      }, message,
        `Added **${phrases[0].rolename}** to **${member.displayName ?? message.author.username}** for **${phrases[0].duration}**\nfor using banned phrase **${phrases[0].phrase}**`,
        `**${member.displayName ?? message.author.username}** already has role ${phrases[0].rolename}\nbut used banned phrase **${phrases[0].phrase}**`);
    }

    const user = await db.messages.findByPk(message.author.id);
    if (user) {
      user.set('username', message.author.username);
      user.set('discriminator', message.author.discriminator);
      user.set('nickname', message.member.nickname);
      user.addSevenDaysTime(new Date());
      await user.increment('total');
      await user.save();

      if (user.sevenDays.length >= 100) {
        const guild = client.guilds.resolve(process.env.GUILD_ID);
        guild.members.resolve(user.id).roles.add(guild.roles.resolve(process.env.ROLE_REGULAR));
      }
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
