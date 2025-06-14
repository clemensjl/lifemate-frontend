'use client';

import { useState, useEffect } from 'react';
import { db } from '@/firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { useAuth } from '@/components/AuthContext';
import { deleteExpiryFromCalendar } from '@/lib/calendarUtils'; // ✅ wichtig!

type FridgeItem = {
  id: string;
  name: string;
  expiryDate?: string;
};

export default function SmartFridgePage() {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [items, setItems] = useState<FridgeItem[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'fridge'),
      where('uid', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        expiryDate: doc.data().expiryDate,
      }));
      setItems(data);
    });

    return () => unsubscribe();
  }, [user]);

  async function addItem() {
    if (!input.trim() || !user) return;

    const itemData = {
      name: input.trim(),
      uid: user.uid,
      expiryDate: expiryDate || null,
    };

    await addDoc(collection(db, 'fridge'), itemData);

    // Ablaufdatum als Kalender-Eintrag speichern
    if (expiryDate) {
      await addDoc(collection(db, 'termine'), {
        date: expiryDate,
        text: `❗ Ablaufdatum: ${input.trim()}`,
        uid: user.uid,
      });
    }

    setInput('');
    setExpiryDate('');
  }

  async function removeItem(id: string, name: string) {
    await deleteDoc(doc(db, 'fridge', id));

    if (user) {
      await deleteExpiryFromCalendar(name, user.uid);
    }
  }

  if (!user) {
    return <p className="text-white p-4">Bitte zuerst einloggen.</p>;
  }

  return (
    <div className="text-white max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">🧊 Smart Fridge</h1>

      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Zutat hinzufügen"
          className="p-2 flex-1 rounded bg-zinc-800 border border-zinc-600"
        />
        <input
          type="date"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          className="p-2 rounded bg-zinc-800 border border-zinc-600 w-full sm:w-auto"
        />
        <button
          onClick={addItem}
          className="bg-cyan-600 px-4 py-2 rounded hover:shadow-[0_0_15px_#00ffffbb] w-full sm:w-auto"
        >
          ➕ Hinzufügen
        </button>
      </div>

      <div className="grid gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-zinc-700 p-3 rounded flex justify-between items-center hover:shadow-[0_0_15px_#ffffff66] transition-all"
          >
            <div>
              <span className="block">{item.name}</span>
              {item.expiryDate && (
                <span className="text-sm text-red-400">
                  ⏳ Ablauf: {item.expiryDate}
                </span>
              )}
            </div>
            <button
              onClick={() => removeItem(item.id, item.name)}
              className="text-red-400 hover:text-red-300"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
