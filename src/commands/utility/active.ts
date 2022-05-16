import { ApplicationCommandOptionType, Attachment, EmbedBuilder } from 'discord.js';
import sharp from 'sharp';
import { db, Util } from '../..';
import Command from '../../structures/Command';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'active',
  description: 'Shows what time the user is active',
  options: [{
    name: 'user',
    type: ApplicationCommandOptionType.User,
    description: 'User to get activity from',
    required: false,
  }, {
    name: 'utc',
    type: ApplicationCommandOptionType.Integer,
    description: '-12 to +14 UTC',
    maxValue: 14,
    minValue: -12,
    required: false,
  }],
  run: async ({ interaction }) => {
    const user = await db.messages.findByPk(interaction.options.get('user') ? interaction.options.get('user').user.id : interaction.user.id);
    const utcOffset: number = (interaction.options.get('utc')?.value ?? 0) as number;
    if (user) {
      await interaction.deferReply();

      const blue = user.sevenDays.filter((time) => {
        let hour = parseInt(new Date(time).toUTCString().split(' ')[4].split(':')[0]);
        hour += utcOffset;
        if (hour > 23) hour -= 23;
        if (hour < 0) hour += 23;
        return hour >= 0 && hour <= 5;
      });
      const green = user.sevenDays.filter((time) => {
        let hour = parseInt(new Date(time).toUTCString().split(' ')[4].split(':')[0]);
        hour += utcOffset;
        if (hour > 23) hour -= 23;
        if (hour < 0) hour += 23;
        return hour >= 6 && hour <= 11;
      });
      const yellow = user.sevenDays.filter((time) => {
        let hour = parseInt(new Date(time).toUTCString().split(' ')[4].split(':')[0]);
        hour += utcOffset;
        if (hour > 23) hour -= 23;
        if (hour < 0) hour += 23;
        return hour >= 12 && hour <= 17;
      });
      const red = user.sevenDays.filter((time) => {
        let hour = parseInt(new Date(time).toUTCString().split(' ')[4].split(':')[0]);
        hour += utcOffset;
        if (hour > 23) hour -= 23;
        if (hour < 0) hour += 23;
        return hour >= 18 && hour <= 23;
      });

      const bluePercent: number = blue.length > 0 ? parseFloat(((blue.length / user.sevenDays.length) * 100).toFixed(1)) : 0;
      const greenPercent: number = green.length > 0 ? parseFloat(((green.length / user.sevenDays.length) * 100).toFixed(1)) : 0;
      const yellowPercent: number = yellow.length > 0 ? parseFloat(((yellow.length / user.sevenDays.length) * 100).toFixed(1)) : 0;
      const redPercent: number = red.length > 0 ? parseFloat(((red.length / user.sevenDays.length) * 100).toFixed(1)) : 0;

      const largest: number = Math.max.apply(null, [bluePercent, greenPercent, yellowPercent, redPercent]);
      const color = largest === bluePercent ? Util.rgbToInt(52, 100, 252) : largest === greenPercent ? Util.rgbToInt(100, 204, 52) : largest === yellowPercent ? Util.rgbToInt(204, 204, 52) : Util.rgbToInt(204, 52, 52);
      const active = largest === bluePercent ? '0 and 5' : largest === greenPercent ? '6 and 11' : largest === yellowPercent ? '12 and 17' : '18 and 23';

      const blueWidth = blue.length > 0 ? Math.ceil((blue.length / user.sevenDays.length) * 286) : 0;
      const greenWidth = green.length > 0 ? Math.ceil((green.length / user.sevenDays.length) * 286) : 0;
      const yellowWidth = yellow.length > 0 ? Math.ceil((yellow.length / user.sevenDays.length) * 286) : 0;
      const redWidth = red.length > 0 ? Math.ceil((red.length / user.sevenDays.length) * 286) : 0;

      // create image
      const graph = Buffer.from('<svg width="286" height="80">' +
        `<text fill="rgb(255,255,255)" font-family="sans-serif" font-weight="bold" x="0" y="15">UTC${utcOffset >= 0 ? '+' : ''}${utcOffset}:</text>` +

        '<rect fill="rgb(52,100,252)" width="25" height="15" x="0" y="30"/>' +
        '<text fill="rgb(255,255,255)" font-family="sans-serif" font-weight="bold" x="30" y="35">0-5</text>' +

        '<rect fill="rgb(100,204,52)" width="25" height="15" x="65" y="30"/>' +
        '<text fill="rgb(255,255,255)" font-family="sans-serif" font-weight="bold" x="95" y="35">6-11</text>' +

        '<rect fill="rgb(204,204,52)" width="25" height="15" x="135" y="30"/>' +
        '<text fill="rgb(255,255,255)" font-family="sans-serif" font-weight="bold" x="165" y="35">12-17</text>' +

        '<rect fill="rgb(204,52,52)" width="25" height="15" x="215" y="30"/>' +
        '<text fill="rgb(255,255,255)" font-family="sans-serif" font-weight="bold" x="245" y="35">18-23</text>' +

        `<rect fill="rgb(52,100,252)" width="${blueWidth}" height="25" x="0" y="55"/>` +
        `<rect fill="rgb(100,204,52)" width="${greenWidth}" height="25" x="${blueWidth}" y="55"/>` +
        `<rect fill="rgb(204,204,52)" width="${yellowWidth}" height="25" x="${blueWidth + greenWidth}" y="55"/>` +
        `<rect fill="rgb(204,52,52)" width="${redWidth}" height="25" x="${blueWidth + greenWidth + yellowWidth}" y="55"/>` +
      '</svg>');

      const graphPNG = await sharp(graph).png().toBuffer();

      const embed = new EmbedBuilder()
        .setTitle(`Activity for ${user.nickname ?? user.username}`)
        .setColor(color)
        .setDescription(`Most active between **${active} UTC${utcOffset >= 0 ? '+' : ''}${utcOffset}**`)
        .addFields([{
          name: `**${bluePercent}%**`,
          value: '0-5',
          inline: true,
        }, Util.blankField(), {
          name: `**${greenPercent}%**`,
          value: '6-11',
          inline: true,
        }, {
          name: `**${yellowPercent}%**`,
          value: '12-17',
          inline: true,
        }, Util.blankField(), {
          name: `**${redPercent}%**`,
          value: '18-23',
          inline: true,
        }]);

        interaction.editReply({files: [new Attachment(graphPNG, 'graph.png')], embeds: [embed]});
    } else {
      await interaction.deferReply({ephemeral: true});
      interaction.editReply({content: 'Could not find user.'});
    }
  }
});
