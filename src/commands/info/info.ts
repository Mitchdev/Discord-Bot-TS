import os from 'os';
//import fetch from 'node-fetch';
import Command from '../../structures/Command';
import { EmbedBuilder } from 'discord.js';
import { Util } from '../..';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'info',
  description: 'Shows uptime and ping',
  run: async ({ client, interaction }) => {
    await interaction.deferReply();

    // const pre = new Date();
    // await fetch(process.env.ANDLIN_PING_API);
    // const post = new Date();

    const embed = new EmbedBuilder()
      .setTitle('Info')
      .addFields([{
        name: 'Client Uptime',
        value: Util.secondsToDhms(client.uptime/1000),
        inline: true,
      }, Util.blankField(), {
        name: 'Discord API Ping',
        value: `${Math.round(client.ws.ping)}ms`,
        inline: true,
      }, {
        name: 'System Uptime',
        value: Util.secondsToDhms(os.uptime()),
        inline: true,
      }
      // , {
      //   name: 'Andlin API Ping',
      //   value: `${(post.getTime() - pre.getTime())}ms`,
      //   inline: true,
      // }
    ]);

    interaction.editReply({embeds: [embed]});
  }
});
