import { ApplicationCommandAutocompleteOption, ApplicationCommandNonOptionsData, ApplicationCommandOptionType, Embed } from 'discord.js';
import fetch from 'node-fetch';
import { db } from '../..';
import Command from '../../structures/Command';
import Currency from '../../typings/apis/Currency';

const measurementOptions = [{
  name: 'amount',
  type: ApplicationCommandOptionType.String,
  description: 'Amount in source unit',
  required: true
}, {
  name: 'source',
  type: ApplicationCommandOptionType.String,
  description: 'Source unit',
  required: true,
  autocomplete: true
}, {
  name: 'target',
  type: ApplicationCommandOptionType.String,
  description: 'Target unit',
  required: true,
  autocomplete: true
}] as unknown as (ApplicationCommandNonOptionsData | ApplicationCommandAutocompleteOption)[];

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'convert',
  description: 'Converts amount from one unit of measurement to another',
  options: [{
    name: 'list',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'List measurement types',
    options: [{
      name: 'type',
      type: ApplicationCommandOptionType.String,
      description: 'Type of measurement',
      required: true,
      choices: [
        { name: 'currency', value: 'currency' },
        { name: 'area', value: 'area' },
        { name: 'temperature', value: 'temperature' },
        { name: 'time', value: 'time' },
        { name: 'speed', value: 'speed' },
        { name: 'length', value: 'length' },
        { name: 'mass', value: 'mass' },
        { name: 'angle', value: 'angle' },
        { name: 'pressure', value: 'pressure' },
        { name: 'volume', value: 'volume' },
        { name: 'storage', value: 'storage' },
        { name: 'frequency', value: 'frequency' },
        { name: 'energy', value: 'energy' }
      ]
    }]
  }, {
    name: 'currency',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Convert currency',
    options: measurementOptions
  }, {
    name: 'area',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Convert area',
    options: measurementOptions
  }, {
    name: 'temperature',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Convert temperature',
    options: measurementOptions
  }, {
    name: 'time',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Convert time',
    options: measurementOptions
  }, {
    name: 'speed',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Convert speed',
    options: measurementOptions
  }, {
    name: 'length',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Convert length',
    options: measurementOptions
  }, {
    name: 'mass',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Convert mass',
    options: measurementOptions
  }, {
    name: 'angle',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Convert angle',
    options: measurementOptions
  }, {
    name: 'pressure',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Convert pressure',
    options: measurementOptions
  }, {
    name: 'volume',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Convert volume',
    options: measurementOptions
  }, {
    name: 'storage',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Convert storage',
    options: measurementOptions
  }, {
    name: 'frequency',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Convert frequency',
    options: measurementOptions
  }, {
    name: 'energy',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Convert energy',
    options: measurementOptions
  }],
  run: async ({ interaction, subCommand }) => {
    if (subCommand === 'list') {
      await interaction.deferReply({ ephemeral: true });
      const all = await db.measurements.findAll({ where: { type: interaction.options.get('type').value } });
      interaction.editReply(`**${capitalize(interaction.options.get('type').value as string)}**:\n${all.map((measurement) => `**${measurement.short_name}**`).join(', ')}`);
    } else {
      await interaction.deferReply();
      let value = parseFloat(interaction.options.get('amount').value as string);
      if (value) {
        const all = await db.measurements.findAll({ where: { type: subCommand } });
        const target = all.find((measurement) => {
          const val = (interaction.options.get('target').value as string).toLowerCase();
          return val === measurement.full_name.toLowerCase() || val === measurement.short_name.toLowerCase() || val === measurement.plural_name.toLowerCase() || val === measurement.symbol.toLowerCase();
        });
        if (target) {
          const source = all.find((measurement) => {
            const val = (interaction.options.get('source').value as string).toLowerCase();
            return val === measurement.full_name.toLowerCase() || val === measurement.short_name.toLowerCase() || val === measurement.plural_name.toLowerCase() || val === measurement.symbol.toLowerCase();
          });
          if (source) {
            if (subCommand === 'currency') {
              const { rates }: Currency = await (await fetch(process.env.CURRENCY_API)).json() as Currency;
              const USD = value / rates[source.short_name];
              const REQ = USD * rates[target.short_name];
              const embed = new Embed()
                .addFields({
                  name: `${source.full_name} (${source.short_name})`,
                  value: `${source.symbol} ${interaction.options.get('amount').value}`,
                  inline: true,
                }, {name: '\u200B', value: '**=**', inline: true}, {
                  name: `${target.full_name} (${target.short_name})`,
                  value: `${target.symbol} ${REQ.toFixed(2)}`,
                  inline: true,
                });
              interaction.editReply({embeds: [embed]});
            } else {
              if (!source.base) value = convertValue(source.convert_source, source.convert_value, value);
              if (!target.base) value = convertValue(target.convert_target, target.convert_value, value);
              const embed = new Embed()
                .setTitle(`${Util.capitalize(source.type)} Conversion`)
                .addFields({
                  name: `${(value > 1 || value < -1) ? source.plural_name : source.full_name} (${source.short_name})`,
                  value: interaction.options.get('amount').value as string,
                  inline: true,
                }, {name: '\u200B', value: '**=**', inline: true}, {
                  name: `${(value > 1 || value < -1) ? target.plural_name : target.full_name} (${target.short_name})`,
                  value: (Math.round(value * 1000) / 1000).toString(),
                  inline: true,
                });
              interaction.editReply({embeds: [embed]});
            }
          } else interaction.editReply(`Could not find source **${interaction.options.get('source').value}** in **${subCommand}**`);
        } else interaction.editReply(`Could not find target **${interaction.options.get('target').value}** in **${subCommand}**`);
      } else interaction.editReply(`Amount **${interaction.options.get('amount').value}** invalid`);
    }
  }
});

function convertValue(type: string, conversionValue: number, value: number) {
  switch (type) {
    case 'divide':
      return value / conversionValue;
    case 'multiply':
      return value * conversionValue;
    case 'plus':
      return value + conversionValue;
    case 'minus':
      return value - conversionValue;
    case 't180d200':
      return value * 180 / 200;
    case 't200d180':
      return value * 200 / 180;
    case 't1000pid180':
      return value * 1000 * Math.PI / 180;
    case 't180d1000pi':
      return value * 180 / 1000 * Math.PI;
    case 'tpid180':
      return value * Math.PI / 180;
    case 't180dpi':
      return value * 180 / Math.PI;
    case 'pt9d5pp32':
      return (value * 9/5) + 32;
    case 'pmi32pt5d9':
      return (value - 32) * 5/9;
    case 'd2pi':
      return value / (2 * Math.PI);
    case 't2pi':
      return value * (2 * Math.PI);
    default:
      return value;
  }
}
