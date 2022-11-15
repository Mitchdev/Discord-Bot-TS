import { EmbedBuilder, TextChannel } from 'discord.js';
import fetch from 'node-fetch';
import http from 'http';
import { client, db } from '..';
import Scheduled from '../structures/Scheduled';
import NoPixelPlayer from '../typings/apis/NoPixel';

export default new Scheduled('nopixel', 60, true, async () => {
  try {
    const players: NoPixelPlayer[] = await (await fetch(process.env.NOPIXEL_API, {
      agent: new http.Agent()
    })).json() as unknown as NoPixelPlayer[];

    const streamers = await db.nopixelStreamers.findAll();

    streamers.forEach(async (streamer) => {
      const index = players.findIndex((player) => player.identifiers.includes(streamer.npid));
      if (index >= 0 && !streamer.status) {
        await streamer.set('status', true).save();
        const embed = new EmbedBuilder()
          .setTitle(`🟢 ${players[index].name} is online!`)
          .setDescription(`With the ping ${players[index].ping} and id ${players[index].id}`);
        await (client.channels.resolve(process.env.CHANNEL_NOPIXEL) as TextChannel).send({ embeds: [embed] });
        if (streamer.notifyUsers.length > 0) {
          await (client.channels.resolve(process.env.CHANNEL_NOPIXEL) as TextChannel).send(streamer.notifyUsers.map((n) => `<@${n}> `).join(''));
        }
      }
      if (index < 0 && streamer.status) {
        await streamer.set('status', false).save();
      }
    });
  } catch (error) {
    //console.log(error);
  }
});
