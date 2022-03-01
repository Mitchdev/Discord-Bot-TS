import { DataTypes, Model, Sequelize } from 'sequelize';
import MeasurementUnitsAttributes from '../../typings/database/MeasurementUnitsAttributes';

class Measurements extends Model<MeasurementUnitsAttributes> implements MeasurementUnitsAttributes {
  declare id: number;
  declare type: 'currency' |'area' | 'temperature' |
                'time' | 'speed' | 'length' | 'mass' |
                'angle' | 'pressure' | 'volume' |
                'storage' | 'frequency' | 'energy';
  declare base: boolean;

  declare full_name: string;
  declare short_name: string;
  declare plural_name: string;
  declare symbol: string;

  declare convert_source: string;
  declare convert_target: string;
  declare convert_value: number;
}

function initiate(sequelize: Sequelize): typeof Measurements {
  console.log('Initiating measurements');
  return Measurements.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    base: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    short_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    plural_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    symbol: {
      type: DataTypes.STRING,
      allowNull: false
    },
    convert_source: {
      type: DataTypes.STRING,
      allowNull: false
    },
    convert_target: {
      type: DataTypes.STRING,
      allowNull: false
    },
    convert_value: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    modelName: 'measurements',
    sequelize
  });
}

export default initiate;
