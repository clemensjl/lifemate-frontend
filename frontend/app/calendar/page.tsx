'use client';

import { useEffect, useState } from 'react';
import {
  format,
  addWeeks,
  subWeeks,
  startOfWeek,
  addDays,
  isSameDay,
  parseISO,
} from 'date-fns';
import { de } from 'date-fns/locale';

import { db } from '@/firebase';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { useAuth } from '@/components/AuthContext';
import OnlyClient from '@/components/OnlyClient';

type Termin = {
  id: string;
  uid: string;
  date: string;
  text: string;
};

const austrianHolidays: Record<string, string> = {
  '01.01.2025': 'Neujahr',
  '06.01.2025': 'Heilige Drei Könige',
  '31.03.2025': 'Ostermontag',
  '01.05.2025': 'Staatsfeiertag',
  '15.08.2025': 'Mariä Himmelfahrt',
  '26.10.2025': 'Nationalfeiertag',
  '01.11.2025': 'Allerheiligen',
  '08.12.2025': 'Mariä Empfängnis',
  '25.12.2025': 'Weihnachten',
  '26.12.2025': 'Stefanitag',
};

export default function SmartKalender() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [termine, setTermine] = useState<Termin[]>([]);
  const [newDate, setNewDate] = useState('');
  const [newText, setNewText] = useState('');
  const [today, setToday] = useState<Date | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    setToday(new Date());
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'termine'), where('uid', '==', user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Termin, 'id'>;
        return {
          id: doc.id,
          ...data,
        };
      });
      setTermine(items);
    });

    return () => unsub();
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newText || !user) {
      alert('Bitte einloggen, um Termine zu speichern.');
      return;
    }

    await addDoc(collection(db, 'termine'), {
      date: newDate,
      text: newText,
      uid: user.uid,
    });

    setNewDate('');
    setNewText('');
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'termine', id));
  };

  const startOfCurrentWeek = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }).map((_, i) =>
    addDays(startOfCurrentWeek, i)
  );

  return (
    <OnlyClient>
      <div className="text-white">
        <div className="flex justify-between items-center mb-6 gap-2 flex-wrap">
          <button
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            className="bg-zinc-700 px-4 py-2 rounded hover:bg-zinc-600 transition shadow"
          >
            ◀ Vorherige Woche
          </button>

          <h1 className="text-3xl font-bold flex items-center gap-2 text-center">
            🗓️ Kalenderübersicht
          </h1>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentWeek(new Date())}
              className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500 transition shadow"
            >
              🔄 Heute
            </button>
            <button
              onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
              className="bg-zinc-700 px-4 py-2 rounded hover:bg-zinc-600 transition shadow"
            >
              Nächste Woche ▶
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4">
          {days.map((date, i) => {
            const dateKey = format(date, 'dd.MM.yyyy');
            const holiday = austrianHolidays[dateKey];
            const isCurrentDay = today && isSameDay(today, date);
            const dayTermine = termine.filter((t) =>
              isSameDay(parseISO(t.date), date)
            );

            return (
              <div
                key={i}
                className={`bg-zinc-800 rounded-xl p-4 shadow-lg transition ${
                  isCurrentDay
                    ? 'border-2 border-cyan-400 shadow-[0_0_18px_#00ffffaa]'
                    : 'hover:shadow-[0_0_12px_#00ffff88]'
                }`}
              >
                <div className="text-xl font-bold">
                  {format(date, 'EEEE', { locale: de })}
                </div>
                <div className="text-white/60 text-sm mt-1">
                  {format(date, 'dd.MM.yyyy')}
                </div>
                {holiday && (
                  <div className="text-red-500 text-xs mt-1">{holiday}</div>
                )}
                <div className="mt-2 flex flex-col gap-1">
                  {dayTermine.map((t) => (
                    <div
                      key={t.id}
                      className="group bg-zinc-700 text-sm rounded px-2 py-1 flex justify-between items-center"
                    >
                      <span>{t.text}</span>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="invisible group-hover:visible text-red-400 hover:text-red-200 ml-2"
                        title="Löschen"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-zinc-800 rounded-xl shadow-lg max-w-xl">
          <h2 className="text-xl font-bold mb-4">➕ Neuen Termin hinzufügen</h2>
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="bg-zinc-700 text-white p-2 rounded border border-zinc-600"
              required
            />
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Was willst du machen?"
              className="bg-zinc-700 text-white p-2 rounded border border-zinc-600"
              required
            />
            <button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded shadow"
            >
              Termin hinzufügen
            </button>
          </form>
        </div>
      </div>
    </OnlyClient>
  );
}
