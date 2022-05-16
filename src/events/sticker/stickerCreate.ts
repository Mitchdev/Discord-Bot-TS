import { EmbedBuilder, Sticker, TextChannel } from 'discord.js';
import { client } from '../..';
import Color from '../../enums/Color';
import Event from '../../structures/Event';

export default new Event('on', 'stickerCreate', async (sticker: Sticker) => {
  if ((await sticker.fetchUser()).id !== process.env.BOT_ID) {
    const embed = new EmbedBuilder()
      .setTitle(`Sticker Created by ${(await sticker.fetchUser()).username}#${(await sticker.fetchUser()).discriminator}`)
      .setColor(Color.GREEN)
      .setDescription(`**${sticker.name}**\n${sticker.description}`)
      .setImage(sticker.url);

    (client.channels.resolve(process.env.CHANNEL_EMOTE) as TextChannel).send({embeds: [embed]});
  }
});
