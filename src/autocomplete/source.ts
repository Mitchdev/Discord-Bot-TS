import { db } from '..';
import Autocomplete from '../structures/Autocomplete';

export default new Autocomplete({
  idType: 'AutocompleteInteraction',
  optionName: 'source',
  run: async ({ interaction, subCommand }) => {
    if (interaction.commandName === 'convert' || interaction.commandName === 'currency') {
      if (subCommand === 'common') subCommand = 'currency';
      const all = await db.measurements.findAll({ where: { type: subCommand } });
      const filtered = all.filter((measurement) => {
        const val = (interaction.options.getFocused() as string).toLowerCase();
        return  val === measurement.full_name.toLowerCase() ||
                val === measurement.short_name.toLowerCase() ||
                val === measurement.plural_name.toLowerCase() ||
                val === measurement.symbol.toLowerCase() ||
                measurement.full_name.toLowerCase().startsWith(val) ||
                measurement.short_name.toLowerCase().startsWith(val) ||
                measurement.plural_name.toLowerCase().startsWith(val) ||
                measurement.symbol.toLowerCase().startsWith(val);
      });

      interaction.respond((filtered.length > 0 ? filtered : all).slice(0, 25).map((measurement) => {
        let name = measurement.full_name;
        const val = (interaction.options.getFocused() as string).toLowerCase();
        if (val === measurement.full_name.toLowerCase()) name = measurement.full_name;
        else if (val === measurement.short_name.toLowerCase()) name = measurement.short_name;
        else if (val === measurement.plural_name.toLowerCase()) name = measurement.plural_name;
        else if (val === measurement.symbol.toLowerCase()) name = measurement.symbol;
        else if (measurement.full_name.toLowerCase().startsWith(val)) name = measurement.full_name;
        else if (measurement.short_name.toLowerCase().startsWith(val)) name = measurement.short_name;
        else if (measurement.plural_name.toLowerCase().startsWith(val)) name = measurement.plural_name;
        else if (measurement.symbol.toLowerCase().startsWith(val)) name = measurement.symbol;
        return {
          name: name,
          value: name
        };
      }));
    }
  }
});
