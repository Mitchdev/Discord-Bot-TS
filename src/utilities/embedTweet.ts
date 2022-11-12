import { Message } from 'discord.js';
// import fetch from 'node-fetch';
import { Snowflake } from 'twitter.js';
import { db, twitter } from '..';
// import Color from '../enums/Color';

/**
 * Replaces bad Twitter embed with custom one.
 * @param {Message} message message to remove twitter embed from and reply to with better embed.
 * @param {Snowflake} id Twitter tweet id.
 * @param {boolean} spoiler Mark the media and text as spoiler.
 * @example Util.embedTweet(message, '1138505981460193280')
 */
export default async function embedTweet(message: Message, id: Snowflake) {
  const tweet = await twitter.api.tweets.fetch({ tweet: id });
  if (tweet) {
    // const parentTweet = (tweet.repliedTo || tweet.quoted) ? await twitter.api.tweets.fetch({ tweet: tweet.repliedTo?.id ?? tweet.quoted.id }) : null;
    // const files = [];
    // const parent = new Embed();
    // const child = new Embed()
    //   .setColor(Color.TWITTER_BLUE)
    //   .setAuthor({
    //     name: `${tweet.author.name} (@${tweet.author.username})`,
    //     url: `https://twitter.com/${tweet.author.username}/status/${tweet.id}`,
    //     iconURL: tweet.author.profileImageURL
    //   })
    //   .addFields({
    //     name: 'Replies',
    //     value: Util.commaNumber(tweet.publicMetrics.replyCount + tweet.publicMetrics.quoteCount),
    //     inline: true
    //   }, {
    //     name: 'Retweets',
    //     value: Util.commaNumber(tweet.publicMetrics.retweetCount),
    //     inline: true
    //   }, {
    //     name: 'Likes',
    //     value: Util.commaNumber(tweet.publicMetrics.likeCount),
    //     inline: true
    //   })
    //   .setFooter({
    //     iconURL: 'https://images-ext-1.discordapp.net/external/bXJWV2Y_F3XSra_kEqIYXAAsI3m1meckfLhYuWzxIfI/https/abs.twimg.com/icons/apple-touch-icon-192x192.png',
    //     text: tweet.source
    //   })
    //   .setTimestamp(tweet.createdAt);

    // const body = await cleanTweet(tweet.text, `https://twitter.com/${tweet.author.username}/status/${tweet.id}`, parentTweet ? `https://twitter.com/${parentTweet.author.username}/status/${parentTweet.id}` : null);
    // if (body !== '') child.setDescription(body);

    // if (parentTweet) {
    //   child.setTitle(`Replying to @${parentTweet.author.username}`);
    //   parent.setColor(Color.TWITTER_DARKER_BLUE)
    //     .setAuthor({
    //       name: `${parentTweet.author.name} (@${parentTweet.author.username})`,
    //       url: `https://twitter.com/${parentTweet.author.username}/status/${parentTweet.id}`,
    //       iconURL: parentTweet.author.profileImageURL
    //     })
    //     .addFields({
    //       name: 'Replies',
    //       value: Util.commaNumber(parentTweet.publicMetrics.replyCount + parentTweet.publicMetrics.quoteCount),
    //       inline: true
    //     }, {
    //       name: 'Retweets',
    //       value: Util.commaNumber(parentTweet.publicMetrics.retweetCount),
    //       inline: true
    //     }, {
    //       name: 'Likes',
    //       value: Util.commaNumber(parentTweet.publicMetrics.likeCount),
    //       inline: true
    //     })
    //     .setFooter({
    //       iconURL: 'https://images-ext-1.discordapp.net/external/bXJWV2Y_F3XSra_kEqIYXAAsI3m1meckfLhYuWzxIfI/https/abs.twimg.com/icons/apple-touch-icon-192x192.png',
    //       text: parentTweet.source
    //     })
    //     .setTimestamp(parentTweet.createdAt);

    //   const parentBody = await cleanTweet(parentTweet.text, `https://twitter.com/${parentTweet.author.username}/status/${parentTweet.id}`);
    //   if (parentBody !== '') parent.setDescription(parentBody);

    //   if (parentTweet.attachments?.mediaKeys[0]?.startsWith('3_')) parent.setImage(parentTweet.media.get(parentTweet.attachments.mediaKeys[0]).url);
    //   else if (parentTweet.attachments?.mediaKeys[0]?.startsWith('16_')) parent.setImage(parentTweet.media.get(parentTweet.attachments.mediaKeys[0]).previewImageURL);
    //   else if (parentTweet.attachments?.mediaKeys[0]?.startsWith('7_')) {
    //     parent.addFields({ name: 'Attachment Above', value: `${parentTweet.id}.mp4`, inline: true });
    //     files.push(`https://d.fxtwitter.com/${parentTweet.author.username}/status/${parentTweet.id}.mp4`);
    //   }

    //   if (parentTweet.attachments?.mediaKeys?.length > 1) {
    //     parent.addFields({ name: '\u200B', value: `[Click to see ${parentTweet.attachments?.mediaKeys.length - 1} more attachments](https://twitter.com/${parentTweet.author.username}/status/${parentTweet.id})`, inline: true });
    //   }
    // }

    // if (tweet.attachments?.mediaKeys[0]?.startsWith('3_')) child.setImage(tweet.media.get(tweet.attachments.mediaKeys[0]).url);
    // else if (tweet.attachments?.mediaKeys[0]?.startsWith('16_')) child.setImage(tweet.media.get(tweet.attachments.mediaKeys[0]).previewImageURL);
    // else if (tweet.attachments?.mediaKeys[0]?.startsWith('7_')) {
    //   child.addFields({ name: 'Attachment Above', value: `${tweet.id}.mp4`, inline: true });
    //   files.push(`https://d.fxtwitter.com/${tweet.author.username}/status/${tweet.id}.mp4`);
    // }

    // if (tweet.attachments?.mediaKeys?.length > 1) {
    //   child.addFields({ name: '\u200B', value: `[Click to see ${tweet.attachments?.mediaKeys.length - 1} more attachments](https://twitter.com/${tweet.author.username}/status/${tweet.id})`, inline: true });
    // }

    if (tweet.attachments?.mediaKeys[0]?.startsWith('7_') || tweet.attachments?.mediaKeys[0]?.startsWith('13_')) {
      const botMessage = await message.reply({files: [`https://d.vxtwitter.com/${tweet.author.username}/status/${tweet.id}.mp4`]});
      await db.embededTweets.build({
        channel_id: message.channel.id,
        message_id: message.id,
        bot_message_id: botMessage.id
      }).save();
    }
  }

  // if (botMessage) {
  //   if (recycled) await botMessage.react('♻️');
  //   await message.suppressEmbeds();
  //   await db.embededTweets.build({
  //     channel_id: message.channel.id,
  //     message_id: message.id,
  //     bot_message_id: botMessage.id
  //   }).save();
  // }
}

// async function cleanTweet(body: string, tweetUrl: string, parentTweetUrl: string = null): Promise<string> {
//   body = body.replaceAll(new RegExp(/@(\w{1,15})\b/, 'gmi'), (user) => `[${user}](https://twitter.com/${user.replace('@', '')})`); // users
//   body = body.replaceAll(new RegExp(/(?!\s)#[A-Za-z]\w*\b/, 'gmi'), (hashtag) => `[${hashtag}](https://twitter.com/hashtag/${hashtag.replace('#', '')})`); // hashtag
//   body = body.replaceAll(new RegExp(/(?!\s)\$[A-Za-z]\w*\b/, 'gmi'), (cashtag) => `[${cashtag}](https://twitter.com/search?q=${cashtag.replace('$', '%24')})`); // cashtags
//   const urls = [...body.matchAll(new RegExp(/((?:http|https):\/\/t.co\/(?:\S*|(?:.+?)$))/, 'gmi'))].map((match) => match[1]); // urls
//   if (urls.length > 0) {
//     return new Promise((resolve) => {
//       urls.forEach(async (url, index) => {
//         const redirect = await fetch(url, { redirect: 'manual' });
//         if (redirect.headers.get('location')?.startsWith(tweetUrl) || redirect.headers.get('location')?.startsWith(parentTweetUrl)) body = body.replace(url, '');
//         else body = body.replace(url, redirect.headers.get('location'));
//         if (index === urls.length - 1) resolve(body);
//       });
//     });
//   } else return body;
// }
