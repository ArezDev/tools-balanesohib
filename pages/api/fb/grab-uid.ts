import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { uid, accessToken } = await req.body;

    //friends{id,gender,location{location{country_code}}}
    const response = await axios.get(`https://graph.facebook.com/${uid}`, {
      params: {
        fields: 'friends{id,gender,location{location{country_code}}}',
        access_token: accessToken,
      },
    });

    return res.status(200).json({ data: response.data });

  } catch (error: any) {
    //console.error(`Error fetching UID ${req.url}:`, error.message);
    return res.status(500).json({ 
        error: 'Failed to fetch uid data from Facebook.',
        message: error.message,
        data: error.response.data
    });
  }
}