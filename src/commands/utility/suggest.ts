import { ActionRow, ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonComponent, ButtonStyle, EmbedBuilder, TextChannel } from 'discord.js';
import fetch from 'node-fetch';
import sharp from 'sharp';
import { client, db, Util } from '../..';
import { SuggestionStatusColor } from '../../enums/Color';
import { GuildEmoteLimits, GuildStickerLimits } from '../../enums/Limits';
import Command from '../../structures/Command';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'suggest',
  description: 'Suggestion commands',
  options: [{
    name: 'emote',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Emote suggestion',
    options: [{
      name: 'name',
      type: ApplicationCommandOptionType.String,
      description: 'Emote name',
      required: true
    }, {
      name: 'image',
      type: ApplicationCommandOptionType.String,
      description: 'Emote image',
      required: true
    }]
  }, {
    name: 'sticker',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Sticker suggestion',
    options: [{
      name: 'name',
      type: ApplicationCommandOptionType.String,
      description: 'Sticker name',
      required: true
    }, {
      name: 'image',
      type: ApplicationCommandOptionType.String,
      description: 'Sticker image',
      required: true
    }, {
      name: 'emoji',
      type: ApplicationCommandOptionType.String,
      description: 'Related emoji',
      required: true
    }]
  }, {
    name: 'server',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Server suggestion',
    options: [{
      name: 'suggestion',
      type: ApplicationCommandOptionType.String,
      description: 'Suggestion',
      required: true
    }]
  }, {
    name: 'bot',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Bot suggestion',
    options: [{
      name: 'suggestion',
      type: ApplicationCommandOptionType.String,
      description: 'Suggestion',
      required: true
    }]
  }, {
    name: 'status',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Status of suggestion',
    options: [{
      name: 'id',
      type: ApplicationCommandOptionType.Integer,
      description: 'Id of suggestion',
      required: true
    }]
  }],
  run: async ({ interaction, subCommand }) => {
    await interaction.deferReply({ ephemeral: true });
    if (subCommand === 'emote' || subCommand === 'sticker') {
      if (Util.validUrl(interaction.options.get('image').value as string)) {
        const response = await fetch(interaction.options.get('image').value as string);
        const buffer = await response.buffer();
        if (response.headers.get('content-type')?.startsWith('image')) {
          const metadata = await sharp(buffer).metadata();
          let stickerEmote = null;
          if (subCommand === 'emote') {
            if (!(metadata.format === 'png' || metadata.format === 'jpeg' || metadata.format === 'jpg' || metadata.format === 'gif')) return await interaction.editReply(`Emote format of **${metadata.format}** needs to be (**PNG**, **JPG**, **JPEG** or **GIF**)`);
            if (metadata.size >= 256000) return await interaction.editReply(`Emote size of **${Math.round(metadata.size / 1000)}KB** is too big.\nEmote image needs to be **256KB or less**`);
          } else if (subCommand === 'sticker') {
            if (!(metadata.format === 'png' || metadata.format === 'jpeg' || metadata.format === 'jpg')) return await interaction.editReply(`Sticker format of **${metadata.format}** needs to be (**PNG**, **JPG** or **JPEG**)`);
            if (metadata.size >= 512000) return await interaction.editReply(`Sticker size of **${Math.round(metadata.size / 1000)}KB** is too big.\nSticker image needs to be **512KB or less**`);
            if (metadata.width !== 320 || metadata.height !== 320) return await interaction.editReply(`Sticker dimensions of **${metadata.width}px width, ${metadata.height}px height** is the incorrect size.\nSticker image needs to be **320px width, 320px height**`);

            const unicodeEmojiMatch = (interaction.options.get('emoji').value as string).match(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g);
            if (unicodeEmojiMatch) stickerEmote = unicodeEmojiMatch[0];
            else return await interaction.editReply({content: 'Invalid emoji, Emoji needs to be default (unicode) emoji'});
          }

          const suggestion = await db.suggestions.build({
            type: subCommand,
            suggestion: interaction.options.get('image').value as string,
            name: interaction.options.get('name').value as string,
            emoji: stickerEmote,
            status: 'Pending',
            suggesterid: interaction.user.id,
            suggesterusername: interaction.user.username
          }).save();

          const buttons = new ActionRowBuilder().addComponents([
            new ButtonBuilder()
              .setCustomId(`suggest|${suggestion.type}|Accepted|${suggestion.id}`)
              .setLabel('Accept')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId(`suggest|${suggestion.type}|Denied|${suggestion.id}`)
              .setLabel('Deny')
              .setStyle(ButtonStyle.Danger)
          ]);

          const embed = new EmbedBuilder()
            .setTitle(`ID: ${suggestion.id} | ${Util.capitalize(suggestion.type)} Suggestion - ${suggestion.status}`)
            .setURL(suggestion.suggestion)
            .setImage(suggestion.suggestion)
            .setTimestamp(suggestion.createdAt)
            .addFields([{
              name: `${Util.capitalize(suggestion.type)} Name`,
              value: suggestion.name,
            }]);
          if (suggestion.type === 'sticker') {
            embed.addFields([{
              name: 'Sticker Emoji',
              value: stickerEmote
            }])
            .setFooter({ text: `${(await interaction.guild.stickers.fetch()).size}/${GuildStickerLimits['L' + interaction.guild.premiumTier.toString()]} Used` });
          } else if (suggestion.type === 'emote') {
            const emojisSize = (await interaction.guild.emojis.fetch()).filter((emoji) => emoji.animated === (metadata.format === 'gif')).size;
            embed.addFields([{
              name: 'Animated Emote',
              value: metadata.format === 'gif' ? 'Yes' : 'No'
            }])
            .setFooter({ text: `${emojisSize}/${GuildEmoteLimits['L' + interaction.guild.premiumTier.toString()]} Used` });
          }

          await interaction.user.send({embeds: [embed]});

          embed.addFields([{
            name: 'Suggester Username',
            value: suggestion.suggesterusername
          }, {
            name: 'Suggester ID',
            value: suggestion.suggesterid
          }]);

          const message = await (client.channels.resolve(process.env.CHANNEL_EMOTE) as TextChannel).send({embeds: [embed], components: [buttons] as unknown as ActionRow<ButtonComponent>[]});
          await interaction.editReply('Suggestion Sent (see DMs for suggestion id)');
          await suggestion.set('messageid', message.id).save();
        } else return await interaction.editReply('Invalid Image');
      } else return await interaction.editReply('Invalid URL');
    } else if (subCommand === 'server' || subCommand === 'bot') {
      const suggestion = await db.suggestions.build({
        type: subCommand,
        suggestion: interaction.options.get('suggestion').value as string,
        status: 'Pending',
        suggesterid: interaction.user.id,
        suggesterusername: interaction.user.username
      }).save();

      const buttons = new ActionRowBuilder().addComponents([
        new ButtonBuilder()
          .setCustomId(`suggest|${suggestion.type}|In Progress|${suggestion.id}`)
          .setLabel('In Progress')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`suggest|${suggestion.type}|Completed|${suggestion.id}`)
          .setLabel('Complete')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`suggest|${suggestion.type}|Denied|${suggestion.id}`)
          .setLabel('Deny')
          .setStyle(ButtonStyle.Danger)
      ]);

      const embed = new EmbedBuilder()
        .setTitle(`ID: ${suggestion.id} | ${Util.capitalize(suggestion.type)} Suggestion - ${suggestion.status}`)
        .setDescription(suggestion.suggestion)
        .setTimestamp(suggestion.createdAt);

        await interaction.user.send({embeds: [embed]});

        embed.addFields([{
          name: 'Suggester Username',
          value: suggestion.suggesterusername
        }, {
          name: 'Suggester ID',
          value: suggestion.suggesterid
        }]);

      const message = await (client.channels.resolve(subCommand === 'bot' ? process.env.CHANNEL_BOT : process.env.CHANNEL_MOD) as TextChannel).send({embeds: [embed], components: [buttons] as unknown as ActionRow<ButtonComponent>[]});
      await interaction.editReply('Suggestion Sent (see DMs for suggestion id)');
      await suggestion.set('messageid', message.id).save();
    } else if (subCommand === 'status') {
      const suggestion = await db.suggestions.findByPk(interaction.options.get('id').value as number);
      if (suggestion) {
        if (suggestion.suggesterid === interaction.user.id || client.guilds.resolve(process.env.GUILD_ID).members.resolve(interaction.user.id).roles.resolve(process.env.ROLE_MOD)) {
          const embed = new EmbedBuilder()
            .setTitle(`ID: ${suggestion.id} | ${Util.capitalize(suggestion.type)} Suggestion - ${suggestion.status}`)
            .setColor(SuggestionStatusColor[suggestion.status])
            .setTimestamp(suggestion.createdAt);
          if (suggestion.type === 'emote' || suggestion.type === 'sticker') {
            embed.setURL(suggestion.suggestion)
              .setImage(suggestion.suggestion)
              .addFields([{
                name: `${Util.capitalize(suggestion.type)} Name`,
                value: suggestion.name
              }]);
            if (suggestion.type === 'sticker') {
              embed.addFields([{
                name: 'Sticker Emoji',
                value: suggestion.emoji
              }]);
            }
          } else embed.setDescription(suggestion.suggestion);
          await interaction.editReply({embeds: [embed]});
        } else return await interaction.editReply(`You did not create suggestion id: **${interaction.options.get('id').value}**`);
      } else return await interaction.editReply(`Could not find suggestion with id: **${interaction.options.get('id').value}**`);
    }
  }
});
