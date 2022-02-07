import { OverwriteType } from 'discord-api-types';
import { ChannelType, NonThreadGuildBasedChannel, PermissionFlagsBits, TextChannel } from 'discord.js';
import Event from '../../structures/Event';

export default new Event('on', 'channelCreate', (channel: NonThreadGuildBasedChannel) => {
  if (channel.type === ChannelType.GuildText) {
    const textChannel: TextChannel = channel as TextChannel;

    if (textChannel.guildId === process.env.GUILD_ID) {
      textChannel.permissionOverwrites.set([{
        type: OverwriteType.Role,
        id: '829613714483183631',
        deny: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions]
      }], 'Added muted role');
    }
  }
});