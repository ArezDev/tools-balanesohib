import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    
    const uid = typeof req.query.uid === "string" ? req.query.uid : Array.isArray(req.query.uid) ? req.query.uid[0] : "";
    const pass = typeof req.query.pass === "string" ? req.query.pass : Array.isArray(req.query.pass) ? req.query.pass[0] : "";
    const app = typeof req.query.app === "string" ? req.query.app : Array.isArray(req.query.app) ? req.query.app[0] : "";
    
    //const pass = decodeURIComponent(passRaw);

    if (!uid || !pass || !app) {
      return res.status(400).json({ error: "Missing query" });
    }

    const appType = 
    app === 'android' ? '350685531728|62f8ce9f74b12f84c123cc23437a4a32' :
    app === 'ios' ? '6628568379|c1e620fa708a1d5696fb991c1bde5662' :
    app === 'ads_android' ? '438142079694454|fc0a7caa49b192f64f6f5a6d9643bb28' :
    app === 'ads_ios' ? '1479723375646806|afb3e4a6d8b868314cc843c21eebc6ae' :
    null;

    const l = await axios.post('https://graph.facebook.com/v6.0/auth/login/',
        {
            access_token: appType,
            email: uid,
            password: pass,
            format: 'json',
            generate_session_cookies: 1,
            locale: 'id_ID'
        }
    );

    if (l.data.error) {
      return res.status(400).json({ error: l.data.error });
    }
    
    const user = l?.data;
    const kuki = user.session_cookies;
    const cookieString = kuki.map((cokise: { name: any; value: any; }) => `${cokise.name}=${cokise.value};`).join(' ');

    return res.status(200).json({ 
        //data: user,
        uid: user.uid,
        access_token: user.access_token,
        cookie:  cookieString
    });

  } catch (error: any) {
    console.error(`Error login UID ${JSON.stringify(req.query)}:`, error.message);
    return res.status(500).json({ 
      error: 'Failed to fetch data from Facebook.',
      msg: error.message,
    });
  }
}