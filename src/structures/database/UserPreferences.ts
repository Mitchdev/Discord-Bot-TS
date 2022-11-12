import { Snowflake } from 'discord.js';
import { DataTypes, Model, Sequelize } from 'sequelize';
import UserPreferencesAttributes from '../../typings/database/UserPreferencesAttributes';

class UserPreferences extends Model<UserPreferencesAttributes> implements UserPreferencesAttributes {
  declare userid: Snowflake;

  declare location: string;
  declare units: string;
  declare currency: string;
}

function initiate(sequelize: Sequelize): typeof UserPreferences {
  console.log('Initiating user preferences');
  return UserPreferences.init({
    userid: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    location: {
      type: DataTypes.STRING
    },
    units: {
      type: DataTypes.STRING
    },
    currency: {
      type: DataTypes.STRING
    }
  }, {
    modelName: 'user_preferences',
    sequelize
  });
}

export default initiate;
