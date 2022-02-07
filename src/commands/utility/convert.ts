import { ApplicationCommandOptionType } from 'discord.js';
import Command from '../../structures/Command';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'convert',
  description: 'Converts amount from one unit to another',
  options: [{
    name: 'amount',
    type: ApplicationCommandOptionType.String,
    description: 'Amount in source unit',
    required: true,
  }, {
    name: 'source',
    type: ApplicationCommandOptionType.String,
    description: 'Source unit',
    required: true,
  }, {
    name: 'target',
    type: ApplicationCommandOptionType.String,
    description: 'Target unit',
    required: true,
  }],
  run: async ({ interaction }) => {
    await interaction.deferReply({ephemeral: true});
    interaction.editReply('Soon');
  }
});
