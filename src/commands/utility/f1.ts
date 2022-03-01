import { ApplicationCommandOptionType } from 'discord.js';
import fetch from 'node-fetch';
import Color from '../../enums/Color';
import Command from '../../structures/Command';
import { hexToInt } from '../../structures/Utilities';
import { F1Driver, F1Event, F1Session, F1Team } from '../../typings/apis/F1';
import Embed from '../../typings/Embed';

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
      maxValue: 23,
      required: true,
    }]
  }, {
    name: 'track',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Get track info',
    options: [{
      name: 'name',
      type: ApplicationCommandOptionType.String,
      description: 'Track name',
      required: true
    }]
  }, {
    name: 'teams',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'List all teams',
  }, {
    name: 'team',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Get team info',
    options: [{
      name: 'name',
      type: ApplicationCommandOptionType.String,
      description: 'Team name',
      required: true
    }]
  }, {
    name: 'drivers',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'List all drivers',
  }, {
    name: 'driver',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Get driver info',
    options: [{
      name: 'name',
      type: ApplicationCommandOptionType.String,
      description: 'Driver name',
      required: true
    }]
  }],
  run: async ({ interaction, subCommand }) => {
    await interaction.deferReply();

    const events: F1Event[] = await (await fetch(process.env.F1_SEASON_API)).json() as F1Event[];
    const teams: F1Team[] = await (await fetch(process.env.F1_TEAMS_API)).json() as F1Team[];

    if (subCommand === 'next') {
      let event: F1Event = null;
      for (let i = 0; i < events.length; i++) {
        for (let j = 0; j < events[i].sessions.length; j++) {
          if (new Date().getTime() < new Date(events[i].sessions[j].time_start).getTime()) {
            event = events[i];
            i = events.length+1; // stop top level loop
            break;
          }
        }
      }

      let nextSession: F1Session = null;
      for (let i = 0; i < event.sessions.length; i++) {
        if (new Date().getTime() < new Date(event.sessions[i].time_start).getTime()) {
          nextSession = event.sessions[i];
          break;
        }
      }

      const embed = new Embed()
        .setTitle(event.name)
        .setColor(Color.F1_RED)
        .setDescription(`**${event.country}**, **${event.city}**\n**${event.track.name}**\n**${event.track.circuit_length}km** | **${event.track.laps} laps**\n\n${event.sessions.map((session) => {
          return `**${session.name}** - ${(session.time_start) ? `**<t:${new Date(session.time_start).getTime() / 1000}:f>** | **<t:${new Date(session.time_start).getTime() / 1000}:R>**` : 'TBA'}${
            (session.time_start && session.time_end) ? (new Date().getTime() > new Date(session.time_start).getTime() && new Date().getTime() < new Date(session.time_end).getTime()) ? ' | **LIVE**' : (session.name === nextSession.name) ? ' | **NEXT**' : '' : ''
          }`;
        }).join('\n')}`)
        .setThumbnail(event.country_flag)
        .setImage(event.track.image_detailed)
        .setFooter({text: `${event.type.toUpperCase()} ${event.round} / ${events.filter((evnt) => evnt.type === event.type).length}`});

      interaction.editReply({embeds: [embed]});
    } else if (subCommand === 'races') {

      let nextEvent: F1Event = null;
      for (let i = 0; i < events.filter((event) => event.type === 'Round').length; i++) {
        for (let j = 0; j < events.filter((event) => event.type === 'Round')[i].sessions.length; j++) {
          if (new Date().getTime() < new Date(events.filter((event) => event.type === 'Round')[i].sessions[j].time_start).getTime()) {
            nextEvent = events.filter((event) => event.type === 'Round')[i];
            i = events.filter((event) => event.type === 'Round').length+1; // stop top level loop
            break;
          }
        }
      }

      const embed = new Embed()
        .setTitle('2022 Races')
        .setColor(Color.F1_RED)
        .addField({
          name: 'Round',
          value: events.filter((event) => event.type === 'Round').map((event) => `**${event.round}**`).join('\n'),
          inline: true
        })
        .addField({
          name: 'Country',
          value: events.filter((event) => event.type === 'Round').map((event) => `**${event.country}**`).join('\n'),
          inline: true
        })
        .addField({
          name: 'Round',
          value: events.filter((event) => event.type === 'Round').map((event) => {
            return `${
              (event.sessions[event.sessions.length - 1].time_start) ? `**<t:${new Date(event.sessions[event.sessions.length - 1].time_start).getTime() / 1000}:f>**` : '**TBA**'
            }${
              (event.sessions[event.sessions.length - 1].time_start && event.sessions[event.sessions.length - 1].time_end) ? (new Date().getTime() > new Date(event.sessions[event.sessions.length - 1].time_start).getTime() && new Date().getTime() < new Date(event.sessions[event.sessions.length - 1].time_end).getTime()) ? ' | **LIVE**' : (event.name === nextEvent.name) ? ' | **NEXT**' : '' : ''
            }`;
          }).join('\n'),
          inline: true
        });

      interaction.editReply({embeds: [embed]});
    } else if (subCommand === 'race') {
      const event = events.find((event) => event.round === interaction.options.get('round').value as number && event.type === 'Round');
      const embed = new Embed()
        .setTitle(event.name)
        .setColor(Color.F1_RED)
        .setDescription(`**${event.country}**, **${event.city}**\n**${event.track.name}**\n**${event.track.circuit_length}km** | **${event.track.laps} laps**\n\n${event.sessions.map((session) => {
          return `**${session.name}** - ${session.time_start ? `**<t:${new Date(session.time_start).getTime() / 1000}:f>** | **<t:${new Date(session.time_start).getTime() / 1000}:R>**` : 'TBA'}`;
        }).join('\n')}`)
        .setThumbnail(event.country_flag)
        .setImage(event.track.image_detailed)
        .setFooter({text: `${event.type.toUpperCase()} ${event.round} / ${events.filter((evnt) => evnt.type === event.type).length}`});

      interaction.editReply({embeds: [embed]});
    } else if (subCommand === 'track') {
      const event: F1Event = events.find((event) => {
        const query = (interaction.options.get('name').value as string).toLowerCase();
        return event.track.name.toLowerCase() === query || event.name.toLowerCase() === query || event.country.toLowerCase() === query || event.city.toLowerCase() === query || `${event.country.toLowerCase()}, ${event.city.toLowerCase()}` === query;
      });

      if (event) {
        const embed = new Embed()
          .setTitle(event.track.name)
          .setColor(Color.F1_RED)
          .setDescription(`**${event.country}**, **${event.city}**\n**${event.track.circuit_length}km** | **${event.track.laps} laps**\n\nFirst GP was in **${event.track.first_gp}**\nTrack Record is **${secondsToMMSSMS(event.track.lap_record.time)}** set by **${event.track.lap_record.driver}** in **${event.track.lap_record.year}**`)
          .setThumbnail(event.country_flag)
          .setImage(event.track.image_detailed);

        interaction.editReply({embeds: [embed]});
      } else {
        interaction.editReply(`Could not find track: ${interaction.options.get('name').value}`);
      }
    } else if (subCommand === 'teams') {
      const embed = new Embed()
        .setTitle('2022 Teams')
        .setColor(Color.F1_RED)
        .addField({
          name: 'Team',
          value: teams.map((team) => `**${team.short_name}**`).join('\n'),
          inline: true
        })
        .addField({
          name: 'Drivers',
          value: teams.map((team) => team.drivers.map((driver) => `**${driver.full_name}**`).join(', ')).join('\n'),
          inline: true
        });

      interaction.editReply({embeds: [embed]});
    } else if (subCommand === 'team') {
      const team: F1Team = teams.find((team) => {
        const query = (interaction.options.get('name').value as string).toLowerCase();
        return team.full_name.toLowerCase() === query || team.short_name.toLowerCase() === query || team.constructor.toLowerCase() === query || team.car.chassis.toLowerCase() === query || team.car.name.toLowerCase() === query;
      });

      if (team) {
        const embed = new Embed()
          .setTitle(team.full_name)
          .setColor(hexToInt(team.color))
          .setDescription(`**${team.short_name}**${
            team.short_name !== team.constructor ? ` (**${team.constructor}**)` : ''
          }\n**${team.location}**\nFirst Entry in **${team.first_entry}**\n**${team.championships}** Championships\n\nTeam Chief **${team.team_chief}**\nTechnical Chief **${team.technical_chief}**\n${
            team.drivers.map((driver) => `Driver **${driver.full_name}**`).join('\n')
          }\n\n**${team.car.name}**\nChassis **${team.car.chassis}**\nPower Unit **${team.car.power_unit}**`)
          .setThumbnail(team.full_logo)
          .setImage(team.car.image);

        interaction.editReply({embeds: [embed]});
      } else {
        interaction.editReply(`Could not find team: ${interaction.options.get('name').value}`);
      }
    } else if (subCommand === 'drivers') {
      const embed = new Embed()
        .setTitle('2022 Drivers')
        .setColor(Color.F1_RED)
        .addField({
          name: 'Driver',
          value: teams.map((team) => team.drivers.map((driver) => `**${driver.full_name}**`).join('\n')).join('\n'),
          inline: true
        })
        .addField({
          name: 'Number',
          value: teams.map((team) => team.drivers.map((driver) => `**${driver.number}**`).join('\n')).join('\n'),
          inline: true
        })
        .addField({
          name: 'Team',
          value: teams.map((team) => `**${team.short_name}**\n**${team.short_name}**`).join('\n'),
          inline: true
        });

      interaction.editReply({embeds: [embed]});
    } else if (subCommand === 'driver') {
      let driver: F1Driver = null;
      const team: F1Team = teams.find((team) => {
        const query = (interaction.options.get('name').value as string).toLowerCase();
        const driver1 = (team.drivers[0].full_name.toLowerCase() === query || team.drivers[0].full_name.toLowerCase().includes(query) || team.drivers[0].short_name.toLowerCase() === query || team.drivers[0].number.toString() === query);
        const driver2 = (team.drivers[1].full_name.toLowerCase() === query || team.drivers[1].full_name.toLowerCase().includes(query) || team.drivers[1].short_name.toLowerCase() === query || team.drivers[1].number.toString() === query);
        if (driver1) driver = team.drivers[0];
        if (driver2) driver = team.drivers[1];
        return driver1 || driver2;
      });

      if (driver) {
        const embed = new Embed()
          .setTitle(driver.full_name)
          .setColor(hexToInt(team.color))
          .setDescription(`Driver **${driver.full_name}** (**${driver.short_name}**) (**#${driver.number}**)\nAge **${getAge(driver.date_of_birth)}**\nNationality **${driver.nationality}**\nCountry **${driver.country}**\nChampionships **${driver.championships}**\nTeam **${team.short_name}**`)
          .setThumbnail(driver.country_flag)
          .setImage(driver.image_front);

        interaction.editReply({embeds: [embed]});
      } else {
        interaction.editReply(`Could not find driver: ${interaction.options.get('name').value}`);
      }
    }
  }
});

function secondsToMMSSMS(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = (seconds % 1).toFixed(3);
  return `${m}:${s}.${ms.toString().replace('0.', '')}`;
}

function getAge(date: string): number {
  const now = new Date();
  const birthDate = new Date(date);
  const m = now.getMonth() - birthDate.getMonth();
  return now.getFullYear() - birthDate.getFullYear() - ((m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) ? 1 : 0);
}
