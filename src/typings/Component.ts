import Client from '../structures/Client';
import { ExtendedButtonInteraction, ExtendedInteractionType, ExtendedSelectMenuInteraction } from './Interaction';

interface ComponentRunOptions {
  client: Client;
  interaction: ExtendedButtonInteraction | ExtendedSelectMenuInteraction;
  args: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponentRunFunction = (options: ComponentRunOptions) => any;

type ExtendedComponentType = {
  customId: string;
  run: ComponentRunFunction;
} & ExtendedInteractionType

export default ExtendedComponentType;
