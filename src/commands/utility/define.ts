import { ApplicationCommandOptionType } from 'discord.js';
import fetch from 'node-fetch';
import Command from '../../structures/Command';
import { NormalDictionary, NormalDictionaryError, UrbanDictionary } from '../../typings/apis/Dictionary';
import Embed from '../../typings/Embed';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'define',
  description: 'Gets definition of a phrase via urban or normal dictionary',
  options: [{
    name: 'dictionary',
    type: ApplicationCommandOptionType.Integer,
    description: 'Type of dictionary to get the defention from',
    required: true,
    choices: [{
      name: 'Normal',
      value: -1,
    }, {
      name: 'Urban',
      value: 1,
    }],
  }, {
    name: 'phrase',
    type: ApplicationCommandOptionType.String,
    description: 'Phrase to be defined',
    required: true,
  }],
  run: async ({ interaction, client }) => {
    await interaction.deferReply();

    const phrase = (interaction.options.get('phrase').value as string).toLowerCase();

    if ((interaction.options.get('dictionary').value as number) === -1) {
      const data: NormalDictionary[] | NormalDictionaryError = await (await fetch(process.env.DICTIONARY_API.replace('|phrase|', phrase))).json();
      if ('title' in data) {
        if (data.title === 'No Definitions Found') {
          interaction.editReply(`Couldn't find anything for **${phrase}**.`);
        } else {
          interaction.editReply({content: 'Unknown error occurred'});
          client.users.fetch(process.env.USER_MITCH).then((devLog) => {
            devLog.send({content: `**Define Normal Dictionary:**\n**${phrase}:**\n${data.message ?? data.title}`});
          });
        }
      } else {
        const embed = new Embed()
          .setTitle(`**${data[0].word}**`)
          .setURL(`https://www.dictionary.com/browse/${encodeURIComponent(data[0].word)}`)
          .addField({
            name: 'Definition',
            value: data[0].meanings[0].definitions[0].definition ?? '-'
          });
          if (data[0].meanings[0].definitions[0].example) embed.addField({ name: 'Example', value: data[0].meanings[0].definitions[0].example });
          if (data[0].origin) embed.addField({ name: 'Origin', value: data[0].origin });
          if (data[0].phonetic) embed.addField({ name: 'Phonetic', value: data[0].phonetic });
        interaction.editReply({embeds: [embed]});
      }
    } else {
      const {list}: UrbanDictionary = await (await fetch(process.env.URBAN_API.replace('|phrase|', phrase))).json() as UrbanDictionary;
      if (list.length > 0) {
        const definition = list[0].definition.replace(/\[(.+?)\]/gmi, (i) => {
          // eslint-disable-next-line no-useless-escape
          return `${i}(http://${i.replace(/\[|\]|\'|\"/gmi, '').replace(/\s/gmi, '-')}.urbanup.com)`;
        });

        const example = list[0].example.replace(/\[(.+?)\]/gmi, (i) => {
          // eslint-disable-next-line no-useless-escape
          return `${i}(http://${i.replace(/\[|\]|\'|\"/gmi, '').replace(/\s/gmi, '-')}.urbanup.com)`;
        });

        const embed = new Embed()
          .setTitle(`**${list[0].word}**`)
          .setURL(list[0].permalink)
          .addField({
            name: 'Definition',
            value: (definition.length > 1020 ? definition.slice(0, 1020) + '...' : definition) ?? '-'
          })
          .addField({
            name: 'Example',
            value: (example.length > 1020 ? example.slice(0, 1020) + '...' : example) ?? '-'
          });

          interaction.editReply({embeds: [embed]});
      } else {
        interaction.editReply({content: `Couldn't find anything for **${phrase}**.`});
      }

    }
  }
});
