import { DataTypes, Model, Sequelize } from 'sequelize';
import MessagesAttributes from '../../typings/database/MessagesAttributes';

class MessagesUser extends Model<MessagesAttributes> implements MessagesAttributes {
  declare id: string;
  declare username: string;
  declare discriminator: string;
  declare nickname: string | null;

  declare total: number;
  declare seven_days: string;

  public get sevenDays(): string[] {
    return this.getDataValue('seven_days').split(',');
  }

  public get lastSevenDays(): string | null {
    if (this.getDataValue('seven_days').split(',').at(0) !== '') {
      return this.getDataValue('seven_days').split(',').at(0);
    } else return null;
  }

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  addSevenDaysTime(time: Date) {
    const temp: string[] = this.seven_days.split(',');
    temp.push(time.toISOString());
    this.seven_days = temp.join(',');
  }
}

function initiate(sequelize: Sequelize): typeof MessagesUser {
  console.log('Initiating messages');
  return MessagesUser.init({
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    discriminator: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nickname: {
      type: DataTypes.STRING,
      defaultValue: null
    },
    total: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    seven_days: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ''
    }
  }, {
    modelName: 'messages',
    sequelize
  });
}

export default initiate;
