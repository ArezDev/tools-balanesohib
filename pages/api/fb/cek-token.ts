import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { accessToken } = req.query;

    if (!accessToken) {
      return res.status(400).json({ error: "Missing uid or accessToken" });
    }

    const response = await axios.get(`https://graph.facebook.com/me`, {
      params: {
        access_token: accessToken,
        fields: 'id'
      },
    });

    if (response.data.error) {
      return res.status(400).json({ error: response.data.error });
    }

    return res.status(200).json({ valid: true, userId: response.data.id });

  } catch (error: any) {
    return res.status(500).json({ 
      valid: false, 
      message: error.response?.data?.error?.message || 'Invalid token'
    });
  }
}