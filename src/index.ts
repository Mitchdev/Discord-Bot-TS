import dotenv = require('dotenv')
dotenv.config();

import { Sequelize } from 'sequelize';

import Emotes from './structures/database/Emotes';
import Invites from './structures/database/Invites';
import Languages from './structures/database/Languages';
import Messages from './structures/database/Messages';
import TempRoles from './structures/database/TempRoles';
import Roles from './structures/database/Roles';
import BannedPhrases from './structures/database/BannedPhrases';

import emotesSevenDaysRemove from './scheduled/emotesSevenDaysRemove';
import messagesSevenDaysRemove from './scheduled/messagesSevenDaysRemove';
import tempRolesRemove from './scheduled/tempRolesRemove';

import ExtendedClient from './structures/Client';
import CommandType from './typings/Command';

if (process.argv[2] === 'dev') {
  process.env.BOT_TOKEN = process.env.BOT_TOKEN_DEV;
  process.env.BOT_ID = process.env.BOT_ID_DEV;
}

export const client = new ExtendedClient();

// commands currently working on.
export const devActiveCommands: CommandType['name'][] = [];

export const sequelize = new Sequelize({
  host: 'localhost',
  dialect: 'sqlite',
  storage: process.argv[2] === 'dev' ? 'discord-dev.sqlite' : 'discord.sqlite',
  logging: process.argv[2] === 'dev' ? console.log : false
});

export const db =  {
  messages: Messages(sequelize),
  emotes: Emotes(sequelize),
  tempRoles: TempRoles(sequelize),
  roles: Roles(sequelize),
  bannedPhrases: BannedPhrases(sequelize),
  invites: Invites(sequelize),
  languages: Languages(sequelize)
};

export const timers = {
  messages_seven_day_removal: messagesSevenDaysRemove,
  emotes_seven_day_removal: emotesSevenDaysRemove,
  temp_roles_removal: tempRolesRemove
};

client.start();
