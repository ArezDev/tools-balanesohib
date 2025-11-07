import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Tokenizer untuk mendapatkan token EAAB melalui alur OAuth Instagram.
 * Token ini biasanya digunakan untuk aplikasi pihak ketiga.
 */
class InstagramOAuthTokenizer {

  session: any;
  cookies: any;

  constructor(cookies: any) {
    this.cookies = cookies;
    this.session = axios.create({
      baseURL: 'https://www.facebook.com',
      timeout: 30000,
      headers: {
        'Origin': 'https://www.instagram.com',
        'Accept-Language': 'id,en;q=0.9',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
        'Referer': 'https://www.instagram.com/',
        'Host': 'www.facebook.com',
        'Sec-Fetch-Mode': 'cors',
        'Accept': '*/*',
        'Connection': 'keep-alive',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-Fetch-Dest': 'empty',
        'Accept-Encoding': 'gzip, deflate',
        'Cookie': cookies || ''
      }
    });
  }

  /**
   * Mengambil token dari alur otentikasi OAuth.
   * @returns {Promise<{data: any, access_token: any} | {error: string, message?: string} | {error: string, data: any}>} Token data jika ditemukan.
   */
  async getToken(): 
    Promise<{data: any, access_token: any} | {error: string, message?: string} | {error: string, ig: any}> 
  {

    const params = {
      client_id: '124024574287414',
      wants_cookie_data: 'true',
      origin: '1',
      input_token: '',
      sdk: 'joey',
      redirect_uri: 'https://www.instagram.com/'
    };
    let response = null;

    try {
        /**
         * Fetch API facebook
         */
        response = await this.session.get('/x/oauth/status', { params });

        /**
         * Cek apakah ada access_token di headers
         */
        if (response.headers['fb-s'] === 'not_authorized') {

            return { error: 'Belum terhubung instagram', ig: response.headers['fb-s'] };

        } else if (response.headers['fb-ar']) {

            const findToken = JSON.parse(response.headers['fb-ar']);

            return {
                data: findToken, 
                access_token: findToken.access_token,
                ig: response.headers['fb-s']
            };
            
        }
    } catch (error: any) {
      //console.error('[ERROR] Permintaan HTTP gagal:', error.message);
      return { error: error.message, message: 'fb-ar tidak ditemukan' };
    }

    // Pastikan selalu mengembalikan nilai agar semua jalur mengembalikan sesuatu
    return { error: 'Token tidak ditemukan', data: response ? response.headers : null };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { cookie } = req.query;

    if (!cookie) {
      return res.status(400).json({ error: "Missing query" });
    }

    const tokenizer = new InstagramOAuthTokenizer(cookie);

    return res.status(200).json({ data: await tokenizer.getToken() });

  } catch (error: any) {
    //console.error(`Error login UID ${JSON.stringify(req.query)}:`, error.message);
    return res.status(500).json({ 
      error: 'Failed to fetch data from Facebook.',
      msg: error.message,
    });
  }
}