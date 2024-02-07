import { EmbedBuilder, TextChannel } from 'discord.js';
import fetch from 'node-fetch';
import http from 'http';
import { client, db } from '..';
import Scheduled from '../structures/Scheduled';
import GtaRpPlayer from '../typings/apis/GtaRp';
import Color from '../enums/Color';
import NoPixelStreamersAttributes from '../typings/database/NoPixelStreamersAttributes';

export default new Scheduled('gtarp', 60, true, async () => {
  try {
    const nopixelPlayers: GtaRpPlayer[] = await (await fetch(process.env.NOPIXEL_API, {
      agent: new http.Agent()
    })).json() as unknown as GtaRpPlayer[];
    nopixelPlayers.forEach((player) => player['server'] = 'NoPixel');

    const ignitePlayers: GtaRpPlayer[] = await (await fetch(process.env.IGNITE_API, {
      agent: new http.Agent()
    })).json() as unknown as GtaRpPlayer[];
    ignitePlayers.forEach((player) => player['server'] = 'Ignite');

    const onxPlayers: GtaRpPlayer[] = await (await fetch(process.env.ONX_API, {
      agent: new http.Agent()
    })).json() as unknown as GtaRpPlayer[];
    onxPlayers.forEach((player) => player['server'] = 'ONX');

    const players: GtaRpPlayer[] = [...nopixelPlayers, ...ignitePlayers, ...onxPlayers];

    const streamers = await db.nopixelStreamers.findAll();

    // Send Update Messages
    streamers.forEach(async (streamer) => {
      const index = players.findIndex((player) => player.identifiers.includes(streamer.npid));

      // if streamer changed to online
      if (index >= 0 && !streamer.status) {
        streamer.set('server', players[index].server);
        streamer.set('status', true);
        await streamer.save();

        const embed = new EmbedBuilder()
          .setTitle(`🟢 ${streamer.name} is online on ${players[index].server}!`)
          .setDescription(`With the id ${players[index].id}`);
        await (client.channels.resolve(process.env.CHANNEL_NOPIXEL_NOTIFICATIONS) as TextChannel).send({ embeds: [embed] });

        // @ users
        if (streamer.notifyUsers.length > 0) {
          await (client.channels.resolve(process.env.CHANNEL_NOPIXEL_NOTIFICATIONS) as TextChannel).send(streamer.notifyUsers.map((n) => `<@${n}> `).join(''));
        }
      }

      // if streamer changed to offline
      if (index < 0 && streamer.status) {
        streamer.set('lastonline', new Date());
        streamer.set('status', false);
        await streamer.save();
      }
    });

    const onlinePinMessage = await (client.channels.resolve(process.env.CHANNEL_NOPIXEL) as TextChannel).messages.fetch(process.env.MESSAGE_NOPIXEL);
    const streamerByServers = {};
    streamers.sort((a, b) => (b.status && !a.status) ? 1 : (a.status && !b.status) ? -1 : (a.id < b.id) ? -1 : (a.id > b.id) ? 1 : 0).forEach((streamer) => {
      if (!streamerByServers[streamer.server ?? 'Unknown']) {
        streamerByServers[streamer.server ?? 'Unknown'] = {
          name: streamer.server ?? 'Unknown',
          streamers: []
        };
      }
      streamerByServers[streamer.server ?? 'Unknown'].streamers.push(streamer);
    });

    // Make embed
    const embed = new EmbedBuilder()
    .setTitle('GTA RP')
    .setColor(Color.BLACK)
    .setDescription(Object.values(streamerByServers).map((server: { name: string, streamers: NoPixelStreamersAttributes[]}) => {
      return `\n**${server.name}**\n` + server.streamers.map((streamer) => `${streamer.status ? '🟢' : '🔴'} **${streamer.name}** - <t:${(new Date(streamer.updatedAt).getTime() / 1000).toFixed()}:R>`).join('\n');
    }).join('\n'));
    await onlinePinMessage.edit({ embeds: [embed] });

  } catch (error) {
    //console.log(error);
  }
});
