import { ApiResponseError } from 'twitter-api-v2';
import sleep from './sleep';

async function request<T>(callback: () => T | Promise<T>) {
  while (true) {
    try {
      return await callback();
    } catch (error) {
      if (error instanceof ApiResponseError && error.rateLimitError && error.rateLimit) {
        const ms = error.rateLimit.reset * 1000;
        const timeout = ms - Date.now();

        await sleep(timeout);
        continue;
      }

      throw error;
    }
  }
}

export default request;