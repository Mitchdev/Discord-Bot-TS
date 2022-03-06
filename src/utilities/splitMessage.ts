import { Message, Util } from 'discord.js';

export default async function splitMessage(content: string | string[], message: Message, codeblock: string = null): Promise<void> {
  if (typeof content === 'string') {
    if (content.length > 0) {
      if (codeblock !== null) content = Util.cleanCodeBlockContent(content);
      content = Util.splitMessage(content);
    } else return;
  }
  if (content.length > 0) {
    const reply = await message.reply(`${codeblock ? `\`\`\`${codeblock}\n` : ''}${content[0]}${codeblock ? '```' : ''}`);
    content.shift();
    return await splitMessage(content, reply, codeblock);
  } else return;
}
