import { DataTypes, Model, Sequelize } from 'sequelize';
import SuggestionsAttributes from '../../typings/database/SuggestionsAttributes';

class SuggestionsSuggestion extends Model<SuggestionsAttributes> implements SuggestionsAttributes {
  declare id: number;

  declare type: 'bot' | 'server' | 'sticker' | 'emote';

  declare suggestion: string;

  declare name: string;
  declare emoji: string;

  declare status: 'Completed' | 'Accepted' | 'In Progress' | 'Pending' | 'Denied';

  declare messageid: string;

  declare suggesterid: string;
  declare suggesterusername: string;

  declare respondentid: string;
  declare respondentusername: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

function initiate(sequelize: Sequelize): typeof SuggestionsSuggestion {
  console.log('Initiating suggestions');
  return SuggestionsSuggestion.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    suggestion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    emoji: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    },
    messageid: {
      type: DataTypes.STRING,
      allowNull: true
    },
    suggesterid: {
      type: DataTypes.STRING,
      allowNull: false
    },
    suggesterusername: {
      type: DataTypes.STRING,
      allowNull: false
    },
    respondentid: {
      type: DataTypes.STRING,
      allowNull: true
    },
    respondentusername: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    modelName: 'suggestions',
    sequelize
  });
}

export default initiate;
