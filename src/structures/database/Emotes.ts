import { DataTypes, Model, Sequelize } from 'sequelize';
import EmotesAttributes from '../../typings/database/EmotesAttributes';

class EmotesEmote extends Model<EmotesAttributes> implements EmotesAttributes {
  declare id: string;
  declare name: string;

  declare animated: boolean;
  declare guild: boolean;
  declare deleted: boolean;

  declare last_used_date: Date | null;
  declare last_used_user: string | null;

  declare uses: number;
  declare seven_days: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  public get sevenDays(): string[] {
    return this.getDataValue('seven_days').split(',');
  }

  public get lastSevenDays(): string | null {
    if (this.getDataValue('seven_days').split(',').at(0) !== '') {
      return this.getDataValue('seven_days').split(',').at(0);
    } else return null;
  }

  addSevenDaysTime(time: Date) {
    const temp: string[] = this.seven_days.split(',');
    temp.push(time.toISOString());
    this.seven_days = temp.join(',');
  }

  getEmoteString(): string {
    return `<${this.animated ? 'a' : ''}:${this.name}:${this.id}>`;
  }
}

function initiate(sequelize: Sequelize): typeof EmotesEmote {
  console.log('Initiating emotes');
  return EmotesEmote.init({
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    animated: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    guild: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    last_used_date: {
      type: DataTypes.DATE,
      defaultValue: null
    },
    last_used_user: {
      type: DataTypes.STRING,
      defaultValue: null
    },
    uses: {
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
    modelName: 'emotes',
    sequelize
  });
}

export default initiate;
