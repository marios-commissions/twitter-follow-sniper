import getUsers from './actions/getUsers';
import { UserV1 } from 'twitter-api-v2';
import request from './actions/request';
import followers from './followers';
import client from './client';
import moment from 'moment';

class Interval {
  public followed = new Map();
  public timeout: number;
  public me: UserV1;

  async loop() {
    if (!this.me) {
      await request(async () => this.me = await client.instance.currentUser());
    }

    if (this.timeout && (this.timeout - moment().unix() > 0)) {
      const ms = (this.timeout - moment().unix()) * 100;
      console.log(`Waiting ${ms}ms for timeout to expire...`);
      await new Promise(r => setTimeout(r, ms));
    }

    this.check();
  }

  async check() {
    const timeout = moment();

    timeout.add(client.config.delay * 10, 'milliseconds');

    this.timeout = timeout.unix();

    console.log('Checking if accounts are protected...');
    const users = await getUsers(...client.config.accounts);
    if (!users?.length) return this.loop();

    for (const user of users.filter(u => !u.protected)) {
      console.log(`Detected "${user.screen_name}" as a non-protected account. Attempting to follow.`);

      for (const follower of followers.instances) {
        const { screen_name } = await follower.currentUser();

        try {
          await request(async () => await follower.v1.createFriendship({ follow: true, screen_name: user.screen_name }));
          console.log(`Successfully followed "${user.screen_name}" with "${screen_name}"`);

          const followed = this.followed.get(screen_name) ?? [];
          followed.push(user.screen_name);

          this.followed.set(screen_name, followed);
        } catch (e) {
          console.error(`Failed to follow "${user.screen_name}" with account "${screen_name}":`, e.message);
        }
      }

      if (followers.instances.every(i => client.config.accounts.every(acc => ~(this.followed.get(i.username) ?? []).indexOf(acc)))) {
        console.log(`!!!!!! Account ${user.screen_name} has been followerd by all accounts, removing it from the list !!!!!!`);

        const idx = client.config.accounts.indexOf(user.screen_name);
        if (idx > -1) client.config.accounts.splice(idx, 1);
      }
    }

    if (client.config.accounts.length) {
      this.loop();
    } else {
      console.log('!!!!!! FINISHED FOLLOWING ALL ACCOUNTS WITH ALL ALTS, EXITING !!!!!!');
      process.exit();
    }
  }
};

export default new Interval();