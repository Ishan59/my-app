import Link from "next/link";
import Image from "next/image";
import { Pacifico } from "next/font/google";

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: "400",
});

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="flex items-center justify-end p-6">
        <Link
          href="/login"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          Login
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 pb-12">
        <div className="grid w-full max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
          <div className="text-center lg:text-left">
            <h1 className={`${pacifico.className} text-6xl text-zinc-900`}>
              Simplinotes
            </h1>
            <p className="mt-5 max-w-2xl text-xl text-zinc-700">
              Welcome to Notes & Checklists, your simple workspace for securely
              creating and organizing personal notes and task lists.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
              <Image
                src="/sticky-notes.svg"
                alt="Colorful sticky notes illustration"
                width={320}
                height={240}
                className="h-auto w-full rounded-xl"
                priority
              />
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
              <Image
                src="/notepad-pen.svg"
                alt="Notepad and pen illustration"
                width={320}
                height={240}
                className="h-auto w-full rounded-xl"
                priority
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
