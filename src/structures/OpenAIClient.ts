import { readFileSync } from 'fs';
import { OpenAI } from 'openai';
import OpenAIQueueItem from '../typings/OpenAIQueueItem';
import OpenAIFlagResponse from '../typings/OpenAIFlagResponse';
import GPTTool from './GPTTool';
import { glob } from 'glob';
import { ChatModel } from 'openai/resources';
import { FunctionTool, ResponseInputMessageContentList, ResponseOutputMessage, ResponseOutputText, Tool } from 'openai/resources/responses/responses';
import { Record } from 'openai/internal/builtin-types';

export default class OpenAIClient {
  model: ChatModel = 'gpt-5.4-nano';
  modelPrice = {
    input: 0.2,
    cached: 0.02,
    output: 1.25,
  };

  openai: OpenAI;
  conversationId: string;
  queue: OpenAIQueueItem[];
  tools: Tool[];
  functions: Map<string, GPTTool>;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_TOKEN
    });

    this.queue = [];
    this.tools = [{ type: "web_search" }];
    this.functions = new Map();

    this.newConversation();
  }

  async newConversation() {
    const conversation = await this.openai.conversations.create();
    this.conversationId = conversation.id;
  }

  async importFile(filePath: string) {
    return (await import(filePath))?.default;
  }

  async registerTools() {
    const toolFiles = await glob(`${__dirname}/../gpt/*{.ts,.js}`);
    let i = 0;
    toolFiles.forEach(async (filePath, index) => {
      const tool: GPTTool = await this.importFile(filePath);
      if (tool.enabled) {
        i++;
        this.tools.push(tool.tool);
        this.functions.set((tool.tool as FunctionTool).name, tool);
      }
      if (index === toolFiles.length) {
        console.log(`Found ${toolFiles.length} gpt tool files`);
      }
    });
  }

  wipe() {
    this.newConversation();
  }

  addQueue(queueItem: OpenAIQueueItem): number {
    this.queue.push(queueItem);
    return this.queue.findIndex(items => items.interaction.id === queueItem.interaction.id) + 1;
  }

  async send(
    user: string,
    question: string,
    image: string | null,
    channel: string
  ): Promise<{ text: string; cost: string }> {
    const flagResponse = await this.checkFlags(question);
    if (flagResponse.flagged) {
      return {
        text: `Your question was flagged for \`${flagResponse.flags.join(', ')}\``,
        cost: null
      };
    }

    const safeUser = user.replaceAll(/[^a-zA-Z0-9_-]/g, "_");

    const content: ResponseInputMessageContentList = [
      { type: "input_text", text: `${safeUser}: ${question}` }
    ];
    if (image) {
      content.push({ type: "input_image", image_url: image, detail: "auto" });
    }

    const context = readFileSync("./src/resources/gpt/context.txt", "utf8");

    let inputTokens = 0;
    let cachedTokens = 0;
    let outputTokens = 0;

    let response = await this.openai.responses.create({
      model: this.model,
      conversation: this.conversationId,
      reasoning: { effort: "medium" },
      input: [
        { role: "system", content: [{ type: "input_text", text: context }] },
        { role: "user", content }
      ],
      tools: this.tools
    });

    this.conversationId = response.conversation.id;

    inputTokens += response.usage.input_tokens - response.usage.input_tokens_details.cached_tokens;
    cachedTokens += response.usage.input_tokens_details.cached_tokens;
    outputTokens += response.usage.output_tokens;

    const toolCalls = response.output.filter(
      (o): o is OpenAI.Responses.ResponseFunctionToolCall => o.type === "function_call"
    );

    for (const toolCall of toolCalls) {
      const tool = this.functions.get(toolCall.name);
      if (!tool) continue;

      const args = { channel, ...(toolCall.arguments as unknown as Record<string, unknown>) };
      const result = await tool.fn(args);

      await this.openai.responses.create({
        model: this.model,
        conversation: this.conversationId,
        input: [
          {
            type: "function_call_output",
            call_id: toolCall.call_id,
            output: JSON.stringify(result)
          }
        ]
      });
    }

    if (toolCalls.length > 0) {
      response = await this.openai.responses.create({
        model: this.model,
        conversation: this.conversationId,
        reasoning: { effort: "medium" },
        input: []
      });

      inputTokens += response.usage.input_tokens - response.usage.input_tokens_details.cached_tokens;
      cachedTokens += response.usage.input_tokens_details.cached_tokens;
      outputTokens += response.usage.output_tokens;
    }

    const finalText = response.output
      .filter((o): o is ResponseOutputMessage => o.type === "message")
      .map(msg =>
        msg.content
          .filter((c): c is ResponseOutputText => c.type === "output_text")
          .map(c => c.text)
          .join("\n")
      )
      .join("\n");

    return {
      text: finalText,
      cost: (
        (inputTokens / 1_000_000 * this.modelPrice.input) +
        (cachedTokens / 1_000_000 * this.modelPrice.cached) +
        (outputTokens / 1_000_000 * this.modelPrice.output)
      ).toPrecision(2)
    };
  }

  async checkFlags(question: string): Promise<OpenAIFlagResponse> {
    try {
      const response = await this.openai.moderations.create({ input: question });
      if (!response.results[0].flagged) return { flagged: false }
      return {
        flagged: true,
        flags: Object.entries(response.results[0].categories).filter(kv => kv[1]).map(kv => kv[0])
      }
    } catch (err) {
      console.log(err);
      return { flagged: false };
    }
  }

  async dalle(prompt: string): Promise<ArrayBuffer|string> {
    const flagResponse = await this.checkFlags(prompt);
    if (flagResponse.flagged) {
      return `Your question was flagged for \`${flagResponse.flags.join(', ')}\` <:gigaChad:907615037164761088>`;
    }

    try {
      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'url'
      });

      return (await fetch(response.data[0].url)).arrayBuffer();
    } catch (err) {
      console.log(err);
      return 'error';
    }
  }
}
