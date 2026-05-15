import { ApplicationCommandOptionType, MessageFlags } from 'discord.js';
import { openai } from '../..';
import Command from '../../structures/Command';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'openai',
  description: 'OpenAi',
  options: [{
    name: 'wipe',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Wipe history'
  }, {
    name: 'maxoutputtokens',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Max Output Tokens',
    options: [{
      name: 'tokens',
      type: ApplicationCommandOptionType.Number,
      description: 'Max Output Tokens',
      required: true,
      min_value: 0,
      max_value: 500
    }]
  }],
  run: async ({ interaction, subCommand }) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (subCommand === 'wipe') {
      openai.wipe();
      await interaction.editReply('Wiped');
    } else if (subCommand === 'maxoutputtokens') {
      // openai.maxoutputtokens = (interaction.options.get('tokens').value as number)
      await interaction.editReply(`Set max output tokens to ${interaction.options.get('tokens').value}`);
    }
  }
});
