import { ApplicationCommandOptionType, Embed } from 'discord.js';
import fetch from 'node-fetch';
import Color from '../../enums/Color';
import Command from '../../structures/Command';
import Coordinates from '../../typings/apis/Coordinates';
import Weather from '../../typings/apis/Weather';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'weather',
  description: 'Gets current weather from a location',
  options: [{
    name: 'location',
    type: ApplicationCommandOptionType.String,
    description: 'Location to get weather from',
    required: true,
  }, {
    name: 'unit',
    type: ApplicationCommandOptionType.String,
    description: 'Unit of measurement',
    required: true,
    choices: [{
      name: 'Metric',
      value: 'metric',
    }, {
      name: 'Standard',
      value: 'standard',
    }, {
      name: 'Imperial',
      value: 'imperial',
    }],
  }],
  run: async({ interaction, client }) => {
    await interaction.deferReply();

    const weather = new Embed();
    const alerts = new Embed().setTitle('Alerts').setColor(Color.RED);
    const embeds: Embed[] = [];

    const units: string = interaction.options.get('unit').value as string;
    const location: string = interaction.options.get('location').value as string;

    const coordinates: Coordinates = await (await fetch(process.env.ANDLIN_ADDRESS_API, {
      method: 'POST',
      headers: {'Authorization': process.env.ANDLIN_TOKEN},
      body: JSON.stringify({'Address': location}),
    })).json() as Coordinates;

    if (coordinates.Message) {
      if (coordinates.Message.startsWith('404 Not Found:')) interaction.editReply({content: `Could not find ${location}`});
      else {
        client.users.fetch(process.env.USER_MITCH).then((devLog) => devLog.send({content: `**Coordinates:** ${coordinates.Message}\n**Sent:** \`\`\`{"Address": ${location}}\`\`\``}));
        client.users.fetch(process.env.USER_ANDLIN).then((andlinLog) => andlinLog.send({content: `**Coordinates:** ${coordinates.Message}\n**Sent:** \`\`\`{"Address": ${location}}\`\`\``}));
      }
    } else {
      const data: Weather = await (await fetch(process.env.WEATHER_API.replace('|lat|', coordinates.lat.toString()).replace('|lon|', coordinates.lon.toString()).replace('|units|', units))).json() as Weather;
      const localTime = new Date((data.current.dt+data.timezone_offset)*1000);
      const setRiseMargin = 900; // seconds

      let sunText = '';
      let moonText = '';
      let rainText = '';
      let snowText = '';
      let windText = '';
      let gustText = '';

      const sunrise = data.daily[0].sunrise - data.current.dt;
      const sunset = data.daily[0].sunset - data.current.dt;
      const moonrise = data.daily[0].moonrise - data.current.dt;
      const moonset = data.daily[0].moonset - data.current.dt;

      sunText = `Sun **${sunrise >= 0 ? 'rising' : 'rose'} <t:${data.daily[0].sunrise}:R>** and ${sunset >= 0 ? 'is **setting' : '**set'} <t:${data.daily[0].sunset}:R>**`;
      moonText = `Moon **${moonrise >= 0 ? 'rising' : 'rose'} <t:${data.daily[0].moonrise}:R>** and ${moonset >= 0 ? 'is **setting' : '**set'} <t:${data.daily[0].moonset}:R>**`;

      if (data.daily[0].moon_phase > 0 && data.daily[0].moon_phase < 0.25) moonText += '\nPhase **Waxing crescent moon** 🌒';
      if (data.daily[0].moon_phase > 0.25 && data.daily[0].moon_phase < 0.5) moonText += '\nPhase **Waxing gibous moon** 🌔';
      if (data.daily[0].moon_phase > 0.5 && data.daily[0].moon_phase < 0.75) moonText += '\nPhase **Waning gibous moon** 🌖';
      if (data.daily[0].moon_phase > 0.75 && data.daily[0].moon_phase < 1) moonText += '\nPhase **Waning crescent moon** 🌘';
      if (data.daily[0].moon_phase === 0 || data.daily[0].moon_phase === 1) moonText += '\nPhase **New moon** 🌑';
      if (data.daily[0].moon_phase === 0.25) moonText += '\nPhase **First quarter moon** 🌓';
      if (data.daily[0].moon_phase === 0.5) moonText += '\nPhase **Full moon** 🌕';
      if (data.daily[0].moon_phase === 0.75) moonText += '\nPhase **Last quarter moon** 🌗';

      const notSunSet = ((sunset > setRiseMargin || sunset < -setRiseMargin) && (sunrise > setRiseMargin || sunrise < -setRiseMargin));
      const sunBothPos = ((sunrise > setRiseMargin && sunset > setRiseMargin) && sunrise < sunset);
      const sunBothNeg = ((sunrise < -setRiseMargin && sunset < -setRiseMargin) && sunset < sunrise);
      const sunRisePosSetNeg = ((sunrise > setRiseMargin && sunset < -setRiseMargin));
      const sunRiseNegSetPos = !((sunrise < -setRiseMargin && sunset > setRiseMargin));

      const moonBothPos = ((moonrise > setRiseMargin && moonset > setRiseMargin) && moonrise < moonset);
      const moonBothNeg = ((moonrise < -setRiseMargin && moonset < -setRiseMargin) && moonset < moonrise);
      const moonRisePosSetNeg = ((moonrise > setRiseMargin && moonset < -setRiseMargin));
      const moonRiseNegSetPos = !((moonrise < -setRiseMargin && moonset > setRiseMargin));

      let hour = localTime.getHours();
      if (hour > 12) hour = 12 - (hour - 12);

      const daylightTime = Math.abs(data.daily[0].sunset - data.daily[0].sunrise);
      const nightlightTime = Math.abs(86400 - daylightTime);
      const hourOffset = ((daylightTime/3600)/12)*hour;

      if (notSunSet && (sunBothPos || sunBothNeg || sunRisePosSetNeg || sunRiseNegSetPos)) {
        if (moonBothPos || moonBothNeg || moonRisePosSetNeg || moonRiseNegSetPos) {
          const colorCloud = ((80/100)*data.hourly[0].clouds);
          weather.setColor(rgbToInt(colorCloud, colorCloud, colorCloud));
        } else {
          // ADD MOON PHASE
          // HIGHER = MORE LIGHT
          const colorMoonCloud = ((85/100)*data.hourly[0].clouds)+80;
          weather.setColor(rgbToInt(colorMoonCloud, colorMoonCloud, colorMoonCloud));
        }
      } else {
        if ((sunrise <= setRiseMargin && sunrise >= -setRiseMargin) || (sunset <= setRiseMargin && sunset >= -setRiseMargin)) {
          // ADD RAIN
          // MORE RAIN = MORE PINK/PURPLE
          const colorCloud = 80-((80/100)*data.hourly[0].clouds); // 80-0
          const color = (((110/12)*hourOffset)+50)+(colorCloud/1.5); // 110-160
          weather.setColor(rgbToInt(255, color, colorCloud));
        } else {
          const colorCloud = (255/100)*data.hourly[0].clouds; // 0-255
          const color = ((185/12)*hourOffset)+70+(colorCloud/3.3); // 131-285(255)

          weather.setColor(rgbToInt(colorCloud, color > 255 ? 255 : color, 255));
        }
      }

      if (data.hourly[0].rain) rainText = `\nRain this hour **${data.hourly[0].rain['1h']}mm**`;
      if (data.hourly[0].snow) snowText = `\nSnow this hour **${data.hourly[0].snow['1h']}mm**`;

      windText = `Wind **${(units === 'imperial') ? data.hourly[0].wind_speed+'mi/h' : (units === 'standard') ? data.hourly[0].wind_speed+'m/s' : (data.hourly[0].wind_speed*3.6).toFixed(2)+'km/h'} ${(units === 'standard') ? data.hourly[0].wind_deg+'°' : getCardinalDirection(data.hourly[0].wind_deg)}**`;
      if (data.hourly[0].wind_gust) gustText += `\nGusts **${(units === 'imperial') ? data.hourly[0].wind_gust+'mi/h' : (units === 'standard') ? data.hourly[0].wind_speed+'m/s' : (data.hourly[0].wind_gust*3.6).toFixed(2)+'km/h'}**`;

      // eslint-disable-next-line eqeqeq
      weather.setTitle(`${coordinates.manicipality != null ? coordinates.manicipality : location}, ${coordinates.countryCode} (Location confidence: ${(coordinates.score < 0) ? '0' : coordinates.score}%)`)
        .setDescription(`Current condition **${data.hourly[0].weather[0].description}** at **${localTime.getHours() < 10 ? `0${localTime.getHours()}`: localTime.getHours()}:${localTime.getMinutes() < 10 ? `0${localTime.getMinutes()}`: localTime.getMinutes()}**`)
        .setThumbnail(`http://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`)
        .addFields({
          name: 'Temperature',
          value: `Current **${data.hourly[0].temp}${units === 'imperial' ? '°F' : (units === 'standard') ? 'K' : '°C'}**`+
          `\nFeels like **${data.hourly[0].feels_like}${units === 'imperial' ? '°F' : (units === 'standard') ? 'K' : '°C'}**`+
          `\nHigh **${data.daily[0].temp.max}${units === 'imperial' ? '°F' : (units === 'standard') ? 'K' : '°C'}**`+
          `\nLow **${data.daily[0].temp.min}${units === 'imperial' ? '°F' : (units === 'standard') ? 'K' : '°C'}**`+
          `\nDew point **${data.hourly[0].dew_point}${units === 'imperial' ? '°F' : (units === 'standard') ? 'K' : '°C'}**`+
          `\nHumidity **${data.hourly[0].humidity}%**`,
          inline: true,
        }, Util.blankField(), {
          name: 'Wind & Clouds',
          value: `Cloud cover **${data.hourly[0].clouds}%**\n${windText}${gustText}`,
          inline: true,
        }, {
          name: 'Extra',
          value: `Pressure **${data.hourly[0].pressure}hPa**`+
          `\nVisibility **${units === 'imperial' ? (data.hourly[0].visibility/1609).toFixed(2)+'mi' : (units === 'standard') ? data.hourly[0].visibility+'m' : (data.hourly[0].visibility/1000).toFixed(2)+'km'}**`+
          `\nUV **${data.hourly[0].uvi}**`,
          inline: true,
        }, Util.blankField(), {
          name: 'Rain & Snow',
          value: `Rain probability **${Math.round(data.hourly[0].pop*100)}%**${rainText}${snowText}`,
          inline: true,
        }, {
          name: 'Sun & Moon',
          value: `${sunText}\n${moonText}`+
          `\nAmount of Daylight **${secondsToDhms(daylightTime)}**`+
          `\nAmount of Nightlight **${secondsToDhms(nightlightTime)}**`,
        });

      embeds.push(weather);

      if (data.alerts?.length > 0) {

        data.alerts.forEach(alert => {
          let alertTime = '';
          const alertStart = alert.start - data.current.dt;
          const alertEnd = alert.end - data.current.dt;
          const alertDuration = alert.end - alert.start;

          if (alertStart > 5) alertTime = `Starts in ${secondsToDhms(alertStart)}and lasts for ${secondsToDhms(alertDuration)}\n`;
          else if (alertEnd > 5) alertTime = `Started ${secondsToDhms(Math.abs(alertStart))}ago and ends in ${secondsToDhms(alertEnd)}\n`;
          else alertTime = `Ended ${secondsToDhms(Math.abs(alertEnd))}ago and lasted ${secondsToDhms(alertDuration)}\n`;

          let description = `${alertTime}\n${alert.description}`;
          const more = `...\n\nmore via ${alert.sender_name}`;
          if (description.length > 500) description = description.slice(0, 500-more.length) + more;

          alerts.addFields({name: alert.event, value: description});
        });

        embeds.push(alerts);
      }

      interaction.editReply({embeds: embeds});

      // animate(data.current.weather[0].main, weather.color, 0, interaction, embeds);
    }
  }
});

// /**
//  * Animates color of embed.
//  * @param {string} type type of animation.
//  * @param {number} originalColor original color of the embed.
//  * @param {number} step animation stepper.
//  * @param {CommandInteraction} interaction interaction pass-through.
//  * @param {Embed[]} embeds embeds pass-through.
//  */
//   function animate(type: string, originalColor: number, step: number, interaction: CommandInteraction, embeds: Embed[]) {
//   if (type === 'Thunderstorm') {
//     setTimeout(() => {
//       embeds[0].setColor(Color.YELLOW);
//       interaction.editReply({embeds: embeds});
//       setTimeout(() => {
//         embeds[0].setColor(originalColor);
//         interaction.editReply({embeds: embeds});
//         setTimeout(() => {
//           embeds[0].setColor(Color.YELLOW);
//           interaction.editReply({embeds: embeds});
//           setTimeout(() => {
//             embeds[0].setColor(originalColor);
//             interaction.editReply({embeds: embeds});
//           }, 250);
//         }, 100);
//       }, 250);
//     }, 1500);
//   } else if (type === 'Rain') {
//     if (step < 10) {
//       embeds[0].setColor((step % 2 === 0) ? Color.BLUE : originalColor);
//       interaction.editReply({embeds: embeds});
//       setTimeout(() => {
//         animate(type, originalColor, step+1, interaction, embeds);
//       }, 250);
//     }
//   } else if (type === 'Snow') {
//     if (step < 10) {
//       embeds[0].setColor((step % 2 === 0) ? Color.WHITE : originalColor);
//       interaction.editReply({embeds: embeds});
//       setTimeout(() => {
//         animate(type, originalColor, step+1, interaction, embeds);
//       }, 250);
//     }
//   } else if (type === 'Sand') {
//     if (step < 10) {
//       embeds[0].setColor((step % 2 === 0) ? Color.GOLD : originalColor);
//       interaction.editReply({embeds: embeds});
//       setTimeout(() => {
//         animate(type, originalColor, step+1, interaction, embeds);
//       }, 250);
//     }
//   }
// }
