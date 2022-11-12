import { DataTypes, Model, Sequelize } from 'sequelize';
import TimeoutsAttributes from '../../typings/database/TimeoutsAttributes';

class TimeoutsUser extends Model<TimeoutsAttributes> implements TimeoutsAttributes {
  declare id: string;
  declare timestamp: number;
}

function initiate(sequelize: Sequelize): typeof TimeoutsUser {
  console.log('Initiating timeouts');
  return TimeoutsUser.init({
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    timestamp: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    modelName: 'timeouts',
    sequelize
  });
}

export default initiate;
