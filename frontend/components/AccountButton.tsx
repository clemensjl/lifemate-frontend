'use client';

import Link from 'next/link';
import { useAuth } from './AuthContext';
import { logout } from '@/lib/auth';

export default function AccountButton() {
  const { user } = useAuth();

  return (
    <div className="absolute bottom-4 left-4">
      {user ? (
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 bg-zinc-800 text-white px-3 py-2 rounded-full shadow hover:bg-zinc-700"
        >
          🏠 Logout
        </button>
      ) : (
        <Link href="/login">
          <button className="flex items-center gap-2 bg-cyan-600 text-white px-3 py-2 rounded-full shadow hover:bg-cyan-500">
            🔑 Einloggen / Registrieren
          </button>
        </Link>
      )}
    </div>
  );
}
