interface SuggestionsAttributes {
  id: number;

  type: 'bot' | 'server' | 'sticker' | 'emote';

  suggestion: string;

  name: string;
  emoji: string;

  status: 'Completed' | 'Accepted' | 'In Progress' | 'Pending' | 'Denied';

  messageid: string;

  suggesterid: string;
  suggesterusername: string;

  respondentid: string;
  respondentusername: string;
}

export default SuggestionsAttributes;
