'use client';

import Image from "next/image";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
      document.documentElement.classList.add("dark");
    }, []);
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center xl:items-start">
        <Image
          src="/favicon.ico"
          alt="BalaneSohib"
          width={180}
          height={38}
          priority
        />
        <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
          <li className="mb-2 tracking-[-.01em]">
            <code className="bg-black/5 dark:bg-white/6 font-mono font-semibold px-1 py-0.5 rounded">
              You can be whoever you are on the internet.
            </code>
          </li>
          <li className="tracking-[-.01em]">
            <code className="bg-black/5 dark:bg-white/6 font-mono font-semibold px-1 py-0.5 rounded">
              Don't trust anyone on the Internet!
            </code>
          </li>
          <li className="tracking-[-.01em]">
            <code className="bg-black/5 dark:bg-white/6 font-mono font-semibold px-1 py-0.5 rounded">
              Enjoy...!
            </code>
          </li>
        </ol>
      </main>
    </div>
  );
}