import { ApplicationCommandOptionType, GuildMember } from 'discord.js';
import { db, Util } from '../..';
import Command from '../../structures/Command';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'role',
  description: 'Add or remove role from user',
  options: [{
    name: 'add',
    type: ApplicationCommandOptionType.SubcommandGroup,
    description: 'Add a role to user',
    options: [{
      name: 'temp',
      type: ApplicationCommandOptionType.Subcommand,
      description: 'Add temp role to user',
      options: [{
        name: 'role',
        type: ApplicationCommandOptionType.Role,
        description: 'Role to add to user',
        required: true
      }, {
        name: 'user',
        type: ApplicationCommandOptionType.User,
        description: 'User to add role to',
        required: true
      }, {
        name: 'duration',
        type: ApplicationCommandOptionType.String,
        description: 'Duration of role (1s - 7d)',
        required: true,
        autocomplete: true
      }]
    }]
  }, {
    name: 'edit',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Add a role to user',
    options: [{
      name: 'role',
      type: ApplicationCommandOptionType.Role,
      description: 'Role to add to user',
      required: true
    }, {
      name: 'user',
      type: ApplicationCommandOptionType.User,
      description: 'User to add role to',
      required: true
    }, {
      name: 'duration',
      type: ApplicationCommandOptionType.String,
      description: 'Duration of role (1s - 7d)',
      required: true
    }]
  }, {
    name: 'remove',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Remove a role from user',
    options: [{
      name: 'role',
      type: ApplicationCommandOptionType.Role,
      description: 'Role to add to user',
      required: true
    }, {
      name: 'user',
      type: ApplicationCommandOptionType.User,
      description: 'User to add role to',
      required: true
    }]
  }],
  run: async ({ interaction, subCommand }) => {
    await interaction.deferReply();
    if (subCommand === 'temp') {
      const seconds = Util.durationToSeconds(interaction.options.get('duration')?.value as string);
      if (seconds) {
        if (seconds <= 0 || seconds >= 604800) return interaction.editReply('Duration not within range (1s - 7d).');
      } else return interaction.editReply('Invalid duration. (1s - 7d)');

      Util.addTempRole({
        id: interaction.options.get('role').role.id,
        name: interaction.options.get('role').role.name,
      }, {
        id: interaction.options.get('user').user.id,
        username: interaction.options.get('user').user.username,
      }, {
        seconds: seconds,
        duration: interaction.options.get('duration').value as string
      }, interaction,
      `Added **${interaction.options.get('role').role.name}** to **${
        (interaction.options.get('user').member as GuildMember).displayName ?? interaction.options.get('user').user.username
      }**${interaction.options.get('duration') ? ` for **${interaction.options.get('duration').value}**` : ''}`);
    } else if (subCommand === 'edit') {
      const exists = await db.tempRoles.findAll({ where: { roleid: interaction.options.get('role').role.id, userid: interaction.options.get('user').user.id}});
      const seconds: number = Util.durationToSeconds(interaction.options.get('duration')?.value as string);
      if (seconds) {
        if (seconds > 0 && seconds < 604800) {
          if (exists.length > 0) {
            const oldDuration = exists[0].get('duration');
            exists[0].set('expireAt', new Date(new Date().getTime() + (seconds * 1000)));
            exists[0].set('duration', interaction.options.get('duration').value as string);
            exists[0].save();
            interaction.editReply(`Edited **${(interaction.options.get('user').member as GuildMember).displayName ?? interaction.options.get('user').user.username}** duration for **${interaction.options.get('role').role.name}** from **${oldDuration}** to **${interaction.options.get('duration').value}**`);
          } else {
            interaction.editReply('Could not find user with role.');
          }
        } else {
          interaction.editReply('Duration not within range (1s - 7d).');
        }
      } else {
        interaction.editReply('Invalid duration. (1s - 7d)');
      }
    } else if (subCommand === 'remove') {
      Util.removeTempRole({
        id: interaction.options.get('role').role.id,
        name: interaction.options.get('role').role.name
      }, {
        id: interaction.options.get('user').user.id,
        username: interaction.options.get('user').user.username
      }, interaction,
      `Removed **${interaction.options.get('role').role.name}** from **${(interaction.options.get('user').member as GuildMember).displayName ?? interaction.options.get('user').user.username}**`);
    }
  }
});
