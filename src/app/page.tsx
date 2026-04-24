import Link from "next/link";

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
      <main className="flex flex-1 items-center justify-center px-6 text-center">
        <p className="max-w-2xl text-xl text-zinc-700">
          Welcome to Notes & Checklists, your simple workspace for securely
          creating and organizing personal notes and task lists.
        </p>
      </main>
    </div>
  );
}
