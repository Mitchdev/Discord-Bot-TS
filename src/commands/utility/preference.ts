import { ApplicationCommandOptionType } from 'discord.js';
import { db } from '../..';
import Command from '../../structures/Command';
import UserPreferencesAttributes from '../../typings/database/UserPreferencesAttributes';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'preference',
  description: 'User Preferences',
  options: [{
    name: 'list',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'List Preferences'
  }, {
    name: 'set',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Set Preference',
    options: [{
      name: 'name',
      type: ApplicationCommandOptionType.String,
      description: 'Name of Preference',
      required: true,
      choices: [{
        name: 'Weather Location',
        value: 'location'
      }, {
        name: 'Weather Units',
        value: 'units'
      }, {
        name: 'Currency',
        value: 'currency'
      }]
    }, {
      name: 'preference',
      type: ApplicationCommandOptionType.String,
      description: 'Preference',
      required: true
    }]
  }],
  run: async ({ interaction, subCommand }) => {
    await interaction.deferReply({ephemeral: true});

    if (subCommand === 'set') {
      let userPreference = await db.userPreferences.findByPk(interaction.user.id);
      if (!userPreference) userPreference = await db.userPreferences.build({userid: interaction.user.id, units: 'metric'}).save();

      const name: string = (interaction.options.get('name').value as string);
      const preference: string = (interaction.options.get('preference').value as string);

      if (name === 'units' && (preference.toLowerCase() !== 'metric' && preference.toLowerCase() !== 'standard' && preference.toLowerCase() !== 'imperial')) {
        return await interaction.editReply('Weather Units needs to be either `metric`, `standard` or `imperial`');
      }

      const oldPreference = userPreference.get(name);

      userPreference.set(name as keyof UserPreferencesAttributes, preference);
      await userPreference.save();

      await interaction.editReply(`Updated ${name} from ${oldPreference} to ${userPreference.get(name)}`);
    } else if (subCommand === 'list') {
      let userPreference = await db.userPreferences.findByPk(interaction.user.id);
      if (!userPreference) userPreference = await db.userPreferences.build({userid: interaction.user.id, units: 'metric'}).save();
      await interaction.editReply(`Weather Location: ${userPreference.get('location')}\nWeather Units: ${userPreference.get('units')}\nCurrency: ${userPreference.get('currency')}`);
    }
  }
});
