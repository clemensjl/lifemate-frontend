'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');

  async function sendMessage() {
    const res = await fetch('http://localhost:3001/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    setReply(data.reply || 'Keine Antwort erhalten');
  }

  return (
    <aside className="w-64 bg-zinc-800 p-4 pb-20 flex flex-col shadow-lg rounded-tr-3xl rounded-br-3xl">
      {/* obere Navigation */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold mb-6 text-white">Lifemate AI</h2>
        <SidebarButton label="Smart Fitness" icon="🏋️" href="/fitness" />
        <SidebarButton label="Smart Cooking" icon="🍳" href="/cooking" />
        <SidebarButton label="Smart Fridge" icon="🧊" href="/fridge" />
        <SidebarButton label="Smart Grocery List" icon="🛒" href="/smart-grocery" />
        <SidebarButton label="Smart Kalender" icon="📅" href="/calendar" />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Ask AI */}
      <div className="mt-6 transition-all duration-300">
        <AskAI
          expanded={expanded}
          setExpanded={setExpanded}
          message={message}
          setMessage={setMessage}
          reply={reply}
          sendMessage={sendMessage}
        />
      </div>
    </aside>
  );
}

// **Button-Komponente bleibt gleich**
function SidebarButton({
  label,
  icon,
  href,
}: {
  label: string;
  icon: string;
  href: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link href={href}>
      <button
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-lg transition-all
          ${
            isActive
              ? 'bg-cyan-600 shadow-[0_0_15px_#00ffffbb] text-white'
              : 'bg-zinc-700 hover:bg-zinc-600 text-white shadow-[0_0_10px_#00ffff66] hover:shadow-[0_0_15px_#00ffff]'
          }`}
      >
        <span className="text-xl">{icon}</span>
        {label}
      </button>
    </Link>
  );
}

// **AskAI-Komponente bleibt gleich**
function AskAI({
  expanded,
  setExpanded,
  message,
  setMessage,
  reply,
  sendMessage,
}: {
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  message: string;
  setMessage: (v: string) => void;
  reply: string;
  sendMessage: () => void;
}) {
  return (
    <div
      className={`transition-all duration-500 bg-zinc-700 rounded-2xl text-white p-3 cursor-pointer ${
        expanded ? 'h-64' : 'h-12'
      } overflow-hidden shadow-[0_0_15px_#ffffff55]`}
    >
      <div
        className="font-semibold hover:opacity-80"
        onClick={() => setExpanded(!expanded)}
      >
        🤖 Ask AI
      </div>

      {expanded && (
        <div className="mt-3 flex flex-col gap-2 overflow-y-auto max-h-48">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Frag mich was..."
            className="p-2 rounded bg-zinc-800 text-white border border-zinc-600"
          />
          <button
            onClick={sendMessage}
            className="bg-white text-black font-bold rounded px-3 py-1 hover:shadow-[0_0_10px_white] transition-all"
          >
            Senden
          </button>
          {reply && (
            <p className="text-sm mt-2 text-white/80">
              <strong>Antwort:</strong> {reply}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default Sidebar;
