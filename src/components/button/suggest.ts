import { ActionRow, ActionRowComponent, ButtonComponent, ButtonStyle, GuildEmoji, TextChannel } from 'discord.js';
import fetch from 'node-fetch';
import sharp from 'sharp';
import { client, db } from '../..';
import Color, { SuggestionStatusColor } from '../../enums/Color';
import { GuildEmoteLimits, GuildStickerLimits } from '../../enums/Limits';
import Component from '../../structures/Component';
import { capitalize } from '../../structures/Utilities';
import Embed from '../../typings/Embed';

export default new Component({
  idType: 'ButtonInteraction',
  customId: 'suggest',
  run: async ({ interaction, args }) => {
    const suggestion = await db.suggestions.findByPk(args[2]);
    if (suggestion) {
      if (args[1] === 'Deleted' && args[0] === 'emote') {
        await interaction.deferUpdate();
        if (suggestion.status === 'Pending') {
          await interaction.deleteReply();
          client.guilds.resolve(process.env.GUILD_ID).emojis.resolve(args[3]).delete().then(async (deletedEmoji: GuildEmoji) => {

            const logEmbed = new Embed()
              .setTitle(`Emote Deleted by ${interaction.user.username}#${interaction.user.discriminator}`)
              .setColor(Color.RED)
              .setDescription(`\`<${deletedEmoji.animated ? 'a' : ''}:${deletedEmoji.name}:${deletedEmoji.id}>\``)
              .setImage(deletedEmoji.url);

            (client.channels.resolve(process.env.CHANNEL_EMOTE) as TextChannel).send({embeds: [logEmbed]});

            const suggestionMessage = (client.channels.resolve(process.env.CHANNEL_EMOTE) as TextChannel).messages.resolve(suggestion.messageid);
            const image = sharp(await (await fetch(suggestion.suggestion)).buffer());
            const metadata = await image.metadata();
            const imageBuffer = (metadata.format === 'gif') ? await sharp(await (await fetch(suggestion.suggestion)).buffer(), { animated: true }).toBuffer() : await image.toBuffer();
            interaction.guild.emojis.create(imageBuffer, suggestion.name).then(async (emoji: GuildEmoji) => {
              await suggestion.set('status', 'Accepted').save();
              const embed = (suggestionMessage.embeds[0] as Embed)
                .setTitle(`#${suggestion.id} | ${capitalize(suggestion.type)} Suggestion - ${suggestion.status}`)
                .setColor(SuggestionStatusColor[suggestion.status]);

              await suggestionMessage.edit({embeds: [embed], components: []});

              const logEmbed = new Embed()
                .setTitle(`Emote Created by ${interaction.user.username}#${interaction.user.discriminator}`)
                .setColor(Color.GREEN)
                .setDescription(`\`<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>\``)
                .setImage(emoji.url);

              (client.channels.resolve(process.env.CHANNEL_EMOTE) as TextChannel).send({embeds: [logEmbed]});
            }).catch(async () => {
              await interaction.editReply('Could not add emote.');
            });
          }).catch(async () => {
            await interaction.editReply('Failed to delete emote');
          });
        } else {
          await interaction.deleteReply();
        }
      } else if (args[1] === 'Denied' && (args[0] === 'emote' || args[0] === 'sticker')) {
        await interaction.deferUpdate();
        await suggestion.set('status', 'Denied').save();
        const embed = (interaction.message.embeds[0] as Embed)
          .setTitle(`#${suggestion.id} | ${capitalize(suggestion.type)} Suggestion - Denied`)
          .setColor(SuggestionStatusColor.Denied);
        await interaction.editReply({embeds: [embed], components: []});
      } else if (args[0] === 'emote' && args[1] === 'Accepted') {
        const image = sharp(await (await fetch(suggestion.suggestion)).buffer());
        const metadata = await image.metadata();
        const imageBuffer = (metadata.format === 'gif') ? await sharp(await (await fetch(suggestion.suggestion)).buffer(), { animated: true }).toBuffer() : await image.toBuffer();
        const emojisSize = (await interaction.guild.emojis.fetch()).filter((emoji) => emoji.animated === (metadata.format === 'gif')).size;
        if (emojisSize >= GuildEmoteLimits['_' + interaction.guild.premiumTier.toString()]) {
          await interaction.deferReply();
          await suggestion.set('messageid', interaction.message.id).save();
          const emotes = (await db.emotes.findAll({
            where: {
              guild: true,
              deleted: false,
              animated: metadata.format === 'gif'
            }
          })).sort((a, b) => {
            if (a.sevenDays.length === b.sevenDays.length) return b.uses - a.uses;
            else return b.sevenDays.length - a.sevenDays.length;
          });
          const bottom = emotes.slice(-10).reverse();
          const buttons = [new ActionRow(), new ActionRow()];

          for (let i = 0; i < bottom.length; i++) {
            buttons[(i < 5) ? 0 : 1].addComponents(
              new ButtonComponent()
                .setCustomId(`suggest|emote|Deleted|${args[2]}|${bottom[i].id}`)
                .setLabel(`${bottom[i].name} - ${bottom[i].uses} - ${bottom[i].sevenDays.length}`)
                .setStyle(ButtonStyle.Primary)
                .setEmoji({
                  name: bottom[i].name,
                  id: bottom[i].id,
                  animated: bottom[i].animated
                })
            );
          }

          await interaction.editReply({
            content: `Max emotes (${GuildEmoteLimits['_' + interaction.guild.premiumTier.toString()]}):\nPlease select a emote to delete.\n(name - total uses - one week uses)`,
            components: buttons
          });
        } else {
          interaction.guild.emojis.create(imageBuffer, suggestion.name).then(async () => {
            await suggestion.set('status', 'Accepted').save();
            const embed = (interaction.message.embeds[0] as Embed)
              .setTitle(`#${suggestion.id} | ${capitalize(suggestion.type)} Suggestion - ${suggestion.status}`)
              .setColor(SuggestionStatusColor[suggestion.status]);

            await interaction.deferUpdate();
            await interaction.editReply({embeds: [embed], components: []});

            const logEmbed = new Embed()
              .setTitle(`Emote Created by ${interaction.user.username}#${interaction.user.discriminator}`)
              .setColor(Color.GREEN)
              .setDescription(`**${suggestion.name}**`)
              .setImage(suggestion.suggestion);

            (client.channels.resolve(process.env.CHANNEL_EMOTE) as TextChannel).send({embeds: [logEmbed]});
          }).catch(async () => {
            await interaction.deferReply({ ephemeral: true });
            await interaction.editReply('Could not add emote.');
          });
        }
      } else if (args[0] === 'sticker' && args[1] === 'Accepted') {
        const stickers = await interaction.guild.stickers.fetch();
        if (stickers.size >= GuildStickerLimits['_' + interaction.guild.premiumTier.toString()]) {
          await interaction.deferReply({ ephemeral: true });
          await interaction.editReply(`Max stickers (${GuildStickerLimits['_' + interaction.guild.premiumTier.toString()]}):\nPlease delete a sticker first.`);
        } else {
          const imageBuffer = await sharp(await (await fetch(suggestion.suggestion)).buffer()).png().toBuffer();
          const sticker = await interaction.guild.stickers.create(imageBuffer, suggestion.name, suggestion.emoji);
          if (sticker) {
            await suggestion.set('status', 'Accepted').save();
            const embed = (interaction.message.embeds[0] as Embed)
              .setTitle(`#${suggestion.id} | ${capitalize(suggestion.type)} Suggestion - ${suggestion.status}`)
              .setColor(SuggestionStatusColor[suggestion.status]);

            await interaction.deferUpdate();
            await interaction.editReply({embeds: [embed], components: []});

            const logEmbed = new Embed()
              .setTitle(`Sticker Created by ${interaction.user.username}#${interaction.user.discriminator}`)
              .setColor(Color.GREEN)
              .setDescription(`**${suggestion.name}**`)
              .setImage(suggestion.suggestion);

            (client.channels.resolve(process.env.CHANNEL_EMOTE) as TextChannel).send({embeds: [logEmbed]});
          } else {
            await interaction.deferReply({ ephemeral: true });
            await interaction.editReply('Could not add sticker.');
          }
        }
      } else if (args[0] === 'server' || args[0] === 'bot') {
        await interaction.deferUpdate();
        if (args[1] === 'In Progress' || args[1] === 'Completed' || args[1] === 'Denied') {
          await suggestion.set('status', args[1]).save();
          const embed = (interaction.message.embeds[0] as Embed)
            .setTitle(`#${suggestion.id} | ${capitalize(suggestion.type)} Suggestion - ${suggestion.status}`)
            .setColor(SuggestionStatusColor[suggestion.status]);
          await interaction.editReply({embeds: [embed], components: interaction.message.components as ActionRow<ActionRowComponent>[]});
        }
      }
    } else {
      await interaction.deferReply({ ephemeral: true });
      await interaction.editReply('Could not find id in suggestions');
    }
  }
});
