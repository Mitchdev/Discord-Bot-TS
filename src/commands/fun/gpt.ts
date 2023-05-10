import { ApplicationCommandOptionType } from 'discord.js';
import { openai } from '../..';
import Command from '../../structures/Command';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'gpt',
  description: 'ChatGPT',
  options: [{
    name: 'question',
    type: ApplicationCommandOptionType.String,
    description: 'Question to ask ChatGPT',
    required: true,
  }],
  run: async ({ interaction }) => {
    await interaction.deferReply();

    const question = (interaction.options.get('question').value as string);
    const reply = await openai.send(interaction.user.username, question);

    const message = await interaction.editReply(reply.substring(0, 1999));
    if (reply.length > 2000) message.reply(reply.substring(2000, 3999));
    if (reply.length > 4000) message.reply(reply.substring(4000, 5999));
  }
});
