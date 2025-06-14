'use client';

import { useState, useEffect } from 'react';
import { db } from '@/firebase';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { useAuth } from '@/components/AuthContext';

type GroceryItem = {
  id: string;
  name: string;
};

export default function SmartGroceryList() {
  const { user } = useAuth();
  const [items, setItems] = useState<GroceryItem[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'grocery'), where('uid', '==', user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setItems(data);
    });

    return () => unsub();
  }, [user]);

  const removeItem = async (id: string) => {
    await deleteDoc(doc(db, 'grocery', id));
  };

  if (!user) return <p className="text-white p-4">Bitte einloggen.</p>;

  return (
    <div className="text-white max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">🛒 Smart Einkaufsliste</h1>
      <ul className="grid gap-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="bg-zinc-700 p-3 rounded flex justify-between items-center"
          >
            <span>{item.name}</span>
            <button
              onClick={() => removeItem(item.id)}
              className="text-red-400 hover:text-red-300"
            >
              🗑️
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
