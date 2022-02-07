import { ApplicationCommandDataResolvable, Client, ClientEvents, Collection } from 'discord.js';
import { glob } from 'glob';
import { promisify } from 'util';
import Event from './Event';
import CommandType from '../typings/Command';
import ComponentType from '../typings/Component';
import AutocompleteType from '../typings/Autocomplete';
import { registerCommandsOptions } from '../typings/client';
import { devActiveCommands } from '..';

const globPromise = promisify(glob);

export default class ExtendedClient extends Client {
  commands: Collection<string, CommandType> = new Collection();
  components: Collection<string, ComponentType> = new Collection();
  autocomplete: Collection<string, AutocompleteType> = new Collection();

  constructor() {
    super({intents: 32767});
  }

  start() {
    this.registerModules(true);
    this.login(process.env.BOT_TOKEN);
  }

  reload() {
    this.commands = new Collection();
    this.registerModules(false);
  }

  async importFile(filePath: string) {
    return (await import(filePath))?.default;
  }

  async removeCommands(): Promise<string> {
    return new Promise((resolve) => {
      this.application?.commands.set([]);
      this.guilds.cache.get(process.env.GUILD_ID)?.commands.set([]);
      return resolve('Removed all commands (cache might take a while)');
    });
  }

  async registerCommands({ clientCommands, guildCommands }: registerCommandsOptions) {
    await this.application?.commands.set(clientCommands);
    console.log(`Registering ${clientCommands.length} global commands`);

    const setGuildCommands = await this.guilds.cache.get(process.env.GUILD_ID)?.commands.set(guildCommands);
    setGuildCommands.forEach((command) => {
      command.permissions.set({permissions: this.commands.get(command.name + 'ChatInputCommandInteraction').userPermissions});
    });
    console.log(`Registering ${guildCommands.length} commands to ${this.guilds.cache.get(process.env.GUILD_ID).name}`);

  }

  async registerModules(pushCommands: boolean) {
    // Commands
    const clientSlashCommands: ApplicationCommandDataResolvable[] = [];
    const guildSlashCommands: ApplicationCommandDataResolvable[] = [];
    const commandFiles = await globPromise(`${__dirname}/../commands/*/*{.ts,.js}`);
    const contextMenuFiles = await globPromise(`${__dirname}/../context-menu/*/*{.ts,.js}`);
    console.log(`Found ${contextMenuFiles.length} context-menu files`);
    const commandContextMenuFiles = commandFiles.concat(contextMenuFiles);

    let i = 0;
    commandContextMenuFiles.forEach(async (filePath) => {
      const command: CommandType = await this.importFile(filePath);
      i++;
      if (!command.name) return;
      // if in development enviroment, check if command is inside devActiveCommands.
      if ((process.argv[2] === 'dev' && devActiveCommands.includes(command.name)) || process.argv[2] === 'prod') {
        this.commands.set(command.name + command.idType, command);

        if (pushCommands) {
          if ((command.defaultPermission ?? true)) clientSlashCommands.push(command);
          else guildSlashCommands.push(command);
        }

        if (i === commandContextMenuFiles.length) {
          console.log(`Found ${clientSlashCommands.length - contextMenuFiles.length} client command files`);
          console.log(`Found ${guildSlashCommands.length} guild command files`);
        }
      }
    });

    if (pushCommands) {
      this.on('ready', () => {
        this.registerCommands({
          clientCommands: clientSlashCommands,
          guildCommands: guildSlashCommands
        });
      });
    }

    // Message Components
    const messageComponentFiles = await globPromise(`${__dirname}/../components/*/*{.ts,.js}`);
    console.log(`Found ${messageComponentFiles.length} message component files`);
    messageComponentFiles.forEach(async (filePath) => {
      const component: ComponentType = await this.importFile(filePath);
      if (!component.customId) return;
      this.components.set(component.customId + component.idType, component);
    });

    // Autocomplete
    const autocompleteFiles = await globPromise(`${__dirname}/../autocomplete/*{.ts,.js}`);
    console.log(`Found ${autocompleteFiles.length} autocomplete files`);
    autocompleteFiles.forEach(async (filePath) => {
      const autocomplete: AutocompleteType = await this.importFile(filePath);
      if (!autocomplete.optionName) return;
      this.autocomplete.set(autocomplete.optionName + autocomplete.idType, autocomplete);
    });

    // Events
    const eventFiles = await globPromise(`${__dirname}/../events/*/*{.ts,.js}`);
    console.log(`Found ${eventFiles.length} event files`);
    eventFiles.forEach(async filePath => {
      const event: Event<keyof ClientEvents> = await this.importFile(filePath);
      if (event.type === 'on') {
        this.on(event.event, event.run);
      } else if (event.type === 'once') {
        this.once(event.event, event.run);
      }
    });
  }
}
