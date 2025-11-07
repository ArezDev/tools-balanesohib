'use client';

import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function Home() {
  const [input, setInput] = useState("");
  const [removeDuplicate, setRemoveDuplicate] = useState(true);
  const [liveResult, setLiveResult] = useState("");
  const [deadResult, setDeadResult] = useState("");
  const [liveCount, setLiveCount] = useState(0);
  const [deadCount, setDeadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentCheck, setCurrentCheck] = useState("");
  const [progress, setProgress] = useState(0);

  const handleRemoveDuplicate = async () => {
    // Pisahkan baris
    const lines = input.split("\n");
    // Hapus duplikat
    const unique = Array.from(new Set(lines));
    // Gabungkan kembali
    setInput(unique.join("\n"));
  };

  const start = async () => {
    setLoading(true);
    setLiveResult("");
    setDeadResult("");
    setLiveCount(0);
    setDeadCount(0);
    setProgress(0);
    setCurrentCheck("");

    removeDuplicate ? await handleRemoveDuplicate() : null;

    const cokisList = input
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item !== "");

    let liveArr: string[] = [];
    let deadArr: string[] = [];
    let done = 0;
    const total = cokisList.length;

    try {
      for (let cokis of cokisList) {
        const trimmed = cokis.trim();
        //const myUser = trimmed.includes("|") ? trimmed.split("|")[3] : trimmed;
        
        // cari semua key=value sampai sebelum ';' dan fallback ke array kosong jika null
        const cookiePairs = trimmed.match(/(\w+)=([^;]+)/g) || [];
        
        // buat objek cookies dengan aman (handle tanda '=' di value)
        const cookies = Object.fromEntries(
          cookiePairs.map((pair) => {
            const idx = pair.indexOf('=');
            return [pair.slice(0, idx), pair.slice(idx + 1)];
          })
        );
        
        // tentukan user id: prioritaskan cookie 'c_user', fallback ke bagian sebelum '|' atau seluruh trimmed
        const myUser = (cookies as Record<string, string>)['c_user'] ?? (trimmed.includes('|') ? trimmed.split('|')[0] : trimmed);
        
        //Ambil cokis
        const cookieString = Object.entries(cookies).map(([name, value]) => `${name}=${value};`).join(' ');

        setCurrentCheck(myUser);

        try {
          const res = await axios.get(`/api/fb/get-ig-token?cookie=${encodeURIComponent(cookieString)}`);
          const myToken = res?.data?.data;

          if (myToken.ig === "not_authorized") {
            deadArr.push(trimmed);
            setDeadResult((prev) => prev + trimmed + "\n");
            setDeadCount((prev) => prev + 1);
          } else {
            liveArr.push(trimmed);
            setLiveResult((prev) => prev + myToken.access_token + "|" + trimmed + "\n");
            setLiveCount((prev) => prev + 1);
          }
          
        } catch {
          deadArr.push(trimmed);
          setDeadResult((prev) => prev + trimmed + "\n");
          setDeadCount((prev) => prev + 1);
        } finally {
          done++;
          setProgress(Math.round((done / total) * 100));
        }
      }

      Swal.fire("Selesai", `Live: ${liveArr.length}, Dead: ${deadArr.length}`, "success");
    } catch (error) {
      Swal.fire("Error", "Terjadi kesalahan saat memproses.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-600 rounded-lg shadow-lg p-6 bg-center bg-cover bg-no-repeat">
        <h1 className="text-3xl font-mono text-center mb-6 dark:text-white text-black">
          Get Token Facebook ( instagram )
        </h1>
        <div className="flex flex-col items-center justify-center gap-6">
          {/* Textarea input */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-48 p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Cookie Facebook atau UID|PASSWORD|COOKIE (1 baris per akun)"
            wrap="off"
          />

          {/* Tombol & Counter */}
          <div className="w-full flex flex-wrap gap-4 items-center justify-between text-gray-500">
            
            <div className="flex gap-4">

              {/* Cek Normal */}
              <button
                onClick={start}
                disabled={loading}
                className={
                  `bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300 
                  ${ loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"}`
                }
              >
                {loading ? "Memproses..." : "Start"}
              </button>

              {/* Connect Instagram */}
              <button
              hidden
              onClick={()=>{
                window.open('https://facebook.com/oidc/?app_id=124024574287414&redirect_uri=https://www.instagram.com/accounts/signupviafb/&response_type=code&scope=openid+email+profile+linking&state=jancok')
              }}
              className={
                  `bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300`
                }
              >
                Connect Instagram
              </button>

              {/* Remove Duplikat */}
              <div className="flex gap-1 items-center space-x-1">
                <input
                  type="checkbox"
                  id="removeduplikat"
                  name="removeduplikat"
                  checked={removeDuplicate}
                  onChange={(e) => setRemoveDuplicate(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="removeduplikat"
                  className="text-ellipsis text-lg font-mono cursor-pointer dark:text-white text-black"
                >
                  buat ganda
                </label>
              </div>

            </div>

            <div className="flex gap-4 text-lg">
              <p className="text-green-500">Success: {liveCount}</p>
              <p className="text-red-500">Failed: {deadCount}</p>
            </div>
          </div>

          {/* Progress Bar */}
          {(loading) && (
            <div className="w-full mt-2 text-center">
              <p className="text-blue-600">
                Sedang mengecek: <span className="font-mono">{currentCheck || "..."}</span>
              </p>
              <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-1">{progress}% selesai</p>
            </div>
          )}

          {/* Hasil Live dan Dead */}
          <div className="flex flex-col sm:flex-row gap-6 w-full">
            <textarea
              value={liveResult}
              onClick={() => {
                if (liveResult) {
                  navigator.clipboard.writeText(liveResult);
                  Swal.fire("Disalin", "Live Result berhasil disalin ke clipboard", "success");
                }
              }}
              readOnly
              className="w-full sm:w-1/2 h-48 p-4 border-2 border-green-400 rounded-lg resize-none"
              placeholder="Success"
              wrap="off"
            />
            <textarea
              value={deadResult}
              onClick={() => {
                if (deadResult) {
                  navigator.clipboard.writeText(deadResult);
                  Swal.fire("Disalin", "Dead Result berhasil disalin ke clipboard", "success");
                }
              }}
              readOnly
              className="w-full sm:w-1/2 h-48 p-4 border-2 border-red-400 rounded-lg resize-none"
              placeholder="Failed"
              wrap="off"
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="flex gap-6 flex-wrap items-center justify-center pt-6 border-t border-gray-300 mt-6">
          <p className="text-cyan-500 font-serif text-sm">Powered by BALANE SØHÏB</p>
        </footer>
      </div>
    </div>
  );
}