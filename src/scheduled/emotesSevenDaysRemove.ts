import { db } from '..';
import Scheduled from '../structures/Scheduled';

export default new Scheduled('emotes_seven_day_removal', 1800, true, async () => {
  const sevenDaysAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60000);
  const all = await db.emotes.findAll({ where: {} });
  const expired = all.filter((emote) => {
    if (emote.lastSevenDays) {
      return ((sevenDaysAgo.getTime() - new Date(emote.lastSevenDays).getTime()) > 0);
    } else return false;
  });
  for (let i = 0; i < expired.length; i++) {
    const newSevenDays = expired[i].sevenDays.filter((date) => !(sevenDaysAgo.getTime() - new Date(date).getTime() > 0));
    expired[i].set('seven_days', newSevenDays.join(','));
    expired[i].save();
  }
});
