import { ClientEvents } from 'discord.js';

export default class Event<Key extends keyof ClientEvents> {
  constructor(
    public type: 'on' | 'once',
    public event: Key,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public run: (...args: ClientEvents[Key]) => any
  ) {

  }
}
