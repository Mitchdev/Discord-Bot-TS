import { Op } from 'sequelize';
import { db, Util } from '..';
import Scheduled from '../structures/Scheduled';

export default new Scheduled('temp_roles_removal', 10, false, async () => {
  const expired = await db.tempRoles.findAll({ where: { expireAt: { [Op.lte]: new Date() } } });
  for (let i = 0; i < expired.length; i++) {
    Util.removeTempRole({
      id: expired[i].roleid,
      name: expired[i].rolename
    }, {
      id: expired[i].userid,
      username: expired[i].username
    });
  }
});
