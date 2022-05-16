import { DataTypes, Model, Sequelize } from 'sequelize';
import RecycledLinksAttributes from '../../typings/database/RecycledLinksAttributes';

class RecycledLinks extends Model<RecycledLinksAttributes> implements RecycledLinksAttributes {
  declare url: string;
  declare guild: string;
  declare channel: string;
  declare message: string;
}

function initiate(sequelize: Sequelize): typeof RecycledLinks {
  console.log('Initiating recycled links');
  return RecycledLinks.init({
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    guild: {
      type: DataTypes.STRING,
      allowNull: false
    },
    channel: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    modelName: 'recycled_links',
    sequelize
  });
}

export default initiate;
