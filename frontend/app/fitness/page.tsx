'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { db } from '@/firebase';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import OnlyClient from '@/components/OnlyClient';

type Plan = {
  id: string;
  title: string;
  content: string;
  date: string;
};

export default function SmartFitness() {
  const { user } = useAuth();
  const [goal, setGoal] = useState('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('');
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedPlans, setSavedPlans] = useState<Plan[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchPlans = async () => {
      const q = query(collection(db, 'fitnessPlans'), where('uid', '==', user.uid));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Plan, 'id'>),
      }));
      setSavedPlans(list);
    };

    fetchPlans();
  }, [user]);

  const generatePlan = async () => {
    setLoading(true);
    setPlan('');
    setSavedSuccess(false);

    try {
      const response = await fetch('http://localhost:3001/fitness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, duration }),
      });

      const data = await response.json();
      setPlan(data.reply || 'Keine Antwort erhalten.');
    } catch (err) {
      console.error(err);
      setPlan('Fehler beim Generieren des Trainingsplans.');
    } finally {
      setLoading(false);
    }
  };

  const savePlan = async () => {
    if (!user || !plan || !goal || !date) return;

    await addDoc(collection(db, 'fitnessPlans'), {
      uid: user.uid,
      title: goal,
      content: plan,
      date,
    });

    await addDoc(collection(db, 'termine'), {
      uid: user.uid,
      date,
      text: `💪 ${goal} Training`,
    });

    setGoal('');
    setDate('');
    setDuration('');
    setPlan('');
    setSavedSuccess(true);
  };

  const deletePlan = async (id: string) => {
    await deleteDoc(doc(db, 'fitnessPlans', id));
    setSavedPlans(prev => prev.filter(p => p.id !== id));
  };

  if (!user) return <p className="text-white p-4">Bitte zuerst einloggen.</p>;

  return (
    <OnlyClient>
      <div className="text-white p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">🏋️ Smart Fitness</h1>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="bg-cyan-600 px-4 py-2 rounded hover:bg-cyan-500"
          >
            📚 Gespeicherte Pläne
          </button>
        </div>

        {showSidebar && (
          <div className="bg-zinc-800 p-4 rounded-xl mb-6 max-h-80 overflow-y-auto shadow">
            <h2 className="text-xl font-semibold mb-2">🗂️ Deine Trainingspläne</h2>
            {savedPlans.map(plan => (
              <div
                key={plan.id}
                className="group flex justify-between items-center px-2 py-1 bg-zinc-700 rounded mb-1"
              >
                <button
                  onClick={() => {
                    setGoal(plan.title ?? '');
                    setPlan(plan.content ?? '');
                    setDate(plan.date ?? '');
                  }}
                  className="text-left text-cyan-400 hover:underline"
                >
                  {plan.title} – {plan.date}
                </button>
                <button
                  onClick={() => deletePlan(plan.id)}
                  className="text-red-400 hover:text-red-300 invisible group-hover:visible ml-2"
                  title="Löschen"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-zinc-800 p-6 rounded-xl shadow space-y-4">
            <input
              placeholder="Was willst du trainieren?"
              value={goal}
              onChange={e => setGoal(e.target.value)}
              className="w-full p-2 rounded bg-zinc-700 border border-zinc-600"
            />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full p-2 rounded bg-zinc-700 border border-zinc-600"
            />
            <input
              placeholder="Wie viele Minuten?"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              className="w-full p-2 rounded bg-zinc-700 border border-zinc-600"
            />
            <button
              onClick={generatePlan}
              className="w-full bg-cyan-600 px-4 py-2 rounded hover:bg-cyan-500"
            >
              🧠 Trainingsplan erstellen
            </button>
          </div>

          {loading ? (
            <div className="text-white/70 mt-4">⏳ Generiere Trainingsplan...</div>
          ) : (
            plan && (
              <div className="bg-zinc-800 p-6 rounded-xl shadow space-y-4">
                <h2 className="text-xl font-semibold">📄 Plan:</h2>
                <pre className="whitespace-pre-wrap">{plan}</pre>
                <button
                  onClick={savePlan}
                  className="bg-green-600 px-4 py-2 rounded hover:bg-green-500"
                >
                  💾 Trainingsplan speichern
                </button>
                {savedSuccess && (
                  <div className="text-green-400 text-sm mt-2">✅ Erfolgreich gespeichert</div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </OnlyClient>
  );
}
