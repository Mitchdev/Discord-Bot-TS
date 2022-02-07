import { ApplicationCommandDataResolvable } from 'discord.js';

export interface registerCommandsOptions {
  clientCommands: ApplicationCommandDataResolvable[];
  guildCommands: ApplicationCommandDataResolvable[];
}
