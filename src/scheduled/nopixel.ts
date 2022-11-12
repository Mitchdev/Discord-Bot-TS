import { TextChannel } from 'discord.js';
import fetch from 'node-fetch';
import http from 'http';
import { client } from '..';
import Scheduled from '../structures/Scheduled';
import NoPixelPlayer from '../typings/apis/NoPixel';

let xqcstatus = false;

export default new Scheduled('nopixel', 60, true, async () => {
  try {
    const players: NoPixelPlayer[] = await (await fetch(process.env.NOPIXEL_API, {
      agent: new http.Agent()
    })).json() as unknown as NoPixelPlayer[];
    const index = players.findIndex((player) => player.identifiers.includes('steam:110000118646a34')); // xqc online
    if (index === -1 && xqcstatus) xqcstatus = false;
    else if (index > 0 && !xqcstatus) {
      xqcstatus = true;
      await (client.channels.resolve('851697095978516528') as TextChannel).send('<@399186129288560651> <@226060405657567232> XQC on nopixel');
    }
  } catch (error) {
    // console.log(error);
  }
});
