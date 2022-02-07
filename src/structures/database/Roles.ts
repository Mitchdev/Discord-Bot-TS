import { DataTypes, Model, Sequelize } from 'sequelize';
import RolesAttributes from '../../typings/database/RolesAttributes';

export class RolesRole extends Model<RolesAttributes> implements RolesAttributes {
  declare id: number;

  declare name: string;
  declare category: number;

  declare roleid: string;
  declare emoteid: string;
  declare emotename: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

function initiate(sequelize: Sequelize): typeof RolesRole {
  console.log('Initiating selection roles');
  return RolesRole.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    roleid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    emoteid: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    emotename: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    modelName: 'selection_roles',
    sequelize
  });
}

export default initiate;
