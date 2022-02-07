interface TempRolesAttributes {
  id: number;

  userid: string;
  username: string;

  roleid: string;
  rolename: string;

  expireAt: Date;
  duration: string;

  byid: string;
  byusername: string;
}

export default TempRolesAttributes;
