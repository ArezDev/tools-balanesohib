import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

async function fetchFbUserInfo(cookieString: any) {

    try {
        const myHeaders = new Headers();
        myHeaders.append("Cookie", "sb=x1RAW44jG5edHtmQVVTddobS;datr=vVRAW1yi3AS6gZWcf1LhnTMr;dpr=0.75;c_user=100027437070189;ps_l=1;ps_n=1;ar_debug=1;presence=C%7B%22t3%22%3A%5B%5D%2C%22utc3%22%3A1762525077927%2C%22v%22%3A1%7D;wd=833x733;xs=5%3A7NXrjzXc7ePkgw%3A2%3A1762373357%3A-1%3A-1%3A%3AAcy6isBe6N2hLxnHA93lKfEO7t7ymhPJRWHiaHch2MU;fr=1BwZAKBk4gTx0rvs2.AWdZ174M6S8MAk4ZUEwEFD30o6lm6QnG19m54opoJGR81lNaiWs.BpDgIC..AAA.0.0.BpDgOK.AWfshKiu1YGY6iHTAK7izVSAN3k;");
        myHeaders.append("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36");

        const requestOptions = {
            method: "GET",
            headers: myHeaders
        };

        const respons = await fetch("https://www.facebook.com/ig_xsite_user_info/", requestOptions);
        return await respons.text();
    } catch (error: any) {
        return error.message;
    }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const cookie = Array.isArray(req.query.cookie)
      ? req.query.cookie.join('; ')
      : req.query.cookie;

    if (!cookie || typeof cookie !== 'string') {
      return res.status(400).json({ error: 'Missing query parameter: cookie' });
    }

    const myHeaders = new Headers();
        myHeaders.append("Cookie", "sb=x1RAW44jG5edHtmQVVTddobS;datr=vVRAW1yi3AS6gZWcf1LhnTMr;dpr=0.75;c_user=100027437070189;ps_l=1;ps_n=1;ar_debug=1;presence=C%7B%22t3%22%3A%5B%5D%2C%22utc3%22%3A1762525077927%2C%22v%22%3A1%7D;wd=833x733;xs=5%3A7NXrjzXc7ePkgw%3A2%3A1762373357%3A-1%3A-1%3A%3AAcy6isBe6N2hLxnHA93lKfEO7t7ymhPJRWHiaHch2MU;fr=1BwZAKBk4gTx0rvs2.AWdZ174M6S8MAk4ZUEwEFD30o6lm6QnG19m54opoJGR81lNaiWs.BpDgIC..AAA.0.0.BpDgOK.AWfshKiu1YGY6iHTAK7izVSAN3k;");
        //myHeaders.append("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36");

    const requestOptions = {
        method: "POST",
        headers: myHeaders
    };
    
    fetch("https://www.facebook.com/api/graphql/", requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.error(error));

    return res.status(200).json({  });

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: error.response?.data?.error?.message || 'Failed akun',
    });
  }
}