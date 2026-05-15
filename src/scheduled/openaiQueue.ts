import { AttachmentBuilder, AttachmentPayload, BufferResolvable, MessageFlags } from 'discord.js';
import { Stream } from 'stream';
import { openai } from '..';
import Scheduled from '../structures/Scheduled';
import splitMessage from '../utilities/splitMessage';

export default new Scheduled('openai_queue', 5, false, async () => {
  if (openai.queue.length > 0) {
    const queueItem = openai.queue.shift();

    openai.queue.forEach(async (item, index) => {
      await item.interaction.editReply(`Added question to queue position ${index + 1}/${openai.queue.length}`);
    });

    await queueItem.interaction.editReply('Processing...');

    if (queueItem.type === 'gpt') {
      const response = await openai.send(queueItem.interaction.user.displayName, queueItem.text, queueItem.image, queueItem.interaction.channelId);
      const reply = `### <@${queueItem.interaction.user.id}>: ${queueItem.text}\n> ${response.text.replaceAll('\n', '\n> ')}${response.cost !== null ? `\n-# -$${response.cost}` : ''}`;
      const messages = splitMessage(reply);

      messages.forEach(async (message) => {
        const files: (BufferResolvable | Stream | AttachmentBuilder | AttachmentPayload)[] = [];
        if (queueItem.image) {
          files.push({
            attachment: queueItem.image,
          });
        }

        await queueItem.interaction.channel.send({
          content: message,
          flags: [MessageFlags.SuppressEmbeds],
          files
        });
      });
    }

    if (queueItem.type === 'dalle') {
      const image = await openai.dalle(queueItem.text);
      if (typeof image !== 'string') {
        await queueItem.interaction.channel.send({
          content: `### <@${queueItem.interaction.user.id}>: ${queueItem.text}`,
          files: [ new AttachmentBuilder(Buffer.from(image), { name: 'dall-e.png' }) ]
        });
      } else {
        await queueItem.interaction.channel.send(`### <@${queueItem.interaction.user.id}>: ${queueItem.text}\n>>> ${image}`);
      }
    }

    await queueItem.interaction.editReply('Processed!');
  }
});
