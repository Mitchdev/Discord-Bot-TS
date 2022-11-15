import dotenv = require('dotenv');
dotenv.config();

import { Sequelize } from 'sequelize';

import {
  BannedPhrases,
  EmbededTweets,
  Emotes,
  Invites,
  Languages,
  Measurements,
  Messages,
  NoPixelStreamers,
  RecycledLinks,
  Roles,
  Suggestions,
  TempRoles,
  Timeouts,
  UserPreferences
} from './structures/database';

import {
  emotesSevenDaysRemove,
  f1StandingsUpdate,
  messagesSevenDaysRemove,
  nopixel,
  regularUsersUpdate,
  tempRolesRemove,
  updateUptime
} from './scheduled';

import Utilities from './structures/Utilities';
import CloudConvertClient from './structures/CloudConvertClient';
import TwitterClient from './structures/TwitterClient';
import ExtendedClient from './structures/Client';

import CommandType from './typings/Command';

if (process.argv[2] === 'dev') {
  process.env.BOT_TOKEN = process.env.BOT_TOKEN_DEV;
  process.env.BOT_ID = process.env.BOT_ID_DEV;
}

export const startDate = new Date();

export const Util = new Utilities();

export const client = new ExtendedClient();

// commands currently working on.
export const devActiveCommands: CommandType['name'][] = [];

export const twitter = new TwitterClient();

export const convert = new CloudConvertClient();

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
  suggestions: Suggestions(sequelize),
  measurements: Measurements(sequelize),
  embededTweets: EmbededTweets(sequelize),
  recycledLinks: RecycledLinks(sequelize),
  userPreferences: UserPreferences(sequelize),
};

export type db = typeof db;

export const timers = {
  update_uptime: updateUptime,
  messages_seven_day_removal: messagesSevenDaysRemove,
  emotes_seven_day_removal: emotesSevenDaysRemove,
  temp_roles_removal: tempRolesRemove,
  regular_users_update: regularUsersUpdate,
  f1_standings_update: f1StandingsUpdate,
  nopixel: nopixel
};

export type timers = typeof timers;

client.start();
