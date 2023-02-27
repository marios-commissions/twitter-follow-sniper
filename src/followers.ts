import { CONSUMER_KEY, CONSUMER_SECRET } from './constants';
import { TwitterApi } from 'twitter-api-v2';
import { xauthLogin } from 'xauth-login';
import client from './client';

interface Client extends TwitterApi {
  username: string;
}

class Followers {
  public instances: Client[] = [];

  async connect() {
    for (const account of client.config.followers) {
      try {
        const { oauth_token, oauth_token_secret } = await xauthLogin({
          username: account.username,
          password: account.password,
          appKey: CONSUMER_KEY,
          appSecret: CONSUMER_SECRET
        });

        if (oauth_token && oauth_token_secret) {
          console.log(`Logged in with follower account "${account.username}"`);
        }

        const instance = new TwitterApi({
          appKey: CONSUMER_KEY,
          appSecret: CONSUMER_SECRET,
          accessToken: oauth_token,
          accessSecret: oauth_token_secret
        }) as Client;

        instance.username = account.username;

        this.instances.push(instance);
      } catch (e) {
        console.error(`Failed to login with account "${account.username}", skipping it.`, e);
      }
    }
  }
}

export default new Followers();