import { DataTypes, Model, Sequelize } from 'sequelize';
import BannedPhrasesAttributes from '../../typings/database/BannedPhrasesAttributes';

class BannedPhrases extends Model<BannedPhrasesAttributes> implements BannedPhrasesAttributes {
  declare id: number;

  declare phrase: string;

  declare roleid: string;
  declare rolename: string;

  declare duration: string;
  declare seconds: number;
}

function initiate(sequelize: Sequelize): typeof BannedPhrases {
  console.log('Initiating banned phrases');
  return BannedPhrases.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    phrase: {
      type: DataTypes.STRING,
      allowNull: false
    },
    roleid: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rolename: {
      type: DataTypes.STRING,
      allowNull: false
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: false
    },
    seconds: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    modelName: 'ban_phrases',
    sequelize
  });
}

export default initiate;
