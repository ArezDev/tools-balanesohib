'use client';

import { LogOut, Sun, Moon, UserCircle } from "lucide-react";
import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

type Friend = {
  id: string;
  gender?: string;
  location?: {
    name?: string;
  };
  // location?: {
  //   location?: {
  //     country_code?: string;
  //   };
  // };
};

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [accessTokensText, setAccessTokensText] = useState('');
  const [uidsText, setUidsText] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [resultText, setResultText] = useState('');
  const [loading, setLoading] = useState(false);
  const [friendCount, setFriendCount] = useState(0);
  const [validCount, setValidCount] = useState(0);
  const [invalidCount, setInvalidCount] = useState(0);

  const BATCH_SIZE = 1;

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  /**
   * Cek access_token fb
   * 
   * @param tokens - validasi semua token dan return token pertama yang valid
   * @returns 
   */
  const validateTokens = async (tokens: string[]) => {
  let validToken = null;
  let valid = 0;
  let invalid = 0;

  for (const token of tokens) {
    try {
      const res = await axios.get("/api/fb/cek-token",{
        params: {accessToken: token}
      });
      if (res.data.valid) {
        valid++;
        if (!validToken) validToken = token; // first valid token
      } else {
        invalid++;
      }
    } catch {
      invalid++;
    }
  }

  setValidCount(valid);
  setInvalidCount(invalid);

  return validToken;
  };

  // Cache lokal biar ga bolak-balik request server
  const cityCache: Record<string, string[]> = {};
  /**
   * 
   * @param cityName - Nama Kota 
   * @returns 
   */
  async function getCountriesByCity(cityName: string): Promise<string[]> {
    if (cityCache[cityName]) {
      return cityCache[cityName]; // kalau udah ada di cache, langsung return
    }

    try {
      const res = await axios.get(`/api/fb/filter-city?kota=${encodeURIComponent(cityName)}`);
      const countries = res.data?.countries[0] || [];
      console.log("CITY LOOKUP:", cityName, "→", countries); // 🔍 debug
      cityCache[cityName] = countries; // simpan ke cache
      return countries;
    } catch {
      cityCache[cityName] = []; // simpan kosong biar next time ga request lagi
      return [];
    }
  }

  /**
   * Filter UID Facebook
   */
  const filterUID = async () => {
    setLoading(true);
    setResultText('');
    setFriendCount(0);
    setProgress(0);
    setProgressMessage('');

    try {
      const tokens = accessTokensText
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean);

      const validToken = await validateTokens(tokens);
      if (!validToken) {
        setResultText('❌ No valid access token found.');
        setLoading(false);
        return;
      }

      const uids = uidsText.split('\n').map((uid) => uid.trim()).filter(Boolean);
      const totalUIDs = uids.length;
      let processedUIDs = 0;

      const collectedUIDs: string[] = [];

      for (let i = 0; i < totalUIDs; i += BATCH_SIZE) {
        const batch = uids.slice(i, i + BATCH_SIZE);

        const results = await Promise.all(
          batch.map((uid) =>
            axios
              .get('/api/fb/filter-uid', {
                params: { uid, accessToken: validToken },
              })
              .then((res) => ({ status: 'fulfilled' as const, data: res.data, uid }))
              .catch((error) => ({ status: 'rejected' as const, error, uid }))
          )
        );

          for (const result of results) {
              processedUIDs++;
              setProgressMessage(`Filter ${processedUIDs} of ${totalUIDs} UID...`);
              setProgress(Math.round((processedUIDs / totalUIDs) * 100));

              if (result.status === "fulfilled") {
                  const grab = result.data?.grab;
                  if (!grab) continue; // skip kalau kosong

                  const matchGender =
                  genderFilter.toLowerCase() === "all" || genderFilter === ""
                      ? true
                      : grab.gender === genderFilter;

                  let matchCountry = false;

                  // kalau filter kosong atau 'all' → wajib ada lokasi
                  if (countryFilter.toLowerCase() === "all" || countryFilter === "") {
                  matchCountry = !!grab.location?.name;
                  } 
                  else if (grab.location?.name) {
                  const cityName = grab.location.name.split(",")[0];
                  const countries = await getCountriesByCity(cityName);
                  matchCountry = countries.includes(countryFilter.toUpperCase());
                  }

                  if (matchGender && matchCountry) {
                  collectedUIDs.push(grab.id);
                  setResultText((prev) => prev + grab.id + "\n");
                  setFriendCount(collectedUIDs.length);
                  }
              }
          }

      }

      setFriendCount(collectedUIDs.length);
      setProgress(100);
    } catch (err) {
      console.error('Error filtering UIDs:', err);
      setResultText('❌ Terjadi kesalahan saat filter UID.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Download UID Facebook
   */
  const handleDownload = () => {
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
    const timeStr = `${String(today.getHours()).padStart(2, '0')}-${String(today.getMinutes()).padStart(2, '0')}-${String(today.getSeconds()).padStart(2, '0')}`;
    const countryCode = countryFilter?.toUpperCase() || 'ALL';
    const genderCode = genderFilter?.toUpperCase() || 'ALL';
    const filename = `${countryCode}-${genderCode}-${dateStr}:${timeStr}.txt`;

    const blob = new Blob([resultText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };


  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-600 rounded-lg shadow-lg p-6 bg-center bg-cover bg-no-repeat">

      <h1 className="text-2xl font-mono mb-5 text-center dark:text-white text-blue-500">Filter UID Facebook</h1>

      {/* Dark Light Switch Theme */}
        <div className="absolute top-4 right-4">
        <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle Dark Mode"
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {darkMode ? <Sun className="text-yellow-400" /> : <Moon className="text-gray-600" />}
          </button>
      </div>

      {/* Access Tokens */}
      <div className="mb-2">
        <label className="block mb-2 font-medium">
          Access Tokens (hidup: {validCount} / mati: {invalidCount} - total: {validCount + invalidCount})
        </label>
        <textarea
          className="w-full p-3 border border-gray-300 dark:bg-gray-700 dark:text-white rounded-lg"
          rows={5}
          value={accessTokensText}
          onChange={(e) => setAccessTokensText(e.target.value)}
          placeholder="1 access token per line"
        />
      </div>

      {/* UID List */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">UID List (one per line)</label>
        <textarea
          className="w-full p-3 border border-gray-300 dark:bg-gray-700 dark:text-white rounded-lg"
          rows={5}
          placeholder="Enter UIDs here"
          value={uidsText}
          onChange={(e) => setUidsText(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-4">
        <div>
          <label className="block mb-2 font-medium">Gender</label>
          <select
            className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white"
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">Country Code</label>
          <input
            type="text"
            placeholder="e.g. US, ID, PH atau 'All'"
            className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white"
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
          />
        </div>

        <div>
          <button
            onClick={filterUID}
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Proses...' : 'Start'}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {loading && (
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {loading && (
        <div className="text-1xl text-white-700">
          {progress}% - {progressMessage}
        </div>
      )}

      {/* Results */}
      <div>
        {/* <label className="block mb-2 font-medium">Resulting Friend UIDs</label> */}
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg"
          rows={10}
          value={resultText}
          readOnly
          onClick={() => {
            if (resultText) {
              navigator.clipboard.writeText(resultText);
              Swal.fire({
                icon: 'success',
                title: 'Tersalin!',
                text: 'Semua UID berhasil disalin ke clipboard.',
                timer: 1500,
                showConfirmButton: false,
              });
            }
          }}
        />
        { /* Total uid Friends */}
        <div className="mb-5">
          <span className="font-stretch-100%">Total Friends Found:</span>{' '}
          <span className="text-emerald-400 font-bold">{friendCount}</span>
        </div>
        { /* Download */}
        {resultText && (
          <div className="mt-4 flex justify-between">
            <button
              onClick={handleDownload}
              className="bg-green-600 text-white font-medium px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Download
            </button>
            {/* Placeholder for future right-aligned button if needed */}
            <div></div>
          </div>
        )}
      </div>
    {/* my signs!~ */}
    <footer className="flex gap-6 flex-wrap items-center justify-center pt-6 border-t border-gray-300 mt-6">
      <p className="text-cyan-500 font-serif text-sm">Powered by BALANE SØHÏB</p>
    </footer>
    </div>
    </div>
  );
}