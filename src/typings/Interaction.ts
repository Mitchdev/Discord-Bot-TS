import { ApplicationCommandPermissionData, ButtonInteraction, CommandInteraction, GuildMember, SelectMenuInteraction } from 'discord.js';

export interface ExtendedInteraction extends CommandInteraction {
  member: GuildMember;
}

export interface ExtendedButtonInteraction extends ButtonInteraction {
  member: GuildMember;
}

export interface ExtendedSelectMenuInteraction extends SelectMenuInteraction {
  member: GuildMember;
}

export type ExtendedInteractionType = {
  idType: 'AutocompleteInteraction' | 'ChatInputCommandInteraction' | 'MessageContextMenuCommandInteraction' | 'UserContextMenuCommandInteraction' | 'ButtonInteraction' | 'SelectMenuInteraction'
  userPermissions?: ApplicationCommandPermissionData[];
  cooldown?: number;
}
