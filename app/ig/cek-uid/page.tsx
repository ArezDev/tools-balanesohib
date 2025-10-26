'use client';

import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function Home() {
  const [input, setInput] = useState("");
  const [liveResult, setLiveResult] = useState("");
  const [deadResult, setDeadResult] = useState("");
  const [liveCount, setLiveCount] = useState(0);
  const [deadCount, setDeadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [currentCheck, setCurrentCheck] = useState("");
  const [progress, setProgress] = useState(0);

  const cekFast = async () => {
    setLoading2(true);
    setLiveResult("");
    setDeadResult("");
    setLiveCount(0);
    setDeadCount(0);
    setProgress(0);
    setCurrentCheck("");

    const cokisList = input
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item !== "");

    const total = cokisList.length;
    let liveArr: string[] = [];
    let deadArr: string[] = [];

    let done = 0;

    const promises = cokisList.map(async (cokis) => {
      const trimmed = cokis.trim();
      const myUser = trimmed.includes("|") ? trimmed.split("|")[0] : trimmed;

      try {
        setCurrentCheck(myUser);

        // const res = await axios.get(`https://graph.facebook.com/${myUser}/picture?type=normal`);

        // if (res.request?.responseURL?.includes("C5yt7Cqf3zU")) {
        //   deadArr.push(trimmed);
        // } else {
        //   liveArr.push(trimmed);
        // }

      } catch {
        deadArr.push(trimmed);
      } finally {
        done++;
        setProgress(Math.round((done / total) * 100));
      }
    });

    await Promise.all(promises);

    setLiveResult(liveArr.join("\n"));
    setDeadResult(deadArr.join("\n"));
    setLiveCount(liveArr.length);
    setDeadCount(deadArr.length);
    setCurrentCheck("");

    Swal.fire("Selesai", `Live: ${liveArr.length}, Dead: ${deadArr.length}`, "success");
    setLoading2(false);
  };

  const cek = async () => {
    setLoading(true);
    setLiveResult("");
    setDeadResult("");
    setLiveCount(0);
    setDeadCount(0);
    setProgress(0);
    setCurrentCheck("");

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
        const myUser = trimmed.includes("|") ? trimmed.split("|")[0] : trimmed;

        setCurrentCheck(myUser);

        try {
          const res = await axios.post('/api/cek',{ user : myUser });
          console.log(res.data);

          if (res?.data?.data?.user) {
            liveArr.push(trimmed);
            setLiveResult((prev) => prev + trimmed + "\n");
            setLiveCount((prev) => prev + 1);
          } else {
            deadArr.push(trimmed);
            setDeadResult((prev) => prev + trimmed + "\n");
            setDeadCount((prev) => prev + 1);
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 bg-center bg-cover bg-no-repeat">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
          Cek Akun Instagram by -ZDEV-
        </h1>
        <div className="flex flex-col items-center justify-center gap-6">
          {/* Textarea input */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-48 p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="USERNAME|PASSWORD|COOKIE (1 baris per akun)"
            wrap="off"
          />

          {/* Tombol & Counter */}
          <div className="w-full flex flex-wrap gap-4 items-center justify-between text-gray-500">
            <div className="flex gap-4">
              <button
                onClick={cek}
                disabled={loading || loading2}
                className={`bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ${
                  loading || loading2 ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
                }`}
              >
                {loading ? "Memproses..." : "Start"}
              </button>

              <button
                hidden
                onClick={cekFast}
                disabled={loading || loading2}
                className={`bg-purple-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ${
                  loading || loading2 ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-600"
                }`}
              >
                {loading2 ? "Memproses..." : "Cek Akun Fast (max 1000 akun)"}
              </button>
            </div>

            <div className="flex gap-4 text-lg">
              <p className="text-green-500">Live: {liveCount}</p>
              <p className="text-red-500">Dead: {deadCount}</p>
            </div>
          </div>

          {/* Progress Bar */}
          {(loading || loading2) && (
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
              placeholder="Live Result"
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
              placeholder="Dead Result"
              wrap="off"
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="flex gap-6 flex-wrap items-center justify-center pt-6 border-t border-gray-300 mt-6">
          <p className="text-cyan-600 text-2xl">Powered by BalaneSohib.team</p>
        </footer>
      </div>
    </div>
  );
}