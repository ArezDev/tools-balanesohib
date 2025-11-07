import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

// Normalisasi nama kota (hilangkan spasi, lowercase)
function normalizeCity(name: string) {
  return name.toLowerCase().replace(/\s+/g, "");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!req.url) {
    return res.status(400).json({ error: "Invalid URL" });
  }
  const city = Array.isArray(req.query.kota) ? req.query.kota[0] : req.query.kota;

  if (!city) {
    return res.status(400).json({ error: "Missing city query" });
  }

  try {
    const filePath = path.join(process.cwd(), "data", "GeoLite2-City-Locations-en.csv");
    const csvData = fs.readFileSync(filePath, "utf-8");

    const lines = csvData.split("\n").slice(1); // skip header
    const normalizedQuery = normalizeCity(city);

    const matches: { city: string; countries: string[] }[] = [];

    for (const line of lines) {
      const cols = line.split(",");
      const geoId = cols[0];
      const countryIsoCode = cols[4];
      const cityName = cols[10];

      if (cityName && normalizeCity(cityName) === normalizedQuery) {
        let match = matches.find((m) => m.city === cityName);
        if (!match) {
          match = { city: cityName, countries: [] };
          matches.push(match);
        }
        if (countryIsoCode && !match.countries.includes(countryIsoCode)) {
          match.countries.push(countryIsoCode);
        }
      }
    }

    return res.status(200).json(matches[0]);
  } catch (err) {
    return res.status(500).json({ error: "Failed to read GeoLite2 CSV", details: String(err) });
  }
}