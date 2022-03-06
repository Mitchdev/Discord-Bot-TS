import { Embed, GuildEmoji, TextChannel } from 'discord.js';
import { client, db } from '../..';
import Color from '../../enums/Color';
import Event from '../../structures/Event';

export default new Event('on', 'emojiCreate', async (emoji: GuildEmoji) => {
  await db.emotes.build({
    id: emoji.id,
    name: emoji.name,
    animated: emoji.animated ?? false,
    guild: true
  }).save();

  if ((await emoji.fetchAuthor()).id !== process.env.BOT_ID) {
    const embed = new Embed()
      .setTitle(`Emoji Created by ${(await emoji.fetchAuthor()).username}#${(await emoji.fetchAuthor()).discriminator}`)
      .setColor(Color.GREEN)
      .setDescription(`\`<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>\``)
      .setImage(emoji.url);

    (client.channels.resolve(process.env.CHANNEL_EMOTE) as TextChannel).send({embeds: [embed]});
  }
});
