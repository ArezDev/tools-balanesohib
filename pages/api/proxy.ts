import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const imageUrl = req.query.url;

  if (!imageUrl || typeof imageUrl !== "string") {
    return res.status(400).send("Missing URL");
  }

  try {
    // Fetch gambar dari sumber eksternal
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const contentType = response.headers["content-type"] || "image/jpeg";

    // Set header & kirim data biner
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400"); // cache 1 hari
    res.status(200).send(response.data);
  } catch (err: any) {
    console.error("Proxy error:", err.message);
    res.status(500).send("Proxy failed");
  }
}