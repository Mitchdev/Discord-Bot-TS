import { ApplicationCommandOptionType, AttachmentBuilder } from 'discord.js';
import fetch from 'node-fetch';
import { Util } from '../..';
import Command from '../../structures/Command';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'tiktok',
  description: 'Posts tiktok video mp4',
  options: [{
    name: 'url',
    type: ApplicationCommandOptionType.String,
    description: 'Tiktok url',
    required: true
  }],
  run: async ({ interaction }) => {
    await interaction.deferReply();

    if (Util.validUrl(interaction.options.get('url').value as string)) {
      const id = await getIdFromUrl(interaction.options.get('url').value as string);
      if (id) {
        const vidUrl = await getVideoFromId(id);
        if (vidUrl) {
          const buffer = await getBufferFromVideo(vidUrl);
          await interaction.editReply({
            files: [new AttachmentBuilder(buffer, {
              name: 'tiktok.mp4'
            })]
          });
          return;
        }
      }
    }

    await interaction.editReply('Invalid TikTok URL');
  }
});

async function getBufferFromVideo(vidUrl: string): Promise<Buffer | null> {
  const res = await fetch(vidUrl, {
    method: 'GET',
    headers: {
      'Accept': '*/*',
      'Accept-Encoding': 'identity;q=1, *;q=0',
      'Accept-Language': 'en-US;en;q=0.9',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Host': vidUrl.split('/')[2],
      'Pragma': 'no-cache',
      'Range': 'bytes=0-',
      'Referer': 'https://www.tiktok.com/',
    }
  });

  try {
    const buffer = await res.buffer();
    return buffer;
  } catch (err) {
    return null;
  }
}

async function getVideoFromId(id: string): Promise<string | null> {
  const res = await fetch(`https://m.tiktok.com/api/item/detail/?itemId=${id}`, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:101.0) Gecko/20100101 Firefox/101.0',
      'authority': 'm.tiktok.com',
      'method': 'GET',
      'path': `/api/item/detail/?itemId=${id}`,
      'scheme': 'https',
      'accept': 'application/json, text/plain, */*',
      'accept-encoding': 'gzip',
      'accept-language': 'en-US,en;q=0.9',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'none',
      'sec-gpc': '1',
    }
  });

  try {
    const json = await res.json();
    if (json?.itemInfo?.itemStruct?.video?.playAddr) {
      return json?.itemInfo?.itemStruct?.video?.playAddr;
    }
    return null;
  } catch (err) {
    return null;
  }
}

async function getIdFromUrl(rawUrl: string): Promise<string | null> {
  const urls = await Util.followRedirect(rawUrl);
  const url = urls[urls.length - 1];
  if (url.includes('@') && url.includes('/video/')) {
    return url.split('/video/')[1].split('?')[0];
  }
  return null;
}
