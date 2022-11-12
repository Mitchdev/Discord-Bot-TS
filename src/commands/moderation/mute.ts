import { ApplicationCommandOptionType, GuildMember } from 'discord.js';
import { Util } from '../..';
import Command from '../../structures/Command';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'mute',
  description: 'Mute a user',
  options: [{
    name: 'user',
    type: ApplicationCommandOptionType.User,
    description: 'User to mute',
    required: true
  }, {
    name: 'duration',
    type: ApplicationCommandOptionType.String,
    description: 'Duration of mute (1s - 7d)',
    required: true,
    autocomplete: true
  }],
  run: async ({ interaction }) => {
    await interaction.deferReply();
    const seconds = Util.durationToSeconds(interaction.options.get('duration')?.value as string);
    if (seconds) {
      if (seconds <= 0 || seconds >= 604800) return interaction.editReply('Duration not within range (1s - 7d).');
    } else return interaction.editReply('Invalid duration. (1s - 7d)');

    Util.addTempRole({
      id: process.env.ROLE_MUTE,
      name: 'Muted',
    }, {
      id: interaction.options.get('user').user.id,
      username: interaction.options.get('user').user.username,
    }, {
      seconds: seconds,
      duration: interaction.options.get('duration').value as string
    }, interaction,
    `Added **Muted** to **${
      (interaction.options.get('user').member as GuildMember).displayName ?? interaction.options.get('user').user.username
    }**${interaction.options.get('duration') ? ` for **${interaction.options.get('duration').value}**` : ''}`);
  }
});
