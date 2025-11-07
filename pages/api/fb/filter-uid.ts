import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { uid, accessToken } = req.query;

    if (!uid || !accessToken) {
      return res.status(400).json({ error: "Missing uid or accessToken" });
    }

    const response = await axios.get(`https://graph.facebook.com/${uid}`, {
      params: {
        access_token: accessToken,
      },
    });

    if (response.data.error) {
      return res.status(400).json({ error: response.data.error });
    }

    return res.status(200).json({ grab: response.data });

  } catch (error: any) {
    console.error(`Error fetching UID ${JSON.stringify(req.query)}:`, error.message);
    return res.status(500).json({ 
      error: 'Failed to fetch data from Facebook.',
      msg: error.message,
    });
  }
}