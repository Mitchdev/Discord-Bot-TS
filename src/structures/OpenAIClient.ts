import { readFileSync } from 'fs';
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai';

export default class OpenAIClient {

  maxsize = 25;
  openai: OpenAIApi;
  messages: ChatCompletionRequestMessage[];
  busy: boolean;

  constructor() {
    const configuration = new Configuration({ apiKey: process.env.OPENAI_TOKEN });
    this.openai = new OpenAIApi(configuration);
    this.messages = [];
    this.busy = false;
  }

  wipe() {
    this.messages = [];
  }

  async send(user: string, question: string): Promise<string> {
    if (this.busy) {
      return 'Blame nezz';
    } else {
      this.busy = true;
    }

    const message: ChatCompletionRequestMessage = {
      role: 'user',
      name: user,
      content: question,
    };

    this.messages.push(message);

    if (this.messages.length > this.maxsize) {
      this.messages = this.messages.slice(-this.maxsize);
    }

    const context = readFileSync('./src/resources/gpt/context.txt', 'utf8').toString() ?? '';

    try {
      const response = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: context }, ...this.messages]
      });

      this.busy = false;

      const reply = response.data.choices[0].message.content;

      this.messages.push({
        role: 'assistant',
        content: reply
      });

      return reply;

    } catch (err) {
      this.busy = false;
      return err.response.data.error.message;
    }
  }

}
