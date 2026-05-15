export default interface OpenAIFlagResponse {
  flagged: boolean,
  flags?: string[],
}