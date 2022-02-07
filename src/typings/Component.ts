import { InteractionButtonOptions, MessageSelectMenuOptions } from 'discord.js';
import Client from '../structures/Client';
import { ExtendedButtonInteraction, ExtendedInteractionType, ExtendedSelectMenuInteraction } from './Interaction';

interface ComponentRunOptions {
  client: Client,
  interaction: ExtendedButtonInteraction | ExtendedSelectMenuInteraction
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponentRunFunction = (options: ComponentRunOptions) => any;

type ExtendedComponentType = {
  run: ComponentRunFunction;
} & ExtendedInteractionType & (InteractionButtonOptions | MessageSelectMenuOptions)

export default ExtendedComponentType;
