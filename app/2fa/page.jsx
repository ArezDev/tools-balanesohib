"use client";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Page() {
  const [secret, setSecret] = useState("");
  const [token, setToken] = useState("");
  const [remaining, setRemaining] = useState(0);
  const [copied, setCopied] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Fetch kode TOTP setiap detik
  useEffect(() => {
    if (!secret) return;

    const fetchCode = async () => {
      try {
        const res = await axios.get(`/api/2fa?secret=${secret}`);
        const data = res?.data?.data;
        if (!res?.data?.status) return;
        setToken(data?.otp);
        setRemaining(data?.remaining);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCode();
    const interval = setInterval(fetchCode, 1000);
    return () => clearInterval(interval);
  }, [secret]);

  // Fungsi salin ke clipboard
  const handleCopy = async () => {
    if (!token) return;
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Toggle light/dark mode
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <main
      className={`min-h-screen flex flex-col justify-between p-6 ${
        darkMode
          ? "bg-linear-to-b from-gray-950 via-gray-900 to-black text-gray-100"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Dark&Light Button Mode */}
      <div className="fixed top-4 right-4">
        <button
          onClick={toggleDarkMode}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-900 border-gray-600 dark:border-gray-300 hover:ring-2 hover:ring-indigo-500 transition-all duration-300"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? (
            // Moon Icon SVG
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"
              />
            </svg>
          ) : (
            // Sun Icon SVG
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M6.05 17.95l-1.414 1.414M17.95 17.95l-1.414-1.414M6.05 6.05L4.636 4.636M12 8a4 4 0 100 8 4 4 0 000-8z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Konten Utama */}
      <div className="flex flex-col items-center justify-center grow w-full max-w-md mx-auto space-y-6">
        <h1 className="text-center text-2xl font-bold tracking-tight">
          Get Two-Factor Authenticator Online
        </h1>

        {/* Input Secret */}
        <div
          className={`${
            darkMode
              ? "bg-gray-800/60 border-gray-700"
              : "bg-gray-200/60 border-gray-300"
          } border rounded-xl p-6 shadow-lg backdrop-blur w-full`}
        >
          <label
            className={`${
              darkMode ? "text-gray-300" : "text-gray-700"
            } block text-sm mb-2`}
          >
            Masukan kode 2FA
          </label>
          <input
            type="text"
            placeholder="..."
            value={secret}
            onChange={(e) => setSecret(e.target.value.replace(/\s+/g, ""))}
            className={`${
              darkMode
                ? "bg-gray-900 text-gray-100 border-gray-700 focus:ring-indigo-500"
                : "bg-white text-gray-900 border-gray-300 focus:ring-indigo-500"
            } w-full p-3 rounded-lg border focus:outline-none focus:ring-2 transition`}
          />
        </div>

        {/* Kode OTP */}
        {secret && (
          <div className="text-center space-y-4 mt-6 relative w-full">
            <p
              className={`${
                darkMode ? "text-gray-400" : "text-gray-600"
              } text-sm`}
            >
              Kode OTP saat ini:
            </p>

            {/* OTP Code */}
            <div
              onClick={handleCopy}
              className="cursor-pointer text-6xl font-mono font-bold tracking-widest text-indigo-400 drop-shadow-sm select-all hover:scale-105 transition-transform active:scale-95"
              title="Klik untuk menyalin kode"
            >
              {token || "------"}
            </div>

            {/* Notifikasi Copied */}
            {copied && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-1 text-sm text-green-400 animate-fade-in-up">
                ✅ Copied!
              </div>
            )}

            {/* Progress bar */}
            <div
              className={`${
                darkMode ? "bg-gray-800" : "bg-gray-300"
              } relative w-full h-2 rounded-full overflow-hidden mt-4`}
            >
              <div
                className="absolute left-0 top-0 h-full bg-indigo-500 transition-all duration-1000 ease-linear"
                style={{ width: `${(remaining / 30) * 100}%` }}
              ></div>
            </div>

            <p
              className={`${
                darkMode ? "text-gray-400" : "text-gray-600"
              } text-sm`}
            >
              Berganti dalam{" "}
              <span className="font-semibold text-indigo-400">{remaining}s</span>
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer
        className={`${
          darkMode ? "text-gray-500" : "text-gray-600"
        } text-center text-sm mt-8 pb-4`}
      >
        Powered by <span className="font-semibold text-indigo-400">BALANE SØHÏB</span>
      </footer>

      {/* Animasi */}
      <style jsx global>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}
