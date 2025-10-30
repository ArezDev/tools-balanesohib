import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import fs from "fs";
import path from "path";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const imageUrl = req.query.url;

  if (!imageUrl || typeof imageUrl !== "string") {
    return res.status(400).send("Missing URL");
  }

  try {
    // fetch image eksternal dengan timeout 5 detik
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 5000,
      maxContentLength: 5 * 1024 * 1024, // max 5MB
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ImageProxy/1.0)",
      },
      validateStatus: (status) => status < 500, // biar 4xx tetap diterima
    });

    if (response.status !== 200) throw new Error("Image fetch failed");

    const contentType = response.headers["content-type"] || "image/jpeg";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400"); // 1 hari
    return res.status(200).send(response.data);
  } catch (err) {
    console.error("Proxy error:", (err as Error).message);

    // fallback ke image lokal
    const fallbackPath = path.join(process.cwd(), "public", "fallback.jpg");
    try {
      const fallback = fs.readFileSync(fallbackPath);
      res.setHeader("Content-Type", "image/jpeg");
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.status(200).send(fallback);
    } catch {
      // kalau fallback juga gagal
      return res.status(500).send("Proxy failed and fallback missing");
    }
  }
}