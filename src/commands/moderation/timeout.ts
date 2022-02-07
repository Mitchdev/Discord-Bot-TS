import { ApplicationCommandOptionType, ApplicationCommandPermissionType, GuildMember } from 'discord.js';
import Command from '../../structures/Command';
import { durationToSeconds } from '../../structures/Utilities';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'timeout',
  description: 'Time out user',
  userPermissions: [{
    id: process.env.ROLE_MOD,
    type: ApplicationCommandPermissionType.Role,
    permission: true
  }],
  defaultPermission: false,
  options: [{
    type: ApplicationCommandOptionType.User,
    name: 'user',
    description: 'The User to time out',
    required: true
  }, {
    type: ApplicationCommandOptionType.String,
    name: 'duration',
    description: 'Duration of the time out (1s - 7d)',
    required: true,
    autocomplete: true
  }],
  run: async ({ interaction }) => {
    await interaction.deferReply({ephemeral: true});
    const seconds: number = durationToSeconds(interaction.options.get('duration').value as string);
    if (seconds) {
      if (seconds > 0 && seconds < 604800) {
        (interaction.options.get('user').member as GuildMember).timeout(seconds * 1000, `Timed out by ${interaction.member.displayName}`);
        interaction.editReply(`Timed out ${(interaction.options.get('user').member as GuildMember).displayName} for ${interaction.options.get('duration').value}.`);
      } else {
        interaction.editReply('Duration not within range (1s - 7d).');
      }
    } else {
      interaction.editReply('Invalid duration. (1s - 7d)');
    }
  }
});
