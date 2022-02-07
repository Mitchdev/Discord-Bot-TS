import os from 'os';
import fetch from 'node-fetch';
import Command from '../../structures/Command';
import { secondsToDhms } from '../../structures/Utilities';
import Embed from '../../typings/Embed';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'info',
  description: 'Shows uptime and ping',
  run: async ({ client, interaction }) => {
    await interaction.deferReply();

    const pre = new Date();
    await fetch(process.env.ANDLIN_PING_API);
    const post = new Date();

    const embed = new Embed()
      .setTitle('Info')
      .addField({
        name: 'Client Uptime',
        value: secondsToDhms(client.uptime/1000),
        inline: true,
      })
      .addBlankField()
      .addField({
        name: 'Discord API Ping',
        value: `${Math.round(client.ws.ping)}ms`,
        inline: true,
      })
      .addField({
        name: 'System Uptime',
        value: secondsToDhms(os.uptime()),
        inline: true,
      })
      .addBlankField()
      .addField({
        name: 'Andlin API Ping',
        value: `${(post.getTime() - pre.getTime())}ms`,
        inline: true,
      });

    interaction.editReply({embeds: [embed]});
  }
});
