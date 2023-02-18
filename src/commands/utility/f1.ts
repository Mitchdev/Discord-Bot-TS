import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import { Util } from '../..';
import Color from '../../enums/Color';
import Command from '../../structures/Command';
import { F1ConstructorStanding, F1DriverStanding, F1Round } from '../../typings/apis/F1';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'f1',
  description: 'F1 commands',
  options: [{
    name: 'next',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Get next race weekend'
  }, {
    name: 'races',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'List all races'
  }, {
    name: 'race',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Get race info',
    options: [{
      name: 'round',
      type: ApplicationCommandOptionType.Integer,
      description: 'Round number',
      minValue: 1,
      maxValue: 22,
      required: true,
    }]
  }, {
    name: 'standings',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'List drivers or constructors standings',
    options: [{
      name: 'type',
      type: ApplicationCommandOptionType.String,
      description: 'Drivers or Constructors standings',
      required: true,
      choices: [{
        name: 'Drivers',
        value: 'Drivers'
      }, {
        name: 'Constructors',
        value: 'Constructors'
      }]
    }]
  }],
  run: async ({ interaction, subCommand }) => {
    await interaction.deferReply({ ephemeral: true });

    const rounds: F1Round[] = await (await fetch(process.env.F1_SEASON_API)).json() as F1Round[];

    let lastRound: F1Round = null;
    let nextRound: F1Round = null;
    for (let i = 0; i < rounds.length; i++) {
      for (let j = 0; j < rounds[i].sessions.length; j++) {
        if (new Date().getTime() < new Date(rounds[i].sessions[j].time_start).getTime()) {
          lastRound = rounds[i - 1];
          nextRound = rounds[i];
          i = rounds.length + 1;
          break;
        }
      }
    }

    if (subCommand === 'next') {
      const embed = new EmbedBuilder()
        .setTitle(nextRound.name)
        .setColor(Color.F1_RED)
        .setDescription(`**${nextRound.country}**, **${nextRound.city}**\n**${nextRound.track.name}**\n**${nextRound.track.lap_length}km** | **${nextRound.track.laps} laps**\n\n${nextRound.sessions.map((session) => {
          return `**${session.name}** - ${(session.time_start) ? `**<t:${new Date(session.time_start).getTime() / 1000}:f>** | **<t:${new Date(session.time_start).getTime() / 1000}:R>**` : 'TBA'}`;
        }).join('\n')}`)
        .setThumbnail(nextRound.track.country_flag)
        .setImage(`${nextRound.track.image}?${Util.randomString(5)}`)
        .setFooter({ text: `${nextRound.type.toUpperCase()} ${nextRound.round} / ${rounds.filter((round) => round.type === nextRound.type).length}` });

      interaction.editReply({ embeds: [embed] });
    } else if (subCommand === 'races') {
      const embed = new EmbedBuilder()
        .setTitle('2022 Races')
        .setColor(Color.F1_RED)
        .addFields([{
          name: 'Round',
          value: rounds.filter((round) => round.type === 'Round').map((round) => `**${round.round}**`).join('\n'),
          inline: true
        }, {
          name: 'Location',
          value: rounds.filter((round) => round.type === 'Round').map((round) => `**${round.city}, ${round.country}**`).join('\n'),
          inline: true
        }, {
          name: 'Time',
          value: rounds.filter((round) => round.type === 'Round').map((round) => {
            return `${(round.sessions[round.sessions.length - 1].time_start) ? `**<t:${new Date(round.sessions[round.sessions.length - 1].time_start).getTime() / 1000}:f>**` : '**TBA**'
              }`;
          }).join('\n'),
          inline: true
        }]);

      interaction.editReply({ embeds: [embed] });
    } else if (subCommand === 'race') {
      const race = rounds.find((round) => round.round === interaction.options.get('round').value as number && round.type === 'Round');
      const embed = new EmbedBuilder()
        .setTitle(race.name)
        .setColor(Color.F1_RED)
        .setDescription(`**${race.country}**, **${race.city}**\n**${race.track.name}**\n**${race.track.lap_length}km** | **${race.track.laps} laps**\n\n${race.results.length > 0 ? '' : race.sessions.map((session) => {
          return `**${session.name}** - ${session.time_start ? `**<t:${new Date(session.time_start).getTime() / 1000}:f>** | **<t:${new Date(session.time_start).getTime() / 1000}:R>**` : 'TBA'}`;
        }).join('\n')}`)
        .setThumbnail(race.track.country_flag)
        .setImage(`${race.track.image}?${Util.randomString(5)}`)
        .setFooter({ text: `${race.type.toUpperCase()} ${race.round} / ${rounds.filter((round) => round.type === 'Round').length}` });

      if (race.results.length > 0) {
        embed.setFields([{
          name: 'Position',
          value: race.results.map((result) => {
            console.log(`${result.driver.code} - ${result.grid_position}`);
            return `${result.finish_position === 1 ? `**${result.finish_position}**`
              : result.finish_position} ${result.grid_position > 0
                ? `(${(result.grid_position - result.finish_position) > 0 ? '+' : ''}${result.grid_position - result.finish_position})` : ''}`;
          }).join('\n'),
          inline: true
        }, {
          name: 'Driver',
          value: race.results.map((result) => {
            return `${result.finish_position === 1 ? `**${result.driver.name}**` : result.driver.name}`;
          }).join('\n'),
          inline: true
        }, {
          name: 'Time / DNF',
          value: race.results.map((result) => {
            if (result.finish_position === 1) return `**${msToTime(result.total_time)}**`;
            else if (result.status === 'Finished' || /^\+(\d+?)\s(Lap|Laps)$/.test(result.status)) {
              if (result.laps === race.results[0].laps) return `+${msToTime(result.total_time - race.results[0].total_time)}`;
              else return result.status;
            } else return `${result.status} (L${result.laps})`;
          }).join('\n'),
          inline: true
        }]);
      }

      interaction.editReply({ embeds: [embed] });
    } else if (subCommand === 'standings') {
      const drivers = interaction.options.get('type').value === 'Drivers';
      const standings: F1DriverStanding[] | F1ConstructorStanding[] = drivers
        ? await (await fetch(process.env.F1_DRIVERS_API)).json() as unknown as F1DriverStanding[]
        : await (await fetch(process.env.F1_CONSTRUCTORS_API)).json() as unknown as F1ConstructorStanding[];

      const embed = new EmbedBuilder()
        .setTitle(`${interaction.options.get('type').value} Standings after ${lastRound.track.name}`)
        .setColor(Color.F1_RED)
        .addFields([{
          name: 'Position',
          value: standings.map((standing: F1DriverStanding | F1ConstructorStanding) => `**${standing.position}**`).join('\n'),
          inline: true
        }, {
          name: drivers ? 'Driver' : 'Constructor',
          value: standings.map((standing: F1DriverStanding | F1ConstructorStanding) => `${drivers ? (standing as F1DriverStanding).driver.name : (standing as F1ConstructorStanding).constructor}`).join('\n'),
          inline: true
        }, {
          name: 'Points',
          value: standings.map((standing: F1DriverStanding | F1ConstructorStanding) => `${standing.points}`).join('\n'),
          inline: true
        }])
        .setFooter({ text: `ROUND ${nextRound.type === 'Testing' ? 0 : lastRound.round} / ${rounds.filter((round) => round.type === 'Round').length}` });

      interaction.editReply({ embeds: [embed] });
    }
  }
});

function msToTime(duration: number): string {
  const ms = Math.floor(duration % 1000);
  const s = Math.floor((duration / 1000) % 60);
  const m = Math.floor((duration / (1000 * 60)) % 60);
  const h = Math.floor((duration / (1000 * 60 * 60)) % 24);

  if (h > 0) return `${h}:${(m < 10) ? `0${m}` : m}:${(s < 10) ? `0${s}` : s}.${ms}`;
  else if (m > 0) return `${m}:${(s < 10) ? `0${s}` : s}.${ms}`;
  else return `${s}.${ms}`;
}
