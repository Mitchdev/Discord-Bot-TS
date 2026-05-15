import { ApplicationCommandDataResolvable, Client, ClientEvents, Collection, GatewayIntentBits } from 'discord.js';
import { glob } from 'glob';
import Event from './Event';
import CommandType from '../typings/Command';
import ComponentType from '../typings/Component';
import AutocompleteType from '../typings/Autocomplete';
import { devActiveCommands } from '..';
import Message from '../typings/Message';
import { readFileSync } from 'fs';

export default class ExtendedClient extends Client {
  messages: Map<string, Message[]> = new Map();
  commands: Collection<string, CommandType> = new Collection();
  components: Collection<string, ComponentType> = new Collection();
  autocomplete: Collection<string, AutocompleteType> = new Collection();

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.AutoModerationExecution,
      ]
    })

    this.messages = new Map(Object.entries(JSON.parse(readFileSync('./messages.json', { encoding: 'utf8' }))));
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
    const commandFiles = await glob(`${__dirname}/../commands/*/*{.ts,.js}`);
    const contextMenuFiles = await glob(`${__dirname}/../context-menu/*/*{.ts,.js}`);
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
      this.on('clientReady', () => {
        this.registerCommands(slashCommands);
      });
    }

    // Message Components
    const messageComponentFiles = await glob(`${__dirname}/../components/*/*{.ts,.js}`);
    console.log(`Found ${messageComponentFiles.length} message component files`);
    messageComponentFiles.forEach(async (filePath) => {
      const component: ComponentType = await this.importFile(filePath);
      if (!component.customId) return;
      this.components.set(component.customId + component.idType, component);
    });

    // Autocomplete
    const autocompleteFiles = await glob(`${__dirname}/../autocomplete/*{.ts,.js}`);
    console.log(`Found ${autocompleteFiles.length} autocomplete files`);
    autocompleteFiles.forEach(async (filePath) => {
      const autocomplete: AutocompleteType = await this.importFile(filePath);
      if (!autocomplete.optionName) return;
      this.autocomplete.set(autocomplete.optionName + autocomplete.idType, autocomplete);
    });

    // Events
    const eventFiles = await glob(`${__dirname}/../events/*/*{.ts,.js}`);
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
