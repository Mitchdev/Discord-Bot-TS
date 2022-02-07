import { Invite } from 'discord.js';
import { db } from '../..';
import Event from '../../structures/Event';

export default new Event('on', 'inviteCreate', async (invite: Invite) => {
  await db.invites.build({
    id: invite.code,
    username: invite.inviter.username,
    uses: invite.uses
  }).save();
});
