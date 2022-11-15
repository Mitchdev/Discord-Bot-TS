import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import http from 'http';
import Command from '../../structures/Command';
import NoPixelPlayer from '../../typings/apis/NoPixel';
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
        const index = players.findIndex((player) => {
          streamers.forEach((streamer) => {
            if (streamer.name.toLowerCase() === name.toLowerCase() && player.identifiers.includes(streamer.npid)) return true;
          });
          return player.name.toLowerCase() === name.toLowerCase();
        });
        const embed = new EmbedBuilder();
        if (index >= 0) {
          embed.setTitle(`🟢 ${players[index].name} is online!`);
          embed.setDescription(`With the ping id ${players[index].ping}`);
        } else {
          embed.setTitle(`🔴 ${name} is offline!`);
        }
        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        //console.log(error);
      }
    } else if (subCommand === 'set') {
      await interaction.deferReply({ephemeral: true});
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
          const newUsers = exists.notifyUsers.splice(index, 1);
          await exists.set('notify', newUsers.join(',')).save();
          await interaction.editReply(`Remove from notifications for ${name}.`);
        } else {
          await exists.set('notify', [interaction.user.id, ...exists.notifyUsers].join(',')).save();
          await interaction.editReply(`Added to notifications for ${name}.`);
        }
      } else {
        await interaction.deferReply({ephemeral: true});
        await interaction.editReply(`Streamer ${name} not found.`);
      }
    } else if (subCommand === 'list') {
      await interaction.deferReply();
      const streamers = await db.nopixelStreamers.findAll();
      await interaction.editReply(`Known streamers\n${streamers.map((streamer) => streamer.name).join(', ')}.`);
    }
  }
});
