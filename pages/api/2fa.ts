// app/api/totp/generate/route.ts
import { NextApiRequest, NextApiResponse } from "next";
import speakeasy from "speakeasy";

export default async function POST(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { secret } = req.query;

    if (!secret) {
        return res.status(200).json({ status: false, message: "missing query" });
    }

    // Ensure we have a single string (req.query can be string | string[])
    const secretStr = Array.isArray(secret) ? secret[0] : secret;

    if (!secretStr) {
        return res.status(200).json({ status: false, message: "missing query" });
    }

    const otp = speakeasy.totp({
        secret: secretStr,         // Base32 secret
        encoding: "base32",
        digits: 6,      // Jumlah digit kode
        step: 30,       // Interval waktu 30 detik
    });

    // Hitung waktu tersisa sampai kode reset
    const epoch = Math.floor(Date.now() / 1000);
    const step = 30;
    const remaining = step - (epoch % step);

    const data = {
        otp,
        remaining
    }

    return res.status(200).json({ status: true, data });
}
