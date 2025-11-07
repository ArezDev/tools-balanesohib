"use client";

import { useState } from "react";
import Swal from "sweetalert2";

export default function Page() {
  const [inputValue, setInputValue] = useState("");
  const [images, setImages] = useState<
    { fullname: string; username: string; id: string; url: string }[]
  >([]);
  const [progress, setProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorLines, setErrorLines] = useState<string[]>([]);

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  /**
   * Ambil thumbnails gambar
   * @returns 
   */
  const generateThumbnails = async () => {
    const lines = inputValue.trim().split("\n");
    if (!lines.length) return;

    setIsLoading(true);
    setProgress(0);
    setErrorLines([]);
    setImages([]);

    const parsed: { fullname: string; username: string; id: string; url: string }[] = [];
    const failed: string[] = [];
    const batchSize = 10;

    try {
      for (let i = 0; i < lines.length; i += batchSize) {
        const batch = lines.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async (line, index) => {
            const parts = line.split("|");
            if (parts.length === 4) {
              const [fullname, username, id, url] = parts.map((p) => p.trim());
              if (fullname && username && id && url) {
                parsed.push({ fullname, username, id, url });
              } else {
                failed.push(`Baris ${i + index + 1}: format tidak lengkap`);
              }
            } else {
              failed.push(`Baris ${i + index + 1}: format tidak valid`);
            }
            await delay(10 + Math.random() * 20); // small stagger for smooth UI
          })
        );

        setProgress(Math.round(((i + batch.length) / lines.length) * 100));
        await delay(20);
      }

      setImages(parsed);
      setErrorLines(failed);
      setIsLoading(false);

      if (failed.length) {
        Swal.fire({
          icon: "warning",
          title: "Beberapa data gagal diproses",
          html: `<pre class='text-left text-sm text-red-500'>${failed.join("\n")}</pre>`,
        });
      }
    } catch (err) {
      console.error("Processing error:", err);
      setIsLoading(false);
      Swal.fire({
        icon: "error",
        title: "Terjadi kesalahan",
        text: "Server gagal memproses data. Coba ulangi dengan jumlah baris lebih kecil.",
      });
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const copyAll = async () => {
    const text = images.map((img) => `${img.fullname}|${img.username}|${img.id}|${img.url}`).join("\n");
    await navigator.clipboard.writeText(text);
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Berhasil disalin!",
      showConfirmButton: false,
      timer: 1500,
      toast: true,
    });
  };

  const copyAllIds = async () => {
    const text = images.map((img) => img.id).join("\n");
    await navigator.clipboard.writeText(text);
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Semua ID berhasil disalin!",
      showConfirmButton: false,
      timer: 1500,
      toast: true,
    });
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-3xl mx-auto py-10 px-6 space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-extrabold bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Instagram / Threads Image Filter
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Masukkan data dengan format: <code>fullname|username|id|url_gambar</code>
          </p>
        </header>

        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg space-y-4">
          <textarea
            wrap="off"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            rows={10}
            placeholder={"fullname|username|id|url_gambar\n..."}
            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition font-mono whitespace-pre overflow-x-auto"
          />

          <div className="flex flex-wrap gap-3 justify-end">
            <button
              onClick={generateThumbnails}
              disabled={isLoading}
              className={`${isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} text-white px-5 py-2.5 rounded-lg font-medium transition shadow-sm hover:shadow-md`}
            >
              {isLoading ? "Processing..." : "Start"}
            </button>
            <button onClick={copyAll} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-sm hover:shadow-md">
              Copy
            </button>
            <button onClick={copyAllIds} className="bg-yellow-600 hover:bg-yellow-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-sm hover:shadow-md">
              Copy All ID
            </button>
          </div>

          {isLoading && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-blue-600 dark:text-blue-400 font-medium">Memproses data...</span>
                <span className="text-gray-500">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-2 transition-all duration-200" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}
        </section>

        {errorLines.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg text-sm">
            <strong>⚠️ Beberapa baris gagal:</strong>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              {errorLines.map((err, i) => (<li key={i}>{err}</li>))}
            </ul>
          </div>
        )}

        {images.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4">Profile ({images.length})</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img) => (
                <div key={img.id} id={`thumb-${img.id}`} className="relative group border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition">
                  <img
                    id={`img-${img.id}`}
                    src={`/api/ig/proxy?url=${encodeURIComponent(img.url)}`}
                    alt={`Profile ${img.username}`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/favicon.ico";
                    }}
                    className="object-cover w-full h-36 sm:h-40 md:h-44"
                  />
                  <button
                    onClick={() => removeImage(img.id)}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-7 h-7 text-sm font-bold opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                    title="Hapus gambar ini"
                  >
                    ✕
                  </button>
                  <div className="absolute bottom-0 left-0 w-full bg-black/50 text-xs text-white text-center py-1 truncate">
                    {img.fullname} | {img.username} | {img.id}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}