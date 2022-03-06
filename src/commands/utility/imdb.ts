import { ApplicationCommandOptionType, Embed } from 'discord.js';
import fetch from 'node-fetch';
import { getColorFromURL } from 'color-thief-node';
import Command from '../../structures/Command';
import { ImdbSearch, ImdbTitle, ImdbTitleAlt } from '../../typings/apis/Imdb';
import { Util } from '../..';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'imdb',
  description: 'Get imdb info of a film',
  options: [{
    name: 'search',
    type: ApplicationCommandOptionType.String,
    description: 'Search for film',
    required: true,
  }],
  run: async ({ interaction }) => {
    await interaction.deferReply();
    const searchResult = await (await fetch(process.env.IMDB_SEARCH_API.replace('|search|', encodeURIComponent(interaction.options.get('search').value)), {redirect: 'follow'})).json() as ImdbSearch;
    if (searchResult.errorMessage === '') {
      if (searchResult.results.length > 0) {
        const data = await (await fetch(process.env.IMDB_INFO_API.replace('|id|', searchResult.results[0].id), {redirect: 'follow'})).json() as ImdbTitle;
        const dataAlt = await (await fetch(process.env.IMDB_INFO_ALT_API.replace('|id|', searchResult.results[0].id))).json() as ImdbTitleAlt;
        const dataAltRT = dataAlt.Ratings.find((r) => r.Source === 'Rotten Tomatoes')?.Value;
        const dataAltMC = dataAlt.Ratings.find((r) => r.Source === 'Metacritic')?.Value;
        if (data.errorMessage === '' || !dataAlt.Error) {
          const embed = new Embed()
            .setTitle(`${data.title} (${data.year})`)
            .setURL(`https://www.imdb.com/title/${data.id}/`)
            .addFields({
              name: 'Plot',
              value: dataAlt.Plot !== 'N/A' ? dataAlt.Plot : data.plot !== '' ? data.plot : 'Unknown',
              inline: false,
            }, {
              name: 'IMDb Rating',
              value: data.ratings.imDb !== '' ? `${data.ratings.imDb} / 10` : dataAlt.imdbRating !== 'N/A' ? `${dataAlt.imdbRating} / 10` : 'Unknown',
              inline: true,
            }, {
              name: 'Rotten Tomatoes',
              value: data.ratings.rottenTomatoes !== '' ? `${data.ratings.rottenTomatoes} / 100` : dataAltRT ? dataAltRT.replace('%', ' / 100') : 'Unknown',
              inline: true,
            }, {
              name: 'Metacritic',
              value: data.ratings.metacritic !== '' ? `${data.ratings.metacritic} / 100` : dataAltMC ? dataAltMC.replace('/', ' / ') : 'Unknown',
              inline: true,
            }, {
              name: 'Release Date',
              value: dataAlt.Released !== 'N/A' ? dataAlt.Released : data.releaseDate !== '' ? data.releaseDate : 'Unknown',
              inline: true,
            }, {
              name: 'Director',
              value: dataAlt.Director !== 'N/A' ? dataAlt.Director : data.directors !== '' ? data.directorList[0].name : 'Unknown',
              inline: true,
            }, {
              name: 'Rating',
              value: dataAlt.Rated !== 'N/A' ? dataAlt.Rated : data.contentRating !== '' ? data.contentRating : 'Unknown',
              inline: true,
            }, {
              name: 'Duration',
              value: dataAlt.Runtime !== 'N/A' ? dataAlt.Runtime : data.runtimeStr !== '' ? data.runtimeStr : 'Unknown',
              inline: true,
            }, {
              name: 'Budget (USD)',
              value: data.boxOffice.budget !== '' ? data.boxOffice.budget.replace(' (estimated)', '') : 'Unknown',
              inline: true,
            }, {
              name: 'Box Office Gross (USD)',
              value: data.boxOffice.cumulativeWorldwideGross !== '' ? data.boxOffice.cumulativeWorldwideGross : 'Unknown',
              inline: true,
            });
          if (data.image !== '') {
            embed.setThumbnail(data.image);
            const color = await getColorFromURL(data.image);
            embed.setColor(Util.rgbToInt(color[0], color[1], color[2]));
          }
          interaction.editReply({embeds: [embed]});
        } else {
          interaction.editReply({content: 'Too many requests'});
        }
      } else {
        interaction.editReply({content: `Could not find ${interaction.options.get('search').value}`});
      }
    } else {
      interaction.editReply({content: 'Too many requests'});
    }
  }
});
