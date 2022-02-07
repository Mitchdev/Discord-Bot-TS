import { Invite } from 'discord.js';
import { db } from '../..';
import Event from '../../structures/Event';

export default new Event('on', 'inviteDelete', async (invite: Invite) => {
  const inv = await db.invites.findByPk(invite.code);
  await inv.destroy();
});
