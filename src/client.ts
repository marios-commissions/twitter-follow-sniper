import { CONSUMER_SECRET, CONSUMER_KEY } from './constants';
import { TwitterApi } from 'twitter-api-v2';
import { xauthLogin } from 'xauth-login';
import Followers from './followers';
import config from '../config.json';
import Interval from './interval';

export class Client {
  public instance: InstanceType<typeof TwitterApi>;
  public config = config;
  public started: Date;

  async connect() {
    const { oauth_token, oauth_token_secret } = await xauthLogin({
      username: this.config.sniper.username,
      password: this.config.sniper.password,
      appKey: CONSUMER_KEY,
      appSecret: CONSUMER_SECRET
    });

    this.instance = new TwitterApi({
      appKey: CONSUMER_KEY,
      appSecret: CONSUMER_SECRET,
      accessToken: oauth_token,
      accessSecret: oauth_token_secret
    });

    this.started = new Date();

    await Followers.connect();
    await Interval.loop();
  }
};

export default new Client();