// instagram-axios.js
import axios, { AxiosInstance } from 'axios';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import { v4 as uuidv4 } from 'uuid';
import { NextApiRequest, NextApiResponse } from 'next';

async function createInstagramClient() {
  // cookie jar menyimpan cookie otomatis
  const jar = new CookieJar();

  // axios instance dengan cookie jar & withCredentials
  const client = wrapper(axios.create({
    baseURL: 'https://www.instagram.com',
    jar, // tough-cookie jar
    withCredentials: true,
    headers: {
      'accept': '*/*',
      'accept-language': 'en-US,en;q=0.9',
      // header default minimal; nanti kita set x-csrftoken & lainnya
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'x-ig-app-id': '936619743392459', // umum dipakai Instagram web
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
                    '(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    },
    // jangan follow redirects otomatis jika butuh introspeksi; default OK
    maxRedirects: 5,
  }));

  // 1) Get homepage / profile to receive cookies including csrftoken
  //    Instagram biasanya meng-set cookie 'csrftoken' pada GET ke /
  await client.get('/'); // menyimpan cookies di jar

  // 2) Ambil csrftoken dari jar
  const cookies = await jar.getCookies('https://www.instagram.com/');
  const csrftokenCookie = cookies.find((c: { key: string; }) => c.key === 'csrftoken');
  const csrftoken = csrftokenCookie ? csrftokenCookie.value : null;

  // 3) Tentukan web session id:
  //    - Instagram kadang menerima header x-web-session-id yang dibuat client-side.
  //    - Kita bisa generate UUID per proses/session dan reuse.
  const webSessionId = uuidv4(); // bisa disimpan/reuse agar stabil selama session

  // 4) Convenience: buat axios instance khusus request API dengan header CSRF
  const apiClient = client; // reuse same client so cookies persist
  apiClient.defaults.headers.common['x-csrftoken'] = csrftoken || '';
  apiClient.defaults.headers.common['x-web-session-id'] = webSessionId;
  // optional/commonly used
  apiClient.defaults.headers.common['x-requested-with'] = 'XMLHttpRequest';
  apiClient.defaults.headers.common['referer'] = 'https://www.instagram.com/';

  return { apiClient, jar, csrftoken, webSessionId };
}

// contoh pemakaian: fetch web_profile_info
async function fetchWebProfileInfo(username: string | number | boolean) {
  const { apiClient, csrftoken, webSessionId } = await createInstagramClient();

  // build URL sama seperti fetch kamu
  const url = `/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`;

  try {
    const res = await apiClient.get(url, {
      headers: {
        // override/add header kalau perlu
        'x-csrftoken': csrftoken || '',
        'x-web-session-id': webSessionId,
        'x-ig-app-id': '936619743392459',
      },
      // axios already handles cookies from jar
    });

    return res.data;
  } catch (err: any) {
    // tangani error (403/429/dll)
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    } else {
      console.error(err.message);
    }
    throw err;
  }
}

// run example
// (async () => {
//   try {
//     const info = await fetchWebProfileInfo('arezdev');
//     console.log(JSON.stringify(info, null, 2));
//   } catch (e : any) {
//     console.error('Failed to fetch profile info:', e.message);
//   }
// })();

export default async function handler(req: { method: string; body: { user: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error?: string; data?: any; apiClient?: AxiosInstance; csrftoken?: string | null; webSessionId?: string; }): any; new(): any; }; }; }) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user } = req.body;
    if (!user) {
      return res.status(400).json({ error: 'Missing user field in request body' });
    }

    //const { apiClient, csrftoken, webSessionId } = await createInstagramClient();
    const response = await fetchWebProfileInfo(user);

    return res.status(200).json({
      data: response?.data?.user ? response.data : null,
      //apiClient,
      //csrftoken,
      //webSessionId,
    });
  } catch (error) {
    console.error('Error fetching Instagram profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};