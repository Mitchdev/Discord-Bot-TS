import { Message } from 'discord.js';
import { convert } from '..';

/**
 * Converts webm to mp4 and replies with it to a message.
 * @param {Message} message message to reply to.
 * @param {string} url url of the webm file.
 * @param {string} filename name of the file in the url.
 * @example Util.embedTweet(message, 'http://example.com/example.webm', 'example')
 */
export default async function embedTweet(message: Message, url: string, filename: string) {
  const botMessage = await message.reply('Starting...');
  const tasks = {};

  tasks[`channel-${message.channel.id}`] = { 'operation': 'import/url', 'url': url, 'filename': `${filename}.webm` };
  tasks[`message-${message.id}`] = { 'operation': 'convert', 'input_format': 'webm', 'output_format': 'mp4', 'input': [`channel-${message.channel.id}`], 'filename': `${filename}.mp4` };
  tasks[`author-${message.author.id}`] = { 'operation': 'export/url', 'input': [`message-${message.id}`], 'inline': true, 'archive_multiple_files': false };

  const job = await convert.new(tasks);

  job.on('created', async (event) => console.log('created', event.task));
  job.on('failed', async (event) => console.log('failed', event.task));
  job.on('updated', async (event) => {
    if (event.task.status === 'finished' && event.task.operation === 'export/url') {
      job.stop();
      await botMessage.edit('Uploading to discord... (can take a while)');
      await message.reply({ files: [ event.task.result?.files[0]?.url ] });
      await botMessage.delete();
    } else {
      await botMessage.edit(event.task.operation === 'import/url' ? 'Downloading from url...' : (event.task.operation === 'convert' ? 'Converting from webm to mp4...' : 'Uploading...'));
    }
  });
}
