import { Snowflake } from 'discord.js';

interface UserPreferencesAttributes {
  userid: Snowflake;

  location: string;
  units: string;
  currency: string;
}

export default UserPreferencesAttributes;
