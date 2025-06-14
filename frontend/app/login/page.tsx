'use client';


import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
} from '@/lib/auth';
import { auth } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.push('/calendar');
    });
    return () => unsubscribe(); // gute Praxis: Event-Listener aufräumen
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
      <div className="bg-zinc-800 p-8 rounded-xl shadow-lg w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">🔐 Anmeldung</h1>

        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 rounded bg-zinc-700 border border-zinc-600"
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 rounded bg-zinc-700 border border-zinc-600"
        />

        <button
          onClick={() => loginWithEmail(email, password)}
          className="w-full bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-white"
        >
          Einloggen
        </button>
        <button
          onClick={() => registerWithEmail(email, password)}
          className="w-full bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-white"
        >
          Registrieren
        </button>

        <hr className="border-zinc-600 my-4" />

        <button
          onClick={loginWithGoogle}
          className="w-full bg-white text-black px-4 py-2 rounded hover:shadow-lg"
        >
          Mit Google anmelden
        </button>
      </div>
    </div>
  );
}
