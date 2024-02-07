import { DataTypes, Model, Sequelize } from 'sequelize';
import NoPixelStreamersAttributes from '../../typings/database/NoPixelStreamersAttributes';

class NoPixelStreamers extends Model<NoPixelStreamersAttributes> implements NoPixelStreamersAttributes {
  declare id: string;
  declare name: string;
  declare npid: string;
  declare status: boolean;
  declare server: string;
  declare lastonline: Date;
  declare notify: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  public get notifyUsers(): string[] {
    return this.getDataValue('notify').split(',').filter((e) => e !== '');
  }
}

function initiate(sequelize: Sequelize): typeof NoPixelStreamers {
  console.log('Initiating nopixel streamers');
  return NoPixelStreamers.init({
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    npid: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    server: {
      type: DataTypes.STRING,
      defaultValue: null
    },
    lastonline: {
      type: DataTypes.DATE,
      defaultValue: null
    },
    notify: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ''
    },
    updatedAt: {
      type: DataTypes.DATE
    }
  }, {
    modelName: 'nopixel_streamers',
    sequelize
  });
}

export default initiate;
