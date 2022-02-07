import { ApplicationCommandData } from 'discord.js';
import Client from '../structures/Client';
import { ExtendedInteraction, ExtendedInteractionType } from './Interaction';

interface CommandRunOptions {
  client: Client,
  interaction: ExtendedInteraction
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CommandRunFunction = (options: CommandRunOptions) => any;

type ExtendedCommandType = {
  run: CommandRunFunction;
} & ExtendedInteractionType & ApplicationCommandData

export default ExtendedCommandType;
