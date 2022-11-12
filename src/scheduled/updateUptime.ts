import { writeFileSync } from 'fs';
import { startDate } from '..';
import Scheduled from '../structures/Scheduled';

export default new Scheduled('update_uptime', 5, true, async () => {
  writeFileSync('/home/mitch/bots/discord_ts/uptime', `${new Date().getTime() / 1000} ${(new Date().getTime() - startDate.getTime()) / 1000}`);
});
