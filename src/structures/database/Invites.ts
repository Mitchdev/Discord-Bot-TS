import { DataTypes, Model, Sequelize } from 'sequelize';
import InvitesAttributes from '../../typings/database/InvitesAttributes';

class InvitesInvite extends Model<InvitesAttributes> implements InvitesAttributes {
  declare id: string;
  declare username: string;

  declare uses: number;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

function initiate(sequelize: Sequelize): typeof InvitesInvite {
  console.log('Initiating invites');
  return InvitesInvite.init({
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    uses: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    modelName: 'invites',
    sequelize
  });
}

export default initiate;
