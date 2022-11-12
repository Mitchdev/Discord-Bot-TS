import { ApplicationCommandDataResolvable, Client, ClientEvents, Collection, IntentsBitField } from 'discord.js';
import { glob } from 'glob';
import { promisify } from 'util';
import Event from './Event';
import CommandType from '../typings/Command';
import ComponentType from '../typings/Component';
import AutocompleteType from '../typings/Autocomplete';
import { devActiveCommands } from '..';

const globPromise = promisify(glob);

export default class ExtendedClient extends Client {
  commands: Collection<string, CommandType> = new Collection();
  components: Collection<string, ComponentType> = new Collection();
  autocomplete: Collection<string, AutocompleteType> = new Collection();

  constructor() {
    super({intents: [
      IntentsBitField.Flags.DirectMessageReactions,
      IntentsBitField.Flags.DirectMessageTyping,
      IntentsBitField.Flags.DirectMessages,
      IntentsBitField.Flags.GuildBans,
      IntentsBitField.Flags.GuildEmojisAndStickers,
      IntentsBitField.Flags.GuildIntegrations,
      IntentsBitField.Flags.GuildInvites,
      IntentsBitField.Flags.GuildMembers,
      IntentsBitField.Flags.GuildMessageReactions,
      IntentsBitField.Flags.GuildMessageTyping,
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.GuildPresences,
      IntentsBitField.Flags.GuildScheduledEvents,
      IntentsBitField.Flags.GuildVoiceStates,
      IntentsBitField.Flags.GuildWebhooks,
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.MessageContent
    ]});
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
      return resolve('Removing all commands');
    });
  }

  async registerCommands(commands: ApplicationCommandDataResolvable[]) {
    await this.application?.commands.set(commands);
    console.log(`Registering ${commands.length} global commands`);

    // const setGuildCommands =
    //await this.guilds.cache.get(process.env.GUILD_ID)?.commands.set(guildCommands);
    // setGuildCommands.forEach((command) => {
    //   command.permissions.set({permissions: this.commands.get(command.name + 'ChatInputCommandInteraction').userPermissions});
    // });
    //console.log(`Registering ${guildCommands.length} commands to ${this.guilds.cache.get(process.env.GUILD_ID).name}`);
  }

  async registerModules(pushCommands: boolean) {
    // Commands
    const slashCommands: ApplicationCommandDataResolvable[] = [];
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
          slashCommands.push(command);
        }

        if (i === commandContextMenuFiles.length) {
          console.log(`Found ${slashCommands.length - contextMenuFiles.length} slash command files`);
        }
      }
    });

    if (pushCommands) {
      this.on('ready', () => {
        this.registerCommands(slashCommands);
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
