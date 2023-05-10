import { ApplicationCommandOptionType } from 'discord.js';
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
    name: 'msglen',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Messages array length'
  }, {
    name: 'strlen',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'String length in Messages array'
  }, {
    name: 'maxsize',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Size of history',
    options: [{
      name: 'size',
      type: ApplicationCommandOptionType.Number,
      description: 'Max size of history',
      required: true,
      min_value: 0,
      max_value: 100
    }]
  }],
  run: async ({ interaction, subCommand }) => {
    await interaction.deferReply();

    if (subCommand === 'wipe') {
      openai.wipe();
      await interaction.editReply('Wiped');
    } else if (subCommand === 'msglen') {
      await interaction.editReply(`History Length: (context) + ${openai.messages.length}`);
    } else if (subCommand === 'strlen') {
      await interaction.editReply(`History String Size: ${['2299', ...openai.messages.map((msg) => msg.content.length)].join(', ')}`);
    }
  }
});
