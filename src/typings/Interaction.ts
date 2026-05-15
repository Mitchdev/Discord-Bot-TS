import { ButtonInteraction, ChatInputCommandInteraction, GuildMember, StringSelectMenuInteraction } from 'discord.js';

export interface ExtendedInteraction extends ChatInputCommandInteraction {
  member: GuildMember;
}

export interface ExtendedButtonInteraction extends ButtonInteraction {
  member: GuildMember;
}

export interface ExtendedSelectMenuInteraction extends StringSelectMenuInteraction {
  member: GuildMember;
}

export type ExtendedInteractionType = {
  idType: 'AutocompleteInteraction' | 'ChatInputCommandInteraction' | 'MessageContextMenuCommandInteraction' | 'UserContextMenuCommandInteraction' | 'ButtonInteraction' | 'SelectMenuInteraction'
  cooldown?: number;
}
