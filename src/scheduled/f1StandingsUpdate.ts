import { EmbedBuilder, TextChannel } from 'discord.js';
import fetch from 'node-fetch';
import { client } from '..';
import Color from '../enums/Color';
import Scheduled from '../structures/Scheduled';
import { F1ConstructorStanding, F1DriverStanding, F1Round } from '../typings/apis/F1';

export default new Scheduled('f1StandingsUpdate', 1800, true, async () => {
  try {
    const rounds: F1Round[] = await (await fetch(process.env.F1_SEASON_API)).json() as F1Round[];

    let lastRound: F1Round = null;
    let nextRound: F1Round = null;
    for (let i = 0; i < rounds.length; i++) {
      for (let j = 0; j < rounds[i].sessions.length; j++) {
        if (new Date().getTime() < new Date(rounds[i].sessions[j].time_start).getTime()) {
          lastRound = rounds[i - 1]; // TODO fix for first round of season
          nextRound = rounds[i];
          i = rounds.length + 1;
          break;
        }
      }
    }

    const driverStanding: F1DriverStanding[] = await (await fetch(process.env.F1_DRIVERS_API)).json() as unknown as F1DriverStanding[];
    const constructorStanding: F1ConstructorStanding[] = await (await fetch(process.env.F1_CONSTRUCTORS_API)).json() as unknown as F1ConstructorStanding[];

    if (driverStanding.length > 0) {
      const driverEmbed = new EmbedBuilder()
        .setTitle(`Driver Standings after ${lastRound.track.name}`)
        .setColor(Color.F1_RED)
        .addFields([{
          name: 'Position',
          value: driverStanding.map((standing) => `**${standing.position}**`).join('\n'),
          inline: true
        }, {
          name: 'Driver',
          value: driverStanding.map((standing) => `${standing.driver.name}`).join('\n'),
          inline: true
        }, {
          name: 'Points',
          value: driverStanding.map((standing) => `${standing.points}`).join('\n'),
          inline: true
        }])
        .setFooter({ text: `ROUND ${nextRound.type === 'Testing' ? 0 : lastRound.round} / ${rounds.filter((round) => round.type === 'Round').length}` });
      const driverMessage = await (client.channels.resolve(process.env.CHANNEL_F1) as TextChannel).messages.fetch(process.env.MESSAGE_F1_DRIVERS);
      if (driverMessage.embeds[0].fields[2].value !== driverEmbed.data.fields[2].value) await driverMessage.edit({ embeds: [driverEmbed] });
    }

    if (constructorStanding.length > 0) {
      const constructorEmbed = new EmbedBuilder()
        .setTitle(`Constructors Standings after ${lastRound.track.name}`)
        .setColor(Color.F1_RED)
        .addFields([{
          name: 'Position',
          value: constructorStanding.map((standing) => `**${standing.position}**`).join('\n'),
          inline: true
        }, {
          name: 'Constructor',
          value: constructorStanding.map((standing) => `${standing.constructor}`).join('\n'),
          inline: true
        }, {
          name: 'Points',
          value: constructorStanding.map((standing) => `${standing.points}`).join('\n'),
          inline: true
        }])
        .setFooter({ text: `ROUND ${nextRound.type === 'Testing' ? 0 : lastRound.round} / ${rounds.filter((round) => round.type === 'Round').length}` });
      const constructorMessage = await (client.channels.resolve(process.env.CHANNEL_F1) as TextChannel).messages.fetch(process.env.MESSAGE_F1_CONSTRUCTORS);
      if (constructorMessage.embeds[0].fields[2].value !== constructorEmbed.data.fields[2].value) await constructorMessage.edit({ embeds: [constructorEmbed] });
    }
  } catch (error) {
    console.log(error);
  }
});
