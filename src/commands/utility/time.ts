import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import Color, { ColorDiscord } from '../../enums/Color';
import Command from '../../structures/Command';
import Time from '../../typings/apis/Time';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'time',
  description: 'Gets the local time of a location',
  options: [{
    name: 'location',
    type: ApplicationCommandOptionType.String,
    description: 'Location to get time from',
    required: true
  }],
  run: async ({ interaction }) => {
    await interaction.deferReply();

    const time: Time = await (await fetch(process.env.TIME_API.replace('|location|', interaction.options.get('location').value as string))).json();

    if (Object.keys(time).length > 0) {
      const date = new Date(time.datetime);
      const embed = new EmbedBuilder()
        .setTitle(`Time for ${time.requested_location} is **${timeToString(date.getHours(), date.getMinutes(), true, true)}**`)
        .setDescription(`**${date.getDate()}/${date.getMonth()+1}/${date.getFullYear().toString().slice(-2)} ${timeToString(date.getHours(), date.getMinutes())}** \n\n${time.timezone_abbreviation} | GMT${(time.gmt_offset >= 0 ? '+' : '') + time.gmt_offset}\n${time.timezone_name}${time.is_dst ? ' (Day Light Savings)' : ''}`)
        .setColor((date.getHours() >= 6 && date.getHours() < 18) ? Color.BLUE : ColorDiscord.NOT_QUITE_BLACK);

      interaction.editReply({embeds: [embed]});
    } else {
      interaction.editReply({content: `Could not get the time for ${interaction.options.get('location').value}`});
    }
  }
});

function timeToString(hours: number, minutes: number, _12 = false, ampm = false): string {
  const pmam = hours >= 12 ? ' PM' : ' AM';
  hours = (_12 && hours > 12) ? hours - 12 : hours;
  return `${(hours < 10) ? '0' + hours : hours}:${(minutes < 10) ? '0' + minutes : minutes}${ampm ? pmam : ''}`;
}
