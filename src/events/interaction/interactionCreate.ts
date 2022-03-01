/* eslint-disable no-empty */
import { AutocompleteInteraction, Interaction } from 'discord.js';
import { client } from '../..';
import Event from '../../structures/Event';
import { ExtendedButtonInteraction, ExtendedInteraction } from '../../typings/Interaction';

/**
 * interaction
 *    .isAutocomplete(): AutocompleteInteraction
 *    .isCommand(): CommandInteraction
 *       .isChatInputCommand(): ChatInputCommandInteraction
 *       .isContextMenuCommand(): ContextMenuCommandInteraction
 *          .isMessageContextMenuCommand(): MessageContextMenuCommandInteraction
 *          .isUserContextMenuCommand(): UserContextMenuCommandInteraction
 *    .isMessageComponent(): MessageComponentInteraction
 *       .isButton(): ButtonInteraction
 *       .isSelectMenu(): SelectMenuInteraction
 */
export default new Event('on', 'interactionCreate', async (interaction: Interaction) => {
  if (interaction.isAutocomplete()) {
    const focused = interaction.options.getFocused(true);
    if (focused.name) {
      const autocomplete = client.autocomplete.get(focused.name + 'AutocompleteInteraction');
      if (!autocomplete) {
        return interaction.respond([{ name: 'Autocomplete unavailable for this option', value: 'null' }]);
      }
      autocomplete.run({client, interaction: interaction as AutocompleteInteraction});
    }
  }
  else if (interaction.isCommand()) { // CommandInteraction
    if (interaction.isChatInputCommand()) { // ChatInputCommandInteraction
      const command = client.commands.get(interaction.commandName + 'ChatInputCommandInteraction');
      if (!command) {
        await interaction.deferReply({ephemeral: true});
        return interaction.editReply('You have used a non exitent slash command');
      }
      command.run({
        client,
        interaction: interaction as ExtendedInteraction,
        subCommandGroup: interaction.options.getSubcommandGroup(false) ?? null,
        subCommand: interaction.options.getSubcommand(false) ?? null
      });
    } else if (interaction.isContextMenuCommand()) { // ContextMenuCommandInteraction
      if (interaction.isMessageContextMenuCommand()) {} // MessageContextMenuCommandInteraction
      else if (interaction.isUserContextMenuCommand()) { // UserContextMenuCommandInteraction
        const command = client.commands.get(interaction.commandName + 'UserContextMenuCommandInteraction');
        if (!command) {
          await interaction.deferReply({ephemeral: true});
          return interaction.editReply('You have used a non exitent context-menu command');
        }
        command.run({
          client,
          interaction: interaction as ExtendedInteraction,
          subCommandGroup: null,
          subCommand: null
        });
      }
    }
  } else if (interaction.isMessageComponent()) { // MessageComponentInteraction
    if (interaction.isButton()) { // ButtonInteraction
      const component = client.components.get(interaction.customId.split('|')[0] + 'ButtonInteraction');
      if (!component) {
        await interaction.deferReply({ephemeral: true});
        return interaction.editReply('You have used a non exitent context-menu command');
      }
      const args = interaction.customId.split('|');
      args.shift();
      component.run({
        client,
        interaction: interaction as ExtendedButtonInteraction,
        args: args
      });
    }
    else if (interaction.isSelectMenu()) {} // SelectMenuInteraction
  }
});
