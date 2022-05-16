import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import { Util } from '../..';
import Command from '../../structures/Command';
import { DGGYoutube, TwitchStream, TwitchUser, TwitchVideo } from '../../typings/apis/Twitch';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'stream',
  description: 'Get stream info',
  options: [{
    name: 'streamer',
    type: ApplicationCommandOptionType.String,
    description: 'Twitch streamer',
    required: true,
  }],
  run: async ({ interaction }) => {
    const streamer = (interaction.options.get('streamer').value as string).toLowerCase();
    await interaction.deferReply();
    if (streamer === 'destiny') {
      const stream = (await (await fetch('https://www.destiny.gg/api/info/stream')).json()).data.streams.youtube as DGGYoutube;
      if (stream.live) {
        const embed = new EmbedBuilder()
          .setTitle('Destiny')
          .setURL('https://destiny.gg/bigscreen')
          .setThumbnail('https://yt3.ggpht.com/ytc/AKedOLT1T86QYR1qQ4hf-c5wAkACBohE_F2FMjLfMLrh=s88-c-k-c0x00ffffff-no-rj')
          .setDescription(stream.status_text)
          .setImage(stream.preview)
          .setFields([{
            name: 'Uptime',
            value: Util.secondsToDhms((new Date().getTime() - new Date(stream.started_at).getTime()) / 1000, false),
            inline: true
          }, {
            name: 'Viewers',
            value: Util.commaNumber(stream.viewers),
            inline: true
          }]);
          await interaction.editReply({ embeds: [embed] });
      } else {
        const embed = new EmbedBuilder()
          .setTitle('Destiny')
          .setURL('https://destiny.gg/bigscreen')
          .setThumbnail('https://yt3.ggpht.com/ytc/AKedOLT1T86QYR1qQ4hf-c5wAkACBohE_F2FMjLfMLrh=s88-c-k-c0x00ffffff-no-rj')
          .setDescription('Offline')
          .setFooter({ text: `Last online ${Util.secondsToDhms((new Date().getTime() - new Date(stream.ended_at).getTime()) / 1000)}` });
        await interaction.editReply({ embeds: [embed] });
      }
    } else {
      const token = await (await fetch(process.env.TWITCH_AUTH_API, { method: 'POST' })).json();
      const auth = { headers: { 'Client-ID': process.env.TWITCH_CLIENT_ID, 'Authorization': `Bearer ${token.access_token}` } };
      const channels = (await (await fetch(`https://api.twitch.tv/helix/users?login=${streamer}`, auth)).json()).data as TwitchUser[];
      const streams = (await (await fetch(`https://api.twitch.tv/helix/streams?user_login=${streamer}`, auth)).json()).data as TwitchStream[];
      if (streams.length > 0) {
        const stream = streams[0];
        const thumbnail_url = stream.thumbnail_url.replace('{width}', `192${Math.floor(Math.random() * 10)}`).replace('{height}', `108${Math.floor(Math.random() * 10)}`) + `?${Util.randomString(8)}`;
        const thumbnail = await fetch(thumbnail_url);
        setTimeout(async () => { // let image cache
          const embed = new EmbedBuilder()
            .setTitle(stream.user_name)
            .setURL(`https://twitch.tv/${stream.user_name}`)
            .setThumbnail(channels[0].profile_image_url)
            .setDescription(stream.title)
            .setImage(thumbnail_url)
            .setFields([{
              name: 'Uptime',
              value: Util.secondsToDhms((new Date().getTime() - new Date(stream.started_at).getTime()) / 1000, false),
              inline: true
            }, {
              name: 'Viewers',
              value: Util.commaNumber(stream.viewer_count),
              inline: true
            }, {
              name: 'Category',
              value: stream.game_name,
              inline: true
            }]);
            //.setFooter({ text: `Thumbnail from ${Util.secondsToDhms((new Date().getTime() - new Date(thumbnail.headers.get('date')).getTime()) / 1000)}` });
          await interaction.editReply({ embeds: [embed] });
        }, 100);
      } else if (channels.length > 0) {
        const videos = (await (await fetch(`https://api.twitch.tv/helix/videos?type=archive&first=1&user_id=${channels[0].id}`, auth)).json()).data as TwitchVideo[];
        const embed = new EmbedBuilder()
          .setTitle(channels[0].display_name)
          .setURL(`https://twitch.tv/${channels[0].display_name}`)
          .setThumbnail(channels[0].profile_image_url)
          .setDescription('Offline');

        if (videos.length > 0) {
          const offlineDate = new Date(videos[0].created_at).getTime() + twitchDurationToMS(videos[0].duration);
          embed.setFooter({ text: `Last online ${Util.secondsToDhms((new Date().getTime() - offlineDate) / 1000)}` });
        }

        await interaction.editReply({ embeds: [embed] });
      } else {
        await interaction.editReply(`Could not find streamer ${interaction.options.get('streamer').value}`);
      }
    }
  }
});

function twitchDurationToMS(duration: string): number {
  let seconds = 0;
  const array = duration.split(new RegExp('[hms]'));
  array.pop();
  array.reverse().forEach((n, i) => {
    if (i === 0) seconds += parseInt(n);
    if (i === 1) seconds += (parseInt(n) * 60);
    if (i === 2) seconds += (parseInt(n) * 3600);
  });
  return seconds * 1000;
}
