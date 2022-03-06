import { Client as Twitter } from 'twitter.js';

export default class TwitterClient {

  api: Twitter = null;

  constructor() {
    this.api = new Twitter();
    this.login();
  }

  async login() {
    await this.api.loginWithBearerToken(process.env.TWITTER_API_TOKEN);
  }
}
