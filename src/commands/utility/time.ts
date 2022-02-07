import { ApplicationCommandOptionType } from 'discord.js';
import fetch from 'node-fetch';
import Color, { ColorDiscord } from '../../enums/Color';
import Command from '../../structures/Command';
import { capitalize } from '../../structures/Utilities';
import { Time } from '../../typings/apis/Time';
import Embed from '../../typings/Embed';

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
      const embed = new Embed()
        .setTitle(`The time in ${time.requested_location} is **${timeToString(date.getHours(), date.getMinutes())}**`)
        .setColor((date.getHours() >= 6 && date.getHours() < 18) ? Color.BLUE : ColorDiscord.NOT_QUITE_BLACK)
        .addField({
          name: 'Abbreviation',
          value: time.timezone_abbreviation,
          inline: true,
        })
        .addField({
          name: 'GMT',
          value: (time.gmt_offset >= 0 ? '+' : '') + time.gmt_offset,
          inline: true,
        })
        .addField({
          name: 'Daylight Savings',
          value: capitalize(time.is_dst?.toString()),
          inline: true,
        })
        .addField({
          name: 'Name',
          value: time.timezone_name,
          inline: true,
        })
        .addField({
          name: 'Location',
          value: time.timezone_location,
          inline: true,
        });

      interaction.editReply({embeds: [embed]});
    } else {
      interaction.editReply({content: `Could not get the time for ${interaction.options.get('location').value}`});
    }
  }
});

function timeToString(hours: number, minutes: number): string {
  return `${(hours < 10) ? '0' + hours : hours}:${(minutes < 10) ? '0' + minutes : minutes}`;
}
