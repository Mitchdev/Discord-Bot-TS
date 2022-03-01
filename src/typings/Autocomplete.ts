import { AutocompleteInteraction } from 'discord.js';
import Client from '../structures/Client';
import { ExtendedInteractionType } from './Interaction';

interface AutocompleteRunOptions {
  client: Client;
  interaction: AutocompleteInteraction;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AutocompleteRunFunction = (options: AutocompleteRunOptions) => any;

type ExtendedAutocompleteType = {
  optionName: string;
  run: AutocompleteRunFunction;
} & ExtendedInteractionType

export default ExtendedAutocompleteType;
