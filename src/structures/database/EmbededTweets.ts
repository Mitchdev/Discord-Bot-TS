import { DataTypes, Model, Sequelize } from 'sequelize';
import EmbededTweetsAttributes from '../../typings/database/EmbededTweetsAttributes';

class EmbededTweets extends Model<EmbededTweetsAttributes> implements EmbededTweetsAttributes {
  declare channel_id: string;
  declare message_id: string;
  declare bot_message_id: string;
}

function initiate(sequelize: Sequelize): typeof EmbededTweets {
  console.log('Initiating embeded tweets');
  return EmbededTweets.init({
    channel_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    bot_message_id: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    modelName: 'embeded_tweets',
    sequelize
  });
}

export default initiate;
