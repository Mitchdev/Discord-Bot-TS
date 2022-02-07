interface EmotesAttributes {
  id: string;
  name: string;

  animated: boolean;
  guild: boolean;
  deleted: boolean;

  last_used_date: Date | null;
  last_used_user: string | null;

  uses: number;
  seven_days: string;
}

export default EmotesAttributes;
