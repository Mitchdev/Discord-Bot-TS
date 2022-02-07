import Autocomplete from '../structures/Autocomplete';
import { durationToSeconds } from '../structures/Utilities';

export default new Autocomplete({
  idType: 'AutocompleteInteraction',
  optionName: 'duration',
  run: async ({ interaction }) => {
    if (interaction.options.getFocused() === '') {
      interaction.respond([{
        name: '5m',
        value: '5m'
      }, {
        name: '10m',
        value: '10m'
      }, {
        name: '30m',
        value: '30m'
      }, {
        name: '1h',
        value: '1h'
      }]);
    } else if (!isNaN(Number(interaction.options.getFocused()))) {
      interaction.respond([{
        name: `${interaction.options.getFocused()}s`,
        value: `${interaction.options.getFocused()}s`
      }, {
        name: `${interaction.options.getFocused()}m`,
        value: `${interaction.options.getFocused()}m`
      }, {
        name: `${interaction.options.getFocused()}h`,
        value: `${interaction.options.getFocused()}h`
      }, {
        name: `${interaction.options.getFocused()}d`,
        value: `${interaction.options.getFocused()}d`
      }]);
    } else if (durationToSeconds(interaction.options.getFocused() as string)) {
      interaction.respond([{
        name: interaction.options.getFocused() as string,
        value: interaction.options.getFocused()
      }]);
    } else {
      interaction.respond([{
        name: 'Invalid duration',
        value: 'null'
      }]);
    }
  }
});
