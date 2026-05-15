import { Tool } from 'openai/resources/responses/responses';
import { client } from '..';
import GPTTool from '../structures/GPTTool';

export default new GPTTool(true, {
  type: 'function',
  name: 'get_message_history',
  description: 'Get the last 50 discord messages sent, Example of usage would be to summarize what people are talking about.',
} as Tool, ({ channel }) => {
  if (client.messages.has(channel)) {
    const messages = client.messages.get(channel);
    return { total: messages.length, messages };
  } else {
    return { total: 0, messages: [] };
  }
});