import { AuditLogEvent, Collection, GuildAuditLogsEntry, GuildMember, TextChannel } from 'discord.js';
import { client, db, Util } from '../..';
import Event from '../../structures/Event';

export default new Event('on', 'guildMemberUpdate', async (oldMember: GuildMember, newMember: GuildMember) => {
  if (newMember.communicationDisabledUntilTimestamp) {
    const timeDifference = (new Date(newMember.communicationDisabledUntilTimestamp).getTime() - new Date().getTime());
    const exists = await db.timeouts.findByPk(newMember.id);
    if (timeDifference > 0 && !exists) {
      newMember.guild.fetchAuditLogs().then(async (audit) => {
        const logs = audit.entries.filter((entry) => entry.changes ? entry.changes[0]?.key === 'communication_disabled_until' : false) as unknown as Collection<string, GuildAuditLogsEntry<AuditLogEvent.MemberUpdate>>;
        if (logs.size > 0) {
          const latestTimeout = logs.first();
          await db.timeouts.build({
            id: newMember.id,
            timestamp: newMember.communicationDisabledUntilTimestamp
          }).save();
          await (client.channels.resolve(process.env.CHANNEL_GENERAL) as TextChannel).send({content: `${latestTimeout.executor.username} timed out ${(latestTimeout.target).username} for ${Util.secondsToDhms(timeDifference / 1000, false)}${latestTimeout.reason ? `\nreason: **${latestTimeout.reason}**` : ''}`});
          setTimeout(async () => {
            const timeout = await db.timeouts.findByPk(newMember.id);
            if (timeout) timeout.destroy();
          }, timeDifference);
        }
      });
    }
  }
});
