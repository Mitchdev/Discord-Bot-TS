import dotenv = require('dotenv');
dotenv.config();

import { Sequelize } from 'sequelize';

import Emotes from './structures/database/Emotes';
import Invites from './structures/database/Invites';
import Languages from './structures/database/Languages';
import Messages from './structures/database/Messages';
import TempRoles from './structures/database/TempRoles';
import Roles from './structures/database/Roles';
import BannedPhrases from './structures/database/BannedPhrases';
import Timeouts from './structures/database/Timeouts';
import Suggestions from './structures/database/Suggestions';

import emotesSevenDaysRemove from './scheduled/emotesSevenDaysRemove';
import messagesSevenDaysRemove from './scheduled/messagesSevenDaysRemove';
import tempRolesRemove from './scheduled/tempRolesRemove';
import regularUsersUpdate from './scheduled/regularUsersUpdate';

import ExtendedClient from './structures/Client';
import CommandType from './typings/Command';

if (process.argv[2] === 'dev') {
  process.env.BOT_TOKEN = process.env.BOT_TOKEN_DEV;
  process.env.BOT_ID = process.env.BOT_ID_DEV;
}

export const client = new ExtendedClient();

// commands currently working on.
export const devActiveCommands: CommandType['name'][] = ['f1'];

export const sequelize = new Sequelize({
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
  languages: Languages(sequelize),
  timeouts: Timeouts(sequelize),
  suggestions: Suggestions(sequelize)
};

export type db = typeof db;

export const timers = {
  messages_seven_day_removal: messagesSevenDaysRemove,
  emotes_seven_day_removal: emotesSevenDaysRemove,
  temp_roles_removal: tempRolesRemove,
  regular_users_update: regularUsersUpdate
};

export type timers = typeof timers;

client.start();
