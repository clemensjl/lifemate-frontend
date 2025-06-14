'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="text-white p-10 text-center">
      <h1 className="text-4xl font-bold mb-4">Willkommen bei Lifemate AI 🚀</h1>
      <p className="mb-6 text-lg">Dein smarter Lebensplaner – jetzt starten!</p>
      <Link
        href="/login"
        className="bg-cyan-600 hover:bg-cyan-500 px-6 py-3 rounded text-white shadow"
      >
        Jetzt anmelden
      </Link>
    </main>
  );
}
