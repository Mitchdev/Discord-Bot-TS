import fetch from 'node-fetch';

/**
 * Get all the redirects from a url.
 * @param {string} url original url.
 * @param {string[]} history history of urls redirected.
 * @returns {string[]} returns all urls redirected.
 * @example Util.embedTweet('https://bit.ly/example'): ['https://bit.ly/example', 'https://example.com']
 */
export default async function followRedirect(url: string, history: string[] = []): Promise<string[]> {
  history.push(url);
  const response = await fetch(url, { redirect: 'manual' });
  if (response.headers.get('location')) return followRedirect(response.headers.get('location'), history);
  else return history;
}
