import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import { db, Util } from '../..';
import Command from '../../structures/Command';
import Currency from '../../typings/apis/Currency';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'currency',
  description: 'Convert currency to common currencies',
  options: [{
    name: 'common',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Convert currency to common currencies',
    options: [{
      name: 'amount',
      type: ApplicationCommandOptionType.String,
      description: 'Amount',
      required: true
    }, {
      name: 'source',
      type: ApplicationCommandOptionType.String,
      description: 'Source Currency',
      required: true,
      autocomplete: true
    }]
  }],
  run: async ({ interaction }) => {
    await interaction.deferReply();

    const convertedList: [string, number][] = [];
    const targets: string[] = ['EUR', 'NZD', 'USD', 'GBP', 'SEK', 'NOK', 'DKK', 'ZAR', 'ILS'];

    const value = parseFloat(interaction.options.get('amount').value as string);
    if (value) {
      const all = await db.measurements.findAll({ where: { type: 'currency' } });
      const source = all.find((measurement) => {
        const sourceVal = (interaction.options.get('source').value as string).toLowerCase();
        if (sourceVal === measurement.full_name.toLowerCase() || sourceVal === measurement.short_name.toLowerCase() || sourceVal === measurement.plural_name.toLowerCase() || sourceVal === measurement.symbol.toLowerCase()) {
          const index = targets.indexOf(measurement.short_name);
          if (index > -1) targets.splice(index, 1);
          return true;
        } else return false;
      });

      if (source) {
        const { rates }: Currency = await (await fetch(process.env.CURRENCY_API)).json() as Currency;
        const USD = value / rates[source.short_name];

        for (const target of targets) {
          const REQ = USD * rates[target];
          convertedList.push([target, REQ]);
        }

        const embed = new EmbedBuilder()
        .addFields([{
          name: `${source.full_name} (${source.short_name})`,
          value: `${source.symbol} ${Util.commaNumber(value)}`,
          inline: true,
        }, {name: '\u200B', value: '**=**', inline: true}, {
          name: 'Common Currencies',
          value: convertedList.map((converted) => {
            return `**${Util.commaNumber(converted[1].toFixed(2))}** ${converted[0]}`;
          }).join('\n'),
          inline: true,
        }]);
        await interaction.editReply({embeds: [embed]});
      } else await interaction.editReply(`Could not find source **${interaction.options.get('source').value}** in **currency**`);
    } else await interaction.editReply(`Amount **${interaction.options.get('amount').value}** invalid`);
  }
});
