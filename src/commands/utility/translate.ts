import { ApplicationCommandOptionType, Embed } from 'discord.js';
import fetch from 'node-fetch';
import { encode, decode } from 'html-entities';
import { db } from '../..';
import Command from '../../structures/Command';
import { Translate, TranslateError } from '../../typings/apis/Translate';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'translate',
  description: 'Translates a phrase',
  options: [{
    name: 'phrase',
    type: ApplicationCommandOptionType.String,
    description: 'Phrase to be translated',
    required: true,
  }, {
    name: 'target',
    type: ApplicationCommandOptionType.String,
    description: 'Target language',
    required: false,
    choices: [
      {value: 'auto', name: 'Automatic'}, {value: 'af', name: 'Afrikaans'}, {value: 'da', name: 'Danish'}, {value: 'de', name: 'German'}, {value: 'en', name: 'English'}, {value: 'es', name: 'Spanish'},
      {value: 'he', name: 'Hebrew'}, {value: 'mi', name: 'Maori'}, {value: 'nb', name: 'Norwegian'}, {value: 'nl', name: 'Dutch'}, {value: 'sv', name: 'Swedish'}, {value: 'it', name: 'Italian'},
      {value: 'hu', name: 'Hungarian'}, {value: 'ro', name: 'Romanian'}, {value: 'pt', name: 'Portuguese'},
    ],
  }, {
    name: 'source',
    type: ApplicationCommandOptionType.String,
    description: 'Source language',
    required: false,
    choices: [
      {value: 'auto', name: 'Automatic'}, {value: 'af', name: 'Afrikaans'}, {value: 'da', name: 'Danish'}, {value: 'de', name: 'German'}, {value: 'en', name: 'English'}, {value: 'es', name: 'Spanish'},
      {value: 'he', name: 'Hebrew'}, {value: 'mi', name: 'Maori'}, {value: 'nb', name: 'Norwegian'}, {value: 'nl', name: 'Dutch'}, {value: 'sv', name: 'Swedish'}, {value: 'it', name: 'Italian'},
      {value: 'hu', name: 'Hungarian'}, {value: 'ro', name: 'Romanian'}, {value: 'pt', name: 'Portuguese'},
    ],
  }],
  run: async ({ interaction }) => {
    await interaction.deferReply();

    const phrase = interaction.options.get('phrase').value as string;
    const binary = phrase.match(/[10\s]+/gmi);
    // eslint-disable-next-line no-useless-escape
    const morse = phrase.match(/[.\-\/\s]+/gmi);

    if (binary?.length === 1 || morse?.length === 1) {
      if (binary[0] === phrase && (!interaction.options.get('source') || !interaction.options.get('target'))) {
        interaction.editReply({content: `**Binary**\n${phrase}\n**Ascii**\n${decodeBinary(phrase)}`});
        return;
      } else if (morse[0] === phrase && (!interaction.options.get('source') || !interaction.options.get('target'))) {
        interaction.editReply({content: `**Morse**\n${phrase}\n**Ascii**\n${decodeMorse(phrase)}`});
        return;
      }
    }

    const sourceLanguage = interaction.options.get('source')?.value as string ?? 'auto';
    let targetLanguage = 'en';
    if (interaction.options.get('target') && interaction.options.get('target')?.value as string === 'auto') {
      switch(interaction.locale) {
        case 'en-US':
        case 'en-GB':
          targetLanguage = 'en';
          break;
        case 'zh-CN':
        case 'zh-TW':
          targetLanguage = 'zh-Hans';
          break;
        case 'pt-BR':
          targetLanguage = 'pt';
          break;
        case 'es-ES':
          targetLanguage = 'es';
          break;
        case 'sv-SE':
          targetLanguage = 'sw';
          break;
        default:
          targetLanguage = interaction.locale;
          break;
      }
    } else targetLanguage = interaction.options.get('target')?.value as string ?? 'en';

    const data: Translate[] | TranslateError = await (await fetch(process.env.ANDLIN_TRANSLATE_API, {
      method: 'POST',
      headers: {'Authorization': process.env.ANDLIN_TOKEN},
      body: JSON.stringify({'source': sourceLanguage, 'target': targetLanguage, 'text': encode(phrase)}),
    })).json();

    if ('Message' in data) {
      console.log({'translator': data.Message});
      console.log({'source': sourceLanguage, 'target': targetLanguage, 'text': encode(phrase)});
    } else if (data.length > 0) {
      if (data[0].translations) {
        if (data[0].translations.length > 0) {
          const sourceLanguageName = await getLang((data[0].detectedLanguage ? data[0].detectedLanguage.language : sourceLanguage));
          const targetLanguageName = await getLang((data[0].translations[0].to ? data[0].translations[0].to : targetLanguage));

          const embed = new Embed()
            .setTitle('Translate')
            .addFields({
              name: `**${sourceLanguageName}**${(data[0].detectedLanguage ? ` - Language confidence: ${data[0].detectedLanguage.score*100}%` : '')}`,
              value: phrase
            }, {
              name: `**${targetLanguageName}**`,
              value: decode(data[0].translations[0].text)
            });

          interaction.editReply({embeds: [embed]});
        }
      }
    }
  }
});

/**
 * Gets lanuage from language code
 * @param {string} code of language.
 * @return {string} name of language.
 */
async function getLang(code: string): Promise<string> {
  const language = await db.languages.findByPk(code);
  return language.get('long_name') ?? 'Unknown';
}

/**
 * Converts binary to ascii.
 * @param {string} str morse.
 * @return {string} ascii.
 */
function decodeBinary(str: string): string {
  const splitBin = str.split(' ');
  const text = [];
  for (let i = 0; i < splitBin.length; i++) text.push(String.fromCharCode(parseInt(splitBin[i], 2)));
  return text.join('');
}

/**
 * Converts morse to ascii.
 * @param {string} str morse.
 * @return {string} ascii.
 */
function decodeMorse(str: string): string {
  const morseRef = {
    '.-': 'a',
    '-...': 'b',
    '-.-.': 'c',
    '-..': 'd',
    '.': 'e',
    '..-.': 'f',
    '--.': 'g',
    '....': 'h',
    '..': 'i',
    '.---': 'j',
    '-.-': 'k',
    '.-..': 'l',
    '--': 'm',
    '-.': 'n',
    '---': 'o',
    '.--.': 'p',
    '--.-': 'q',
    '.-.': 'r',
    '...': 's',
    '-': 't',
    '..-': 'u',
    '...-': 'v',
    '.--': 'w',
    '-..-': 'x',
    '-.--': 'y',
    '--..': 'z',
    '.----': '1',
    '..---': '2',
    '...--': '3',
    '....-': '4',
    '.....': '5',
    '-....': '6',
    '--...': '7',
    '---..': '8',
    '----.': '9',
    '-----': '0',
    '/': ' ',
    '-.-.--': '!',
    '.-.-.-': '.',
    '--..--': ',',
    '.----.': '\'',
  };
  return str.split('   ').map((a) => a.split(' ').map((b) => morseRef[b]).join('')).join(' ');
}
