"use client";

import { useState } from "react";
import Swal from "sweetalert2";

export default function Page() {
  const [inputValue, setInputValue] = useState("");
  const [images, setImages] = useState<{ username: string; id: string; url: string }[]>([]);

  const generateThumbnails = () => {
    const lines = inputValue.trim().split("\n");
    const parsedImages = lines
      .map((line) => {
        const parts = line.split("|");
        if (parts.length === 3) {
          const username = parts[0].trim();
          const id = parts[1].trim();
          const url = parts[2].trim();
          if (id && url) return { username, id, url };
        }
        return null;
      })
      .filter(Boolean) as { username: string; id: string; url: string }[];

    setImages(parsedImages);
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const copyAll = async () => {
    //const allIds = images.map((img) => `img-${img.id}`).join("\n");
    const allIds = images.map((img) => 
        `${img.username}|${img.id}|${img.url}`
    ).join("\n");
    try {
        await navigator.clipboard.writeText(allIds);
        Swal.fire({
            position: "top-end", // pojok kanan atas
            icon: "success",
            title: "Berhasil disalin!",
            showConfirmButton: false,
            timer: 1500,
            toast: true, // ini mode kecil
        });
    } catch (err) {
        Swal.fire({
            position: "top-end", // pojok kanan atas
            icon: "error",
            title: `❌ Gagal menyalin ID: ${err}`,
            showConfirmButton: false,
            timer: 1500,
            toast: true, // ini mode kecil
        });
    }
  };

  const copyAllIds = async () => {
    //const allIds = images.map((img) => `img-${img.id}`).join("\n");
    const allIds = images.map((img) => img.id).join("\n");
    try {
        await navigator.clipboard.writeText(allIds);
        Swal.fire({
            position: "top-end", // pojok kanan atas
            icon: "success",
            title: "Berhasil disalin!",
            showConfirmButton: false,
            timer: 1500,
            toast: true, // ini mode kecil
        });
    } catch (err) {
        //alert("❌ Gagal menyalin ID: " + err);
        Swal.fire({
            position: "top-end", // pojok kanan atas
            icon: "error",
            title: `❌ Gagal menyalin ID: ${err}`,
            showConfirmButton: false,
            timer: 1500,
            toast: true, // ini mode kecil
        });
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-3xl mx-auto py-10 px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Instagram / Threads Image Filter
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Masukkan URL gambar dengan format <code>id|url</code>
          </p>
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg">
          <textarea
                wrap="off"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                rows={10}
                placeholder={
                    "1|https://example.com/img1.jpg\n2|https://example.com/img2.jpg"
                }
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 
                            rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 
                            dark:focus:ring-blue-400 transition font-mono whitespace-pre overflow-x-auto"
          />

          <div className="flex flex-wrap gap-3 mt-4 justify-end">
            <button
              onClick={generateThumbnails}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-sm hover:shadow-md"
            >
              Start
            </button>
            <button
              onClick={copyAll}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-sm hover:shadow-md"
            >
              Copy
            </button>
            <button
              onClick={copyAllIds}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-sm hover:shadow-md"
            >
              Copy All ID
            </button>
          </div>
        </div>

        {/* Image Grid */}
        {images.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold mb-4">
              Profile ({images.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img) => (
                <div
                  key={img.id}
                  id={`thumb-${img.id}`}
                  className="relative group border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition"
                >
                  <img
                    id={`img-${img.id}`}
                    src={`/api/proxy?url=${encodeURIComponent(img.url)}`}
                    alt={`Profile ${img.id}`}
                    className="object-cover w-full h-36 sm:h-40 md:h-44"
                  />
                  <button
                    onClick={() => removeImage(img.id)}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-7 h-7 text-sm font-bold opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                    title="Hapus gambar ini"
                  >
                    ✕
                  </button>
                  <div className="absolute bottom-0 left-0 w-full bg-black/50 text-xs text-white text-center py-1">
                    {img.id}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
