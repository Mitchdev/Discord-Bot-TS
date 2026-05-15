import Database from './Database';

function generateCreateTable(tableName: string, fields: string[], extraProperties: string) {
  if (fields.length === 0) throw new Error('Table cannot be empty');
  return `CREATE TABLE IF NOT EXISTS \`${tableName}\` (${fields.join(', ')}${extraProperties ? `, ${extraProperties}` : ''});`;
}

export default async function initiateTables(database: Database) {
  await database.query(generateCreateTable('bannedPhrases', [
    '`id` INT AUTO_INCREMENT',
    '`phrase` VARCHAR(256) NOT NULL',
    '`roleId` BIGINT NOT NULL',
    '`roleName` VARCHAR(32) NOT NULL',
    '`duration` CHAR(5) NOT NULL',
    '`seconds` INT NOT NULL',
  ], 'PRIMARY KEY (`id`)'));

  await database.query(generateCreateTable('embeddedTweets', [
    '`channelId` BIGINT NOT NULL',
    '`messageId` BIGINT NOT NULL',
    '`botMessageId` BIGINT NOT NULL',
  ], 'PRIMARY KEY (`messageId`)'));

  await database.query(generateCreateTable('emotes', [
    '`id` BIGINT NOT NULL',
    '`name` VARCHAR(32) NOT NULL',
    '`animated` BOOL NOT NULL',
    '`guild` BOOL NOT NULL',
    '`deleted` BOOL NOT NULL',
    '`lastUsedDate` DATETIME DEFAULT NULL',
    '`lastUsedUser` BIGINT DEFAULT NULL',
    '`uses` INT NOT NULL DEFAULT 0',
    '`sevenDays` LONGTEXT NOT NULL',
  ], 'PRIMARY KEY (`id`)'));

  await database.query(generateCreateTable('invites', [
    '`id` VARCHAR(32) NOT NULL',
    '`username` VARCHAR(64) NOT NULL',
    '`uses` TINYINT NOT NULL DEFAULT 0',
  ], 'PRIMARY KEY (`id`)'));

  await database.query(generateCreateTable('languages', [
    '`shortName` CHAR(8) NOT NULL',
    '`longName` VARCHAR(32) NOT NULL',
  ], 'PRIMARY KEY (`shortName`)'));

  await database.query(generateCreateTable('measurements', [
    '`id` INT AUTO_INCREMENT',
    '`type` VARCHAR(16) NOT NULL',
    '`base` BOOL NOT NULL',
    '`fullName` VARCHAR(64) NOT NULL',
    '`shortName` VARCHAR(16) NOT NULL',
    '`pluralName` VARCHAR(64) NOT NULL',
    '`symbol` VARCHAR(16) NOT NULL',
    '`convertSource` VARCHAR(16) NOT NULL',
    '`convertTarget` VARCHAR(16) NOT NULL',
    '`convertValue` FLOAT NOT NULL',
  ], 'PRIMARY KEY (`id`)'));

  await database.query(generateCreateTable('messages', [
    '`id` BIGINT NOT NULL',
    '`username` VARCHAR(64) NOT NULL',
    '`discriminator` TINYINT(4) NOT NULL DEFAULT 0',
    '`nickname` VARCHAR(64) NOT NULL',
    '`total` INT NOT NULL DEFAULT 0',
    '`sevenDays` LONGTEXT NOT NULL',
  ], 'PRIMARY KEY (`id`)'));

  await database.query(generateCreateTable('gtarp', [
    '`id` VARCHAR(32) NOT NULL',
    '`name` VARCHAR(32) NOT NULL',
    '`fiveMId` VARCHAR(64) NOT NULL',
    '`status` BOOL NOT NULL DEFAULT 0',
    '`server` VARCHAR(16) DEFAULT NULL',
    '`lastOnline` DATETIME DEFAULT NULL',
    '`notify` TEXT NOT NULL',
    '`modifiedDate` DATETIME NOT NULL',
  ], 'PRIMARY KEY (`id`)'));

  await database.query(generateCreateTable('recycledLinks', [
    '`url` VARCHAR(256) NOT NULL',
    '`guild` BIGINT NOT NULL',
    '`channel` BIGINT NOT NULL',
    '`message` BIGINT NOT NULL',
  ], 'PRIMARY KEY (`url`)'));

  await database.query(generateCreateTable('selectionRoles', [
    '`id` INT AUTO_INCREMENT',
    '`name` VARCHAR(32) NOT NULL',
    '`category` TINYINT NOT NULL',
    '`roleId` BIGINT NOT NULL',
    '`emoteId` BIGINT DEFAULT NULL',
    '`emoteName` VARCHAR(16) NOT NULL',
  ], 'PRIMARY KEY (`id`)'));

  await database.query(generateCreateTable('suggestions', [
    '`id` INT AUTO_INCREMENT',
    '`type` VARCHAR(16) NOT NULL',
    '`suggestion` LONGTEXT NOT NULL',
    '`name` TEXT DEFAULT NULL',
    '`emoji` VARCHAR(64) DEFAULT NULL',
    '`status` VARCHAR(16) DEFAULT \'Pending\'',
    '`messageId` BIGINT DEFAULT NULL',
    '`suggesterId` BIGINT NOT NULL',
    '`suggesterUsername` VARCHAR(32) NOT NULL',
    '`respondentId` BIGINT NOT NULL',
    '`respondentUsername` VARCHAR(32) NOT NULL',
  ], 'PRIMARY KEY (`id`)'));

  await database.query(generateCreateTable('tempRoles', [
    '`id` INT AUTO_INCREMENT',
    '`userId` BIGINT NOT NULL',
    '`username` VARCHAR(32) NOT NULL',
    '`roleId` BIGINT NOT NULL',
    '`roleName` VARCHAR(32) NOT NULL',
    '`expireAt` DATETIME NOT NULL',
    '`duration` CHAR(5) NOT NULL',
    '`byId` BIGINT NOT NULL',
    '`byUsername` VARCHAR(32) NOT NULL',
  ], 'PRIMARY KEY (`id`)'));

  await database.query(generateCreateTable('timeouts', [
    '`id` BIGINT NOT NULL',
    '`timestamp` TIMESTAMP NOT NULL',
  ], 'PRIMARY KEY (`id`)'));

  await database.query(generateCreateTable('userPreferences', [
    '`userid` BIGINT NOT NULL',
    '`location` VARCHAR(32) DEFAULT NULL',
    '`units` VARCHAR(16) DEFAULT \'metric\'',
    '`currency` VARCHAR(8) DEFAULT NULL',
  ], 'PRIMARY KEY (`userid`)'));
}