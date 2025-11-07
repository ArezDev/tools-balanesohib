// file: api/cek.ts
import axios from 'axios';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import { v4 as uuidv4 } from 'uuid';
import { NextApiRequest, NextApiResponse } from 'next';

async function createInstagramClient() {
  const jar = new CookieJar();
  const randomUAver = Math.floor(Math.random() * (140 - 130 + 1)) + 130;
  const client = wrapper(axios.create({
    baseURL: 'https://www.instagram.com',
    jar,
    withCredentials: true,
    headers: {
      'accept': '*/*',
      'accept-language': 'id-ID,en;q=0.9',
      'x-ig-app-id': '936619743392459',
      'user-agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${randomUAver}.0.0.0 Safari/537.36`,
      'referer': 'https://www.instagram.com/',
    },
    timeout: 10000, // penting di server
    maxRedirects: 3,
    validateStatus: () => true, // supaya bisa tangkap error non-200
  }));

  // Request homepage untuk dapat csrftoken
  const home = await client.get('/');
  if (home.status !== 200) {
    throw new Error(`Failed to load Instagram homepage (status ${home.status})`);
  }

  const cookies = await jar.getCookies('https://www.instagram.com/');
  const csrftoken = cookies.find(c => c.key === 'csrftoken')?.value || '';
  const webSessionId = uuidv4();

  client.defaults.headers.common['x-csrftoken'] = csrftoken;
  client.defaults.headers.common['x-web-session-id'] = webSessionId;
  client.defaults.headers.common['x-requested-with'] = 'XMLHttpRequest';

  return { client, csrftoken, webSessionId };
}

async function fetchWebProfileInfo(username: string) {
  const { client } = await createInstagramClient();
  const url = `/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`;

  const res = await client.get(url);

  if (res.status === 404) {
    return { error: 'User not found' };
  }
  if (res.status !== 200) {
    throw new Error(`Instagram API error: ${res.status}`);
  }

  return res.data;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // if (req.method !== 'POST') {
  //   return res.status(405).json({ error: 'Method not allowed' });
  // }
  if (req.method === 'GET') {
    try {
      const { username } = req.query;

      if (!username) {
        return res.status(400).json({ error: 'Missing user field' });
      }

      const usernameStr = Array.isArray(username) ? username[0] : username;
      const data = await fetchWebProfileInfo(usernameStr);

      if (data.error) {
        return res.status(404).json({ error: data.error });
      }

      return res.status(200).json({ data: data.data ? data.data : null });
    } catch (error: any) {
      console.error('❌ [Instagram Error]', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      }
      return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { user } = req.body;
      if (!user) {
        return res.status(400).json({ error: 'Missing user field' });
      }

      const data = await fetchWebProfileInfo(user);

      if (data.error) {
        return res.status(404).json({ error: data.error });
      }

      return res.status(200).json({ data: data.data?.user ? data.data : null });
    } catch (error: any) {
      console.error('❌ [Instagram Error]', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      }
      return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }
  return res.status(405).json({ error: 'Method not allowed' });
}