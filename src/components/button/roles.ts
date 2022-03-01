import { GuildMember } from 'discord.js';
import { db } from '../..';
import Component from '../../structures/Component';

export default new Component({
  idType: 'ButtonInteraction',
  customId: 'roles',
  run: async ({ client, interaction, args }) => {
    await interaction.deferReply({ephemeral: true});

    const role = await db.roles.findByPk(parseInt(args[0]));
    if (role) {
      if (interaction.member) {
        const guild = client.guilds.resolve(process.env.GUILD_ID);
        if (interaction.member.roles.resolve(role.roleid)) {
          guild.members.fetch(process.env.BOT_ID).then((botMember: GuildMember) => {
            const guildRole = guild.roles.resolve(role.roleid);
            if (botMember.roles.highest.position >= guildRole.position) {
              interaction.member.roles.remove(role.roleid).then(async () => {
                interaction.editReply(`Removed ${role.name}`);
              }).catch((error) => console.log(error));
            } else {
              interaction.editReply(`Bot does not have permissions to remove **${guildRole.name}**`);
            }
          });
        } else {
          guild.members.fetch(process.env.BOT_ID).then((botMember: GuildMember) => {
            const guildRole = guild.roles.resolve(role.roleid);
            if (botMember.roles.highest.position >= guildRole.position) {
              interaction.member.roles.add(role.roleid).then(async () => {
                interaction.editReply(`Added ${role.name}`);
              }).catch((error) => console.log(error));
            } else {
              interaction.editReply(`Bot does not have permissions to add **${guildRole.name}**`);
            }
          });
        }
      } else {
        interaction.editReply('Unexpected Error');
      }
    } else {
      interaction.editReply('Unexpected Error');
    }
  }
});
