import { ApplicationCommandOptionType, ApplicationCommandPermissionType, GuildMember } from 'discord.js';
import { db } from '../..';
import Command from '../../structures/Command';
import { durationToSeconds } from '../../structures/Utilities';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'role',
  description: 'Add or remove role from user',
  userPermissions: [{
    id: process.env.ROLE_MOD,
    type: ApplicationCommandPermissionType.Role,
    permission: true
  }],
  defaultPermission: false,
  options: [{
    name: 'add',
    type: ApplicationCommandOptionType.SubcommandGroup,
    description: 'Add a role to user',
    options: [{
      name: 'temporary',
      type: ApplicationCommandOptionType.Subcommand,
      description: 'Add temporary role to user',
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
    }, {
      name: 'permanent',
      type: ApplicationCommandOptionType.Subcommand,
      description: 'Add permanent role to user',
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
  run: async ({ client, interaction, subCommand }) => {
    await interaction.deferReply();
    if (subCommand === 'permanent' || subCommand === 'temporary') {
      let seconds = 0;
      if (interaction.options.get('duration')) {
        seconds = durationToSeconds(interaction.options.get('duration')?.value as string);
        if (seconds) {
          if (seconds <= 0 || seconds >= 604800) {
            interaction.editReply('Duration not within range (1s - 7d).');
            return;
          }
        } else {
          interaction.editReply('Invalid duration. (1s - 7d)');
          return;
        }
      }
      const guild = client.guilds.resolve(process.env.GUILD_ID);
      guild.members.fetch(process.env.BOT_ID).then((botMember: GuildMember) => {
        if (botMember.roles.highest.position >= guild.roles.resolve(interaction.options.get('role').role.id).position) {
          guild.members.fetch(interaction.options.get('user').user.id).then((member: GuildMember) => {
            if (member.roles.resolve(interaction.options.get('role').role.id)) return;
            member.roles.add(interaction.options.get('role').role.id).then(async () => {
              db.tempRoles.build({
                userid: interaction.options.get('user').user.id,
                username: interaction.options.get('user').user.username,
                roleid: interaction.options.get('role').role.id,
                rolename: interaction.options.get('role').role.name,
                expireAt: new Date(new Date().getTime() + (seconds * 1000)),
                duration: interaction.options.get('duration').value as string,
                byid: interaction.user.id,
                byusername: interaction.member.displayName ?? interaction.user.username
              }).save();
              interaction.editReply(`Added **${interaction.options.get('role').role.name}** to **${(interaction.options.get('user').member as GuildMember).displayName ?? interaction.options.get('user').user.username}**${interaction.options.get('duration') ? ` for **${interaction.options.get('duration').value}**` : ''}`);
            }).catch((error) => console.log(error));
          }).catch((error) => console.log(error));
        } else {
          interaction.editReply(`Bot does not have permissions to add **${interaction.options.get('role').role.name}**`);
        }
      });
    } else if (subCommand === 'edit') {
      const exists = await db.tempRoles.findAll({ where: { roleid: interaction.options.get('role').role.id, userid: interaction.options.get('user').user.id}});
      const seconds: number = durationToSeconds(interaction.options.get('duration')?.value as string);
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
      const remove = await db.tempRoles.findAll({ where: { roleid: interaction.options.get('role').role.id, userid: interaction.options.get('user').user.id}});
      for (let i = 0; i < remove.length; i++) remove[i].destroy();
      const guild = client.guilds.resolve(process.env.GUILD_ID);
      guild.members.fetch(process.env.BOT_ID).then((botMember: GuildMember) => {
        if (botMember.roles.highest.position >= guild.roles.resolve(interaction.options.get('role').role.id).position) {
          guild.members.fetch(interaction.options.get('user').user.id).then((member: GuildMember) => {
            member.roles.remove(interaction.options.get('role').role.id).then(async () => {
              interaction.editReply(`Removed **${interaction.options.get('role').role.name}** from **${(interaction.options.get('user').member as GuildMember).displayName ?? interaction.options.get('user').user.username}**`);
            }).catch((error) => console.log(error));
          }).catch((error) => console.log(error));
        } else {
          interaction.editReply(`Bot does not have permissions to remove **${interaction.options.get('role').role.name}**`);
        }
      });
    }
  }
});
