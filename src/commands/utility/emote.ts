import { ApplicationCommandOptionType, Embed } from 'discord.js';
import { db } from '../..';
import Command from '../../structures/Command';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'emote',
  description: 'Emote commands',
  options: [{
    name: 'list',
    type: ApplicationCommandOptionType.SubcommandGroup,
    description: 'List emotes commands',
    options: [{
      name: 'top',
      type: ApplicationCommandOptionType.Subcommand,
      description: 'List top emotes',
      options: [{
        name: 'static',
        type: ApplicationCommandOptionType.Boolean,
        description: 'Show animated or static emotes',
        required: true
      }]
    }, {
      name: 'bottom',
      type: ApplicationCommandOptionType.Subcommand,
      description: 'List bottom emotes',
      options: [{
        name: 'static',
        type: ApplicationCommandOptionType.Boolean,
        description: 'Show animated or static emotes',
        required: true
      }]
    }, {
      name: 'all',
      type: ApplicationCommandOptionType.Subcommand,
      description: 'List all emotes'
    }]
  }],
  run: async ({ interaction, subCommandGroup, subCommand }) => {
    await interaction.deferReply();
    if (subCommandGroup === 'list') {
      if (subCommand === 'all') {
        await interaction.editReply('https://mitchdev.net/dgg/discord/emotes');
      } else {
        const emotes = (await db.emotes.findAll({
          where: {
            guild: true,
            deleted: false,
            animated: !(interaction.options.get('static').value as boolean)
          }
        })).sort((a, b) => {
          if (a.sevenDays.length === b.sevenDays.length) return b.uses - a.uses;
          else return b.sevenDays.length - a.sevenDays.length;
        });
        const ten = (subCommand === 'top') ? emotes.slice(0, 10) : emotes.slice(-10).reverse();
        const embed = new Embed()
          .setTitle(`${subCommand === 'top' ? 'Top' : 'Bottom'} 10 emotes`)
          .addFields({
            name: '# - Emote - Total - Weekly',
            value: ten.map((emote) => `**${emotes.findIndex((e) => e.id === emote.id)+1}** - ${emote.getEmoteString()} - **${emote.uses}** - **${emote.sevenDays.length}**`).join('\n'),
            inline: true
          });
        interaction.editReply({embeds: [embed]});
      }
    }
  }
});
