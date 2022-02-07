import { GuildBan, TextChannel } from 'discord.js';
import { client } from '../..';
import Event from '../../structures/Event';

export default new Event('on', 'guildBanAdd', (ban: GuildBan) => {
  (client.channels.resolve(process.env.CHANNEL_MOD) as TextChannel).send({content: `**${ban.user.username}** got banned.`});
});
