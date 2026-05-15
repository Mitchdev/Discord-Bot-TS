import { ApplicationCommandOptionType, MessageFlags } from 'discord.js';
import { openai } from '../..';
import Command from '../../structures/Command';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'generate',
  description: 'Dall-E',
  options: [{
    name: 'prompt',
    type: ApplicationCommandOptionType.String,
    description: 'Prompt to generate image.',
    required: true,
  }],
  run: async ({ interaction }) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const queuePos = openai.addQueue({
      interaction,
      text: (interaction.options.get('prompt').value as string),
      image: null,
      type: 'dalle',
    });

    await interaction.editReply(`Added image generation request to queue position ${queuePos}/${openai.queue.length}`);
  }
});
