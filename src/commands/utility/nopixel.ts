import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import http from 'http';
import Command from '../../structures/Command';
import NoPixelPlayer from '../../typings/apis/GtaRp';
import { db } from '../..';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'nopixel',
  description: 'See if user is online',
  options: [{
    name: 'get',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Get nopixel user or streamer',
    options: [{
      name: 'name',
      type: ApplicationCommandOptionType.String,
      description: 'Steam name or known streamer name',
      required: true,
    }]
  }, {
    name: 'notify',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Toggle notification for streamer',
    options: [{
      name: 'name',
      type: ApplicationCommandOptionType.String,
      description: 'Streamer name',
      required: true,
    }]
  }, {
    name: 'set',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Set streamer',
    options: [{
      name: 'name',
      type: ApplicationCommandOptionType.String,
      description: 'Streamer name',
      required: true,
    }, {
      name: 'id',
      type: ApplicationCommandOptionType.String,
      description: 'Streamer name',
      required: true,
    }]
  }, {
    name: 'list',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Get all streamers'
  }, {
    name: 'info',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Get user info from in-game id',
    options: [{
      name: 'id',
      type: ApplicationCommandOptionType.Integer,
      description: 'Game id',
      required: true,
    }]
  }, {
    name: 'indentifier',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Get steam indentifier from steam id',
    options: [{
      name: 'steam',
      type: ApplicationCommandOptionType.String,
      description: 'Steam id',
      required: true,
    }]
  }, {
    name: 'steam',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Get steam id from steam indentifier',
    options: [{
      name: 'id',
      type: ApplicationCommandOptionType.String,
      description: 'Steam indentifier',
      required: true,
    }]
  }],
  run: async ({ interaction, subCommand }) => {
    if (subCommand === 'get') {
      await interaction.deferReply();
      const streamers = await db.nopixelStreamers.findAll();
      const name = interaction.options.get('name').value as string;
      try {
        const players: NoPixelPlayer[] = await (await fetch(process.env.NOPIXEL_API, {
          agent: new http.Agent()
        })).json() as unknown as NoPixelPlayer[];

        const state = {
          id: 0,
          name: name,
          online: false,
          lastOnline: null,
        };

        players.findIndex((player) => {
          streamers.forEach((streamer) => {
            if (streamer.name.toLowerCase() === name.toLowerCase()) {
              if (player.identifiers.includes(streamer.npid)) {
                state.id = player.id;
                state.name = streamer.name;
                state.online = true;
                return true;
              } else {
                state.name = streamer.name;
                state.lastOnline = streamer.lastonline;
                return true;
              }
            }
          });
          if (player.name.toLowerCase() === name.toLowerCase()) {
            state.id = player.id;
            state.name = player.name;
            state.online = true;
            return true;
          } else return false;
        });
        const embed = new EmbedBuilder();
        if (state.online) {
          embed.setTitle(`🟢 ${state.name} is online!`);
          embed.setDescription(`With the id ${state.id}`);
        } else {
          embed.setTitle(`🔴 ${state.name} is offline!`);
          if (state.lastOnline) embed.setDescription(`Last online <t:${Math.round(state.lastOnline.getTime() / 1000)}:R>`);
        }
        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        await interaction.editReply('Could not get players.');
      }
    } else if (subCommand === 'set') {
      await interaction.deferReply({ ephemeral: true });
      const name = interaction.options.get('name').value as string;
      if (interaction.user.id === process.env.USER_MITCH) {
        const id = interaction.options.get('id').value as string;
        const exists = await db.nopixelStreamers.findByPk(name.toLowerCase());
        if (exists) {
          exists.set('name', name);
          exists.set('npid', id);
          await exists.save();
        } else {
          await db.nopixelStreamers.build({
            id: name.toLowerCase(),
            name: name,
            npid: id
          }).save();
        }
        await interaction.editReply(`Set ${name.toLowerCase()} to name ${name} and id ${id}`);
      } else {
        await interaction.editReply('No Permission.');
      }
    } else if (subCommand === 'notify') {
      const name = interaction.options.get('name').value as string;
      const exists = await db.nopixelStreamers.findByPk(name.toLowerCase());
      if (exists) {
        await interaction.deferReply();
        const index = exists.notifyUsers.indexOf(interaction.user.id);
        if (index >= 0) {
          const newUsers = exists.notifyUsers;
          newUsers.splice(index, 1);
          await exists.set('notify', newUsers.join(',')).save();
          await interaction.editReply(`Remove from notifications for ${name}.`);
        } else {
          await exists.set('notify', [interaction.user.id, ...exists.notifyUsers].join(',')).save();
          await interaction.editReply(`Added to notifications for ${name}.`);
        }
      } else {
        await interaction.deferReply({ ephemeral: true });
        await interaction.editReply(`Streamer ${name} not found.`);
      }
    } else if (subCommand === 'list') {
      await interaction.deferReply();
      const streamers = await db.nopixelStreamers.findAll();
      await interaction.editReply(`Known streamers\n${streamers.map((streamer) => streamer.name).join(', ')}.`);
    } else if (subCommand === 'info') {
      await interaction.deferReply();
      const id = interaction.options.get('id').value as number;
      try {
        const players: NoPixelPlayer[] = await (await fetch(process.env.NOPIXEL_API, {
          agent: new http.Agent()
        })).json() as unknown as NoPixelPlayer[];
        const index = players.findIndex((player) => player.id === id);
        if (index >= 0) {
          const embed = new EmbedBuilder()
            .setTitle(players[index].name)
            .setDescription(`**id:** ${players[index].id}\n**ping:** ${players[index].ping}\nIdentifiers: ${players[index].identifiers.join(', ')}`);
          await interaction.editReply({ embeds: [embed] });
        } else {
          await interaction.editReply(`Could not find player with id ${id}.`);
        }
      } catch (error) {
        await interaction.editReply('Could not get players.');
      }
    } else if (subCommand === 'indentifier') {
      await interaction.deferReply();
      const steam = interaction.options.get('steam').value as string;
      const steamid = BigInt(steam);
      await interaction.editReply(`steam:${steamid.toString(16)}`);
    } else if (subCommand === 'steam') {
      await interaction.deferReply();
      const id = interaction.options.get('id').value as string;
      const hex = id.replace('steam:', '0x');
      const steamid = BigInt(hex);
      await interaction.editReply(`https://steamcommunity.com/profiles/${steamid}`);
    }
  }
});
