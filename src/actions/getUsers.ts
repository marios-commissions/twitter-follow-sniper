import request from './request';
import Client from '../client';

export default async function (...usernames: string[]) {
  return request(() => Client.instance.v1.users({ screen_name: usernames }));
}