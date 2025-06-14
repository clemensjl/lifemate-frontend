'use client';

import { useState, useEffect } from 'react';
import { db } from '@/firebase';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  query,
  where,
} from 'firebase/firestore';
import { useAuth } from '@/components/AuthContext';

export default function SmartCooking() {
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState('');
  const [desiredMeal, setDesiredMeal] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [fridgeItems, setFridgeItems] = useState<string[]>([]);
  const [recipeIngredients, setRecipeIngredients] = useState<string[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<{ id: string; title: string; content: string }[]>([]);
  const [showRecipesPanel, setShowRecipesPanel] = useState(false);
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchFridgeItems = async () => {
      const q = query(collection(db, 'fridge'), where('uid', '==', user.uid));
      const snapshot = await getDocs(q);
      const names = snapshot.docs.map((doc) => doc.data().name as string);
      setFridgeItems(names);
    };
    fetchFridgeItems();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchRecipes = async () => {
      const q = query(collection(db, 'recipes'), where('uid', '==', user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        content: doc.data().content,
        title: doc.data().title || 'Ohne Titel',
      }));
      setSavedRecipes(data);
    };
    fetchRecipes();
  }, [user]);

  const askAI = async (type: 'recipe' | 'shopping') => {
    setLoading(true);
    setResponse('');
    setRecipeIngredients([]);

    try {
      const res = await fetch('http://localhost:3001/cook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ingredients, desiredMeal }),
      });

      const data = await res.json();

      if (data.reply) {
        setResponse(data.reply);

        if (type === 'shopping') {
          const parsed = await fetch('http://localhost:3001/cook/parse-ingredients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: data.reply }),
          });

          const parsedData = await parsed.json();
          setRecipeIngredients(parsedData.ingredients || []);
        }

        if (type === 'recipe' && ingredients) {
          const q = query(collection(db, 'fridge'), where('uid', '==', user!.uid));
          const snapshot = await getDocs(q);
          for (const docSnap of snapshot.docs) {
            const name = docSnap.data().name;
            if (ingredients.includes(name)) {
              await deleteDoc(doc(db, 'fridge', docSnap.id));
            }
          }
        }
      } else {
        setResponse('Keine Antwort vom Server erhalten.');
      }
    } catch (err) {
      console.error(err);
      setResponse('Fehler bei der Anfrage.');
    } finally {
      setLoading(false);
    }
  };

  const saveRecipe = async () => {
    if (!user || !response) return;

    const titleRes = await fetch('http://localhost:3001/cook/title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: response }),
    });

    const { title } = await titleRes.json();

    await addDoc(collection(db, 'recipes'), {
      uid: user.uid,
      content: response,
      title: title || 'Ohne Titel',
    });

    setSavedRecipes((prev) => [...prev, { id: `${Date.now()}`, content: response, title }]);
  };

  const toggleExpanded = (id: string) => {
    setExpandedRecipeId((prev) => (prev === id ? null : id));
  };

  const deleteRecipe = async (id: string) => {
    await deleteDoc(doc(db, 'recipes', id));
    setSavedRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  const addToGroceryList = async () => {
    if (!user) return;
    for (const name of recipeIngredients) {
      await addDoc(collection(db, 'grocery'), {
        name,
        uid: user.uid,
      });
    }
    setRecipeIngredients([]);
  };

  if (!user) return <p className="text-white p-4">Bitte zuerst einloggen.</p>;

  return (
    <div className="p-8 text-white space-y-6 max-w-4xl mx-auto relative">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Smart Cooking 🍳</h1>
        <button
          onClick={() => setShowRecipesPanel((prev) => !prev)}
          className="bg-zinc-700 px-4 py-2 rounded hover:bg-zinc-600 shadow"
        >
          📚 Gespeicherte Rezepte
        </button>
      </div>

      {showRecipesPanel && (
        <div className="absolute top-20 right-0 w-96 bg-zinc-800 border-l border-zinc-600 p-4 rounded-l-xl shadow-lg max-h-[80vh] overflow-y-auto z-10">
          <h2 className="text-xl font-semibold mb-4">📋 Deine Rezepte</h2>
          {savedRecipes.map((r) => (
            <div key={r.id} className="mb-2 group">
              <div
                onClick={() => toggleExpanded(r.id)}
                className="cursor-pointer bg-zinc-700 p-2 rounded hover:bg-zinc-600 flex justify-between"
              >
                <span className="truncate max-w-[80%]">{r.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteRecipe(r.id);
                  }}
                  className="invisible group-hover:visible text-red-400 hover:text-red-300 ml-2"
                >
                  🗑️
                </button>
              </div>
              {expandedRecipeId === r.id && (
                <pre className="bg-zinc-700 p-2 mt-1 rounded whitespace-pre-wrap">
                  {r.content}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-zinc-800 p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2">Was hast du im Kühlschrank?</h2>
          <textarea
            className="w-full h-24 p-2 bg-zinc-700 rounded"
            placeholder="z. B. Eier, Tomaten, Käse..."
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
          />
          {fridgeItems.length > 0 && (
            <button
              onClick={() => setIngredients(fridgeItems.join(', '))}
              className="mt-2 text-sm text-cyan-400 hover:underline"
            >
              Zutaten aus deinem Kühlschrank übernehmen 🧊
            </button>
          )}
          <button
            onClick={() => askAI('recipe')}
            className="mt-4 bg-cyan-600 px-4 py-2 rounded hover:bg-cyan-500"
          >
            Rezept anzeigen
          </button>
        </div>

        <div className="bg-zinc-800 p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2">Was willst du kochen?</h2>
          <input
            className="w-full p-2 bg-zinc-700 rounded mb-2"
            placeholder="z. B. Lasagne"
            value={desiredMeal}
            onChange={(e) => setDesiredMeal(e.target.value)}
          />
          <button
            onClick={() => askAI('shopping')}
            className="bg-cyan-600 px-4 py-2 rounded hover:bg-cyan-500"
          >
            Einkaufsliste anzeigen
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-white/70 mt-4">⏳ Antwort wird geladen...</div>
      ) : (
        response && (
          <div className="bg-zinc-800 p-6 rounded-xl shadow mt-6">
            <h2 className="text-xl font-semibold mb-2">Antwort von Lifemate AI</h2>
            <pre className="whitespace-pre-wrap">{response}</pre>
            <button
              onClick={saveRecipe}
              className="mt-4 bg-green-600 hover:bg-green-500 px-4 py-2 rounded"
            >
              💾 Rezept speichern
            </button>
          </div>
        )
      )}

      {recipeIngredients.length > 0 && (
        <div className="mt-4">
          <button
            onClick={addToGroceryList}
            className="bg-green-600 px-4 py-2 rounded hover:bg-green-500"
          >
            Zur Einkaufsliste hinzufügen 🛒
          </button>
        </div>
      )}
    </div>
  );
}
