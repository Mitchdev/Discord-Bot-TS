import { ActionRow, ActionRowBuilder, AnyComponentBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonComponent, ButtonStyle, Message, TextChannel } from 'discord.js';
import { db } from '../..';
import RolesCategory from '../../enums/RolesCategory';
import ExtendedClient from '../../structures/Client';
import Command from '../../structures/Command';
import { RolesRole } from '../../structures/database/Roles';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'roles',
  description: 'Add or remove selection role',
  options: [{
    name: 'reload',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Reloads roles channel message'
  }, {
    name: 'remove',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Removes a role from the roles channel',
    options: [{
      name: 'name',
      type: ApplicationCommandOptionType.String,
      description: 'Name of role to remove',
      required: false
    }, {
      name: 'role',
      type: ApplicationCommandOptionType.Role,
      description: 'Role of role to remove',
      required: false
    }],
  }, {
    name: 'add',
    type: ApplicationCommandOptionType.Subcommand,
    description: 'Adds a role to the roles channel',
    options: [{
      name: 'category',
      type: ApplicationCommandOptionType.String,
      description: 'Category you want to role to appear in',
      required: true,
      choices: [{
        name: 'General',
        value: 'General'
      }, {
        name: 'Gaming',
        value: 'Gaming'
      }],
    }, {
      name: 'name',
      type: ApplicationCommandOptionType.String,
      description: 'Name of role',
      required: true
    }, {
      name: 'role',
      type: ApplicationCommandOptionType.Role,
      description: 'Role that gets added when doing the reaction',
      required: true
    }, {
      name: 'emoji',
      type: ApplicationCommandOptionType.String,
      description: 'Emoji for reaction',
      required: true
    }]
  }],
  run: async ({ client, interaction, subCommand }) => {
    await interaction.deferReply({ephemeral: true});
    if (subCommand === 'reload') {
      interaction.editReply('Updating...');
      reloadRolesMessage(client).then(() => {
        interaction.editReply('Updated');
      });
    } else if (subCommand === 'remove') {
      if (interaction.options.get('role')) {
        (await db.roles.findOne({ where: { roleid: interaction.options.get('role').role.id } })).destroy();
      } else if (interaction.options.get('name')) {
        (await db.roles.findOne({ where: { name: interaction.options.get('name').value } })).destroy();
      } else {
        interaction.editReply('Need to specify a name or role');
        return;
      }

      interaction.editReply('Updating...');
      reloadRolesMessage(client).then(() => {
        interaction.editReply('Updated');
      });
    } else if (subCommand === 'add') {
      const emote = {id: null, name: null};
      // eslint-disable-next-line no-useless-escape
      const emojiMatch = (interaction.options.get('emoji').value as string).match(/\<\:(.+?)\:(\d+?)\>/g);
      const unicodeEmojiMatch = (interaction.options.get('emoji').value as string).match(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g);
      if (emojiMatch) {
        const emoji = await client.guilds.resolve(process.env.GUILD_ID).emojis.fetch(emojiMatch[0].split(':')[2].replace('>', ''));
        if (emoji) {
          emote.name = emoji.name;
          emote.id = emoji.id;
        } else {
          interaction.editReply({content: 'Invalid emoji, guild emoji only'});
          return;
        }
      } else if (unicodeEmojiMatch) emote.name = unicodeEmojiMatch[0];
      else {
        interaction.editReply({content: 'Invalid emoji, guild emoji only'});
        return;
      }

      db.roles.build({
        name: interaction.options.get('name').value as string,
        category: RolesCategory[interaction.options.get('category').value as string],
        roleid: interaction.options.get('role').role.id as string,
        emoteid: emote.id,
        emotename: emote.name,
      }).save();

      interaction.editReply('Updating...');
      reloadRolesMessage(client).then(() => {
        interaction.editReply('Updated');
      });
    }
  }
});

async function reloadRolesMessage(client: ExtendedClient): Promise<Message> {
  const rows: ActionRowBuilder<AnyComponentBuilder>[] = [];
  const channel = client.channels.resolve(process.env.CHANNEL_ROLES) as TextChannel;
  const messages = await channel.messages.fetch();
  let message = messages.find((message) => message.author.id === process.env.BOT_ID);
  if (!message) message = await channel.send('building');

  const categories: {name: string, roles: RolesRole[], buttons: ButtonComponent[]}[] = [];

  for (const category in RolesCategory) {
    if (isNaN(Number(category))) {
      const roles = await db.roles.findAll({ where: { category: RolesCategory[category] }});
      if (roles.length > 0) {
        const categoryButtons = [];
        roles.forEach((role) => {
          const button = new ButtonBuilder()
            .setCustomId(`roles|${role.id}`)
            .setStyle(ButtonStyle.Primary)
            .setLabel(role.name);
          if (role.emoteid) {
            button.setEmoji({
              name: role.emotename,
              id: role.emoteid,
              animated: false
            });
          } else {
            button.setLabel(`${role.emotename} ${role.name}`);
          }
          categoryButtons.push(button);
        });
        categories.push({name: category, roles: roles, buttons: categoryButtons});
      }
    }
  }

  for (let i = 0; i < categories.length; i++) {
    let row = new ActionRowBuilder();
    for (let j = 0; j < categories[i].buttons.length; j++) {
      row.addComponents([categories[i].buttons[j] as unknown as ButtonBuilder]);
      if (row.components.length === 5 || j === categories[i].buttons.length - 1) {
        rows.push(row);
        row = new ActionRowBuilder();
      }
    }
  }

  return await message.edit({content: '**Instructions**\n' +
    'Press a button to get the role and access to the channels.\n' +
    'Ask a mod to give you a regional role\n' +
    categories.map((categoryRoles) => {
      return `\n**${categoryRoles.name} Roles**\n${categoryRoles.roles.map((role) => {
        const emote = role.emoteid ? client.guilds.resolve(process.env.GUILD_ID).emojis.resolve(role.emoteid) : role.emotename;
        return `${emote}    ${role.name}`;
      }).join('\n')}`;
    }).join('\n'), components: rows as unknown as ActionRow<ButtonComponent>[]});
}
