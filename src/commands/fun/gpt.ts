import { ApplicationCommandOptionType, MessageFlags } from 'discord.js';
import { openai } from '../..';
import Command from '../../structures/Command';
import OpenAIQueueItem from '../../typings/OpenAIQueueItem';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'gpt',
  description: 'ChatGPT',
  options: [{
    name: 'question',
    type: ApplicationCommandOptionType.String,
    description: 'Question to ask ChatGPT',
    required: true,
  }, {
    name: 'image',
    type: ApplicationCommandOptionType.Attachment,
    description: 'PNG, JPG, JPEG, WEBP or GIF Image to give ChatGPT',
    required: false,
  }],
  run: async ({ interaction }) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const queue: OpenAIQueueItem = {
      interaction,
      text: (interaction.options.get('question').value as string), 
      image: null,
      type: 'gpt',
    };

    const image = interaction.options.get('image')?.attachment;
    if (image) {
      if (['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(image.contentType)) {
        if (image.size <= 20000000) {
          queue.image = image.url;
        } else {
          return await interaction.editReply(`Image is ${image.size / 1000000}MB needs to be below 20MB`);
        }
      } else {
        return await interaction.editReply(`${image.contentType} not supports please use png, jpeg, jpg, webp or gif.`);
      }
    }

    const queuePos = openai.addQueue(queue);

    await interaction.editReply(`Added question to queue position ${queuePos}/${openai.queue.length}`);
  }
});
