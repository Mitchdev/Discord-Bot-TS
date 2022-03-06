import { Embed, Message } from 'discord.js';
import { Snowflake } from 'twitter.js';
import { twitter } from '..';
import Color from '../enums/Color';

export default async function embedTweet(message: Message, id: Snowflake) {
  const tweet = await twitter.api.tweets.fetch({ tweet: id });
  if (tweet.attachments?.mediaKeys?.length > 0 || tweet.repliedTo) {
    const files = [];
    const parent = new Embed();
    const child = new Embed()
      .setColor(Color.TWITTER_BLUE)
      .setAuthor({
        name: `${tweet.author.name} (@${tweet.author.username})`,
        url: `https://twitter.com/${tweet.author.username}/status/${tweet.id}`,
        iconURL: tweet.author.profileImageURL
      })
      .setDescription(tweet.text)
      .addFields({
        name: 'Replies',
        value: `${tweet.publicMetrics.replyCount + tweet.publicMetrics.quoteCount}`,
        inline: true
      }, {
        name: 'Retweets',
        value: `${tweet.publicMetrics.retweetCount}`,
        inline: true
      }, {
        name: 'Likes',
        value: `${tweet.publicMetrics.likeCount}`,
        inline: true
      })
      .setFooter({
        iconURL: 'https://images-ext-1.discordapp.net/external/bXJWV2Y_F3XSra_kEqIYXAAsI3m1meckfLhYuWzxIfI/https/abs.twimg.com/icons/apple-touch-icon-192x192.png',
        text: tweet.source
      })
      .setTimestamp(tweet.createdAt);

    if (tweet.repliedTo) {
      const parentTweet = await twitter.api.tweets.fetch({ tweet: tweet.repliedTo.id });
      child.setTitle(`Replying to @${parentTweet.author.username}`);
      parent.setColor(Color.TWITTER_DARKER_BLUE)
        .setAuthor({
          name: `${parentTweet.author.name} (@${parentTweet.author.username})`,
          url: `https://twitter.com/${parentTweet.author.username}/status/${parentTweet.id}`,
          iconURL: parentTweet.author.profileImageURL
        })
        .setDescription(parentTweet.text)
        .addFields({
          name: 'Replies',
          value: `${parentTweet.publicMetrics.replyCount + parentTweet.publicMetrics.quoteCount}`,
          inline: true
        }, {
          name: 'Retweets',
          value: `${parentTweet.publicMetrics.retweetCount}`,
          inline: true
        }, {
          name: 'Likes',
          value: `${parentTweet.publicMetrics.likeCount}`,
          inline: true
        })
        .setFooter({
          iconURL: 'https://images-ext-1.discordapp.net/external/bXJWV2Y_F3XSra_kEqIYXAAsI3m1meckfLhYuWzxIfI/https/abs.twimg.com/icons/apple-touch-icon-192x192.png',
          text: parentTweet.source
        })
        .setTimestamp(parentTweet.createdAt);

      if (parentTweet.attachments?.mediaKeys[0]?.startsWith('3_')) parent.setImage(parentTweet.media.get(parentTweet.attachments.mediaKeys[0]).url);
      else if (parentTweet.attachments?.mediaKeys[0]?.startsWith('16_')) parent.setImage(parentTweet.media.get(parentTweet.attachments.mediaKeys[0]).previewImageURL);
      else if (parentTweet.attachments?.mediaKeys[0]?.startsWith('7_')) {
        parent.addFields({
          name: 'Attachment Above',
          value: `${parentTweet.id}.mp4`
        });
        files.push(`https://d.fxtwitter.com/${parentTweet.author.username}/status/${parentTweet.id}.mp4`);
      }
    }

    if (tweet.attachments?.mediaKeys[0]?.startsWith('3_') && tweet.media.size > 0) child.setImage(tweet.media.get(tweet.attachments.mediaKeys[0]).url);
    else if (tweet.attachments?.mediaKeys[0]?.startsWith('16_')) child.setImage(tweet.media.get(tweet.attachments.mediaKeys[0]).previewImageURL);
    else if (tweet.attachments?.mediaKeys[0]?.startsWith('7_')) {
      child.addFields({
        name: 'Attachment Above',
        value: `${tweet.id}.mp4`
      });
      files.push(`https://d.fxtwitter.com/${tweet.author.username}/status/${tweet.id}.mp4`);
    }

    await message.reply({embeds: tweet.repliedTo ? [parent, child] : [child], files: files});
    await message.suppressEmbeds();
  }
}
