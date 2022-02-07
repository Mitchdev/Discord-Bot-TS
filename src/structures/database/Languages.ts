import { DataTypes, Model, Sequelize } from 'sequelize';
import LanguagesAttributes from '../../typings/database/LanguagesAttributes';

class LanguagesLanguage extends Model<LanguagesAttributes> implements LanguagesAttributes {
  declare short_name: string;
  declare long_name: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

function initiate(sequelize: Sequelize): (typeof LanguagesLanguage) {
  console.log('Initiating languages');
  return LanguagesLanguage.init({
    short_name: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    long_name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    modelName: 'languages',
    sequelize
  });
}

export default initiate;
