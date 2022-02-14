import { GuildMember, Message } from 'discord.js';
import { client, db } from '../..';
import devCommands from '../../structures/DevCommands';
import Event from '../../structures/Event';

export default new Event('on', 'messageCreate', async (message: Message) => {
  if (message.author.id === process.env.USER_MITCH) await devCommands(message);
  if (message.author.id !== process.env.BOT_ID && message.author.id !== process.env.BOT_LOGS_ID) {
    if (message.content.length >= 750) message.react(message.guild.emojis.resolve('773295613558128671')); // donowall

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
