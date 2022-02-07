interface MessagesAttributes {
  id: string;
  username: string;
  discriminator: string;
  nickname: string | null;

  total: number;
  seven_days: string;
}

export default MessagesAttributes;
