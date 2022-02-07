import { ApplicationCommandOptionType, ApplicationCommandPermissionType, CommandInteractionOptionResolver } from 'discord.js';
import { db } from '../..';
import Command from '../../structures/Command';
import { durationToSeconds } from '../../structures/Utilities';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'banphrase',
  description: 'Add or remove banned phrase',
  userPermissions: [{
    id: process.env.ROLE_MOD,
    type: ApplicationCommandPermissionType.Role,
    permission: true
  }],
  defaultPermission: false,
  options: [{
    name: 'add',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Add banned phrase',
    options: [{
      name: 'phrase',
      type: ApplicationCommandOptionType.String,
      description: 'Phrase to ban',
      required: true
    }, {
      name: 'role',
      type: ApplicationCommandOptionType.Role,
      description: 'Role to add if banned phrase is said',
      required: true
    }, {
      name: 'duration',
      type: ApplicationCommandOptionType.String,
      description: 'Duration (1s - 7d) of role given from banned phrase.',
      required: true,
      autocomplete: true
    }]
  }, {
    name: 'remove',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Remove a role from user',
    options: [{
      name: 'phrase',
      type: ApplicationCommandOptionType.String,
      description: 'Phrase to un-ban',
      required: true
    }]
  }, {
    name: 'list',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'List all banned phrases'
  }],
  run: async ({ interaction }) => {
    const type = (interaction.options as CommandInteractionOptionResolver).getSubcommand();
    if (type === 'add') {
      await interaction.deferReply();
      const seconds: number = durationToSeconds(interaction.options.get('duration')?.value as string);
      if (seconds) {
        if (seconds > 0 && seconds < 604800) {
          const exists = await db.bannedPhrases.findOne({ where: { phrase: (interaction.options.get('phrase').value as string).toLowerCase()}});
          if (!exists) {
            db.bannedPhrases.build({
              phrase: (interaction.options.get('phrase').value as string).toLowerCase(),
              roleid: interaction.options.get('role').role.id,
              rolename: interaction.options.get('role').role.name,
              duration: interaction.options.get('duration').value as string,
              seconds: seconds
            }).save();
            interaction.editReply(`Added phrase **${interaction.options.get('phrase').value}** with punishment of role **${interaction.options.get('role').role.name}** for **${interaction.options.get('duration').value}**`);
          } else interaction.editReply(`Phrase **${interaction.options.get('phrase').value}** already exists`);
        } else interaction.editReply('Duration not within range (1s - 7d).');
      } else interaction.editReply('Invalid duration. (1s - 7d)');
    } else if (type === 'remove') {
      await interaction.deferReply();
      const exists = await db.bannedPhrases.findOne({ where: { phrase: (interaction.options.get('phrase').value as string).toLowerCase()}});
      if (exists) {
        exists.destroy();
        interaction.editReply(`Removed phrase **${interaction.options.get('phrase').value}**`);
      } else {
        interaction.editReply(`Phrase **${interaction.options.get('phrase').value}** does not exist`);
      }
    } else if (type === 'list') {
      await interaction.deferReply({ephemeral: true});
      // const bannedPhrases = await db.bannedPhrases.findAll({ where: {} });
      // interaction.editReply(bannedPhrases.map((phrase) => `${phrase.phrase} | ${phrase.rolename} | ${phrase.duration}`).join('\n'));
      interaction.editReply('https://mitchdev.net/dgg/discord/banphrases');
    }
  }
});