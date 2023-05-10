import { EmbedBuilder, TextChannel } from 'discord.js';
import fetch from 'node-fetch';
import http from 'http';
import { client, db } from '..';
import Scheduled from '../structures/Scheduled';
import GtaRpPlayer from '../typings/apis/GtaRp';

export default new Scheduled('gtarp', 60, true, async () => {
  try {
    const nopixelPlayers: GtaRpPlayer[] = await (await fetch(process.env.NOPIXEL_API, {
      agent: new http.Agent()
    })).json() as unknown as GtaRpPlayer[];
    nopixelPlayers.forEach((player) => player['server'] = 'nopixel');

    const ignitePlayers: GtaRpPlayer[] = (await (await fetch(process.env.IGNITE_API, {
      agent: new http.Agent()
    })).json() as unknown as GtaRpPlayer[])
    ignitePlayers.forEach((player) => player['server'] = 'ignite');

    const players: GtaRpPlayer[] = [...nopixelPlayers, ...ignitePlayers];

    const streamers = await db.nopixelStreamers.findAll();

    streamers.forEach(async (streamer) => {
      const index = players.findIndex((player) => player.identifiers.includes(streamer.npid));
      if (index >= 0 && !streamer.status) {
        await streamer.set('status', true).save();
        const embed = new EmbedBuilder()
          .setTitle(`🟢 ${streamer.name} is online on ${players[index].server}!`)
          .setDescription(`With the id ${players[index].id}`);
        await (client.channels.resolve(process.env.CHANNEL_NOPIXEL) as TextChannel).send({ embeds: [embed] });
        if (streamer.notifyUsers.length > 0) {
          await (client.channels.resolve(process.env.CHANNEL_NOPIXEL) as TextChannel).send(streamer.notifyUsers.map((n) => `<@${n}> `).join(''));
        }
      }
      if (index < 0 && streamer.status) {
        streamer.set('lastonline', new Date());
        streamer.set('status', false);
        await streamer.save();
      }
    });
  } catch (error) {
    //console.log(error);
  }
});
