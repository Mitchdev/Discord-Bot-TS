import { ExtendedInteraction } from './Interaction';

export default interface OpenAIQueueItem {
  interaction: ExtendedInteraction,
  text: string,
  image: string | null,
  type: 'gpt'|'dalle',
}