import { DataTypes, Model, Sequelize } from 'sequelize';
import TempRolesAttributes from '../../typings/database/TempRolesAttributes';

class TempRolesRole extends Model<TempRolesAttributes> implements TempRolesAttributes {
  declare id: number;

  declare userid: string;
  declare username: string;

  declare roleid: string;
  declare rolename: string;

  declare expireAt: Date;
  declare duration: string;

  declare byid: string;
  declare byusername: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

function initiate(sequelize: Sequelize): typeof TempRolesRole {
  console.log('Initiating temp roles');
  return TempRolesRole.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userid: {
      type: DataTypes.STRING,
      allowNull: false
    },
    username: {
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
    expireAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: false
    },
    byid: {
      type: DataTypes.STRING,
      allowNull: false
    },
    byusername: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    modelName: 'temp_roles',
    sequelize
  });
}

export default initiate;
