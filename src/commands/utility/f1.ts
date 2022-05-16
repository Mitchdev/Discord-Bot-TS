import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import Color from '../../enums/Color';
import Command from '../../structures/Command';
import { F1ConstructorStanding, F1DriverStanding, F1Round, F1Session } from '../../typings/apis/F1';

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
    await interaction.deferReply();

    const rounds: F1Round[] = await (await fetch(process.env.F1_SEASON_API)).json() as F1Round[];
    let nextRound: F1Round = null;
    let nextSession: F1Session = null;
    for (let i = 0; i < rounds.length; i++) {
      for (let j = 0; j < rounds[i].sessions.length; j++) {
        if (new Date().getTime() < new Date(rounds[i].sessions[j].time_start).getTime()) {
          nextRound = rounds[i];
          i = rounds.length + 1;
          break;
        }
      }
    }
    for (let i = 0; i < nextRound.sessions.length; i++) {
      if (new Date().getTime() < new Date(nextRound.sessions[i].time_start).getTime()) {
        nextSession = nextRound.sessions[i];
        break;
      }
    }

    if (subCommand === 'next') {
      const embed = new EmbedBuilder()
        .setTitle(nextRound.name)
        .setColor(Color.F1_RED)
        .setDescription(`**${nextRound.country}**, **${nextRound.city}**\n**${nextRound.track.name}**\n**${nextRound.track.lap_length}km** | **${nextRound.track.laps} laps**\n\n${nextRound.sessions.map((session) => {
          return `**${session.name}** - ${(session.time_start) ? `**<t:${new Date(session.time_start).getTime() / 1000}:f>** | **<t:${new Date(session.time_start).getTime() / 1000}:R>**` : 'TBA'}${
            (session.time_start && session.time_end) ? (new Date().getTime() > new Date(session.time_start).getTime() && new Date().getTime() < new Date(session.time_end).getTime()) ? ' | **LIVE**' : (session.name === nextSession.name) ? ' | **NEXT**' : '' : ''
          }`;
        }).join('\n')}`)
        .setThumbnail(nextRound.track.country_flag)
        .setImage(nextRound.track.image)
        .setFooter({text: `${nextRound.type.toUpperCase()} ${nextRound.round} / ${rounds.filter((round) => round.type === nextRound.type).length}`});

      interaction.editReply({embeds: [embed]});
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
            return `${
              (round.sessions[round.sessions.length - 1].time_start) ? `**<t:${new Date(round.sessions[round.sessions.length - 1].time_start).getTime() / 1000}:f>**` : '**TBA**'
            }`;
          }).join('\n'),
          inline: true
        }]);

      interaction.editReply({embeds: [embed]});
    } else if (subCommand === 'race') {
      const race = rounds.find((round) => round.round === interaction.options.get('round').value as number && round.type === 'Round');
      const embed = new EmbedBuilder()
        .setTitle(race.name)
        .setColor(Color.F1_RED)
        .setDescription(`**${race.country}**, **${race.city}**\n**${race.track.name}**\n**${race.track.lap_length}km** | **${race.track.laps} laps**\n${
          race.results.length > 0 ? `\n**Winner ${race.results[0].driver.name}**\n**2nd ${race.results[1].driver.name}**\n**3rd ${race.results[2].driver.name}**\n` : ''
        }\n${race.sessions.map((session) => {
          return `**${session.name}** - ${session.time_start ? `**<t:${new Date(session.time_start).getTime() / 1000}:f>** | **<t:${new Date(session.time_start).getTime() / 1000}:R>**` : 'TBA'}`;
        }).join('\n')}`)
        .setThumbnail(race.track.country_flag)
        .setImage(race.track.image)
        .setFooter({text: `${race.type.toUpperCase()} ${race.round} / ${rounds.filter((round) => round.type === 'Round').length}`});

      interaction.editReply({embeds: [embed]});
    } else if (subCommand === 'standings') {
      const drivers = interaction.options.get('type').value === 'Drivers';
      const standings: F1DriverStanding[] | F1ConstructorStanding[] = drivers
        ? await (await fetch(process.env.F1_DRIVERS_API)).json() as unknown as F1DriverStanding[]
        : await (await fetch(process.env.F1_CONSTRUCTORS_API)).json() as unknown as F1ConstructorStanding[];

      const embed = new EmbedBuilder()
        .setTitle(`${interaction.options.get('type').value} Standings`)
        .setColor(Color.F1_RED)
        .addFields([{
          name: 'Position',
          value: standings.map((standing: F1DriverStanding | F1ConstructorStanding) => `**${standing.position}**`).join('\n'),
          inline: true
        }, {
          name: drivers ? 'Driver': 'Constructor',
          value: standings.map((standing: F1DriverStanding | F1ConstructorStanding) => `${drivers ? (standing as F1DriverStanding).driver.name : (standing as F1ConstructorStanding).constructor}`).join('\n'),
          inline: true
        }, {
          name: 'Points',
          value: standings.map((standing: F1DriverStanding | F1ConstructorStanding) => `${standing.points}`).join('\n'),
          inline: true
        }])
        .setFooter({text: `ROUND ${nextRound.type === 'Testing' ? 0 : nextRound.round - 1} / ${rounds.filter((round) => round.type === 'Round').length}`});

      interaction.editReply({embeds: [embed]});
    }
  }
});
