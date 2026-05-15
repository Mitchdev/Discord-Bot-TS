import { Tool } from 'openai/resources/responses/responses';

export default class GPTTool {
  enabled: boolean;
  tool: Tool;
  fn: Function;
  constructor(enabled: boolean, tool: Tool, fn: Function) {
    this.enabled = enabled;
    this.tool = tool;
    this.fn = fn;
  }
}
