import React, { useState } from 'react';
import KerupukGame from './components/KerupukGame';

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [region, setRegion] = useState('');

  const handleStart = (e) => {
    e.preventDefault();
    if (playerName.trim().length >= 2) {
      setHasStarted(true);
    }
  };

  const handleReset = () => {
    setHasStarted(false);
    setPlayerName('');
    setRegion('');
  };

  if (hasStarted) {
    return <KerupukGame playerName={playerName} region={region} onReset={handleReset} />;
  }

  return (
    <div className="min-h-screen bg-red-900 flex flex-col items-center justify-center p-6 game-touch-prevent">
      <div className="max-w-sm w-full bg-white rounded-3xl p-6 shadow-2xl border-4 border-yellow-400 text-center">
        <h1 className="text-3xl font-game font-black text-red-600 mb-2">
          LOMBA 17-AN DIGITAL
        </h1>
        <p className="text-sm text-slate-500 font-medium mb-6">
          Rayakan HUT RI ke-81 dengan lomba makan kerupuk online tercepat!
        </p>

        <form onSubmit={handleStart} className="flex flex-col gap-4">
          <div>
            <label className="block text-left text-xs font-bold text-slate-700 mb-1">
              Nama Peserta
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Contoh: Budi"
              maxLength={15}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-semibold focus:border-red-500 focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-left text-xs font-bold text-slate-700 mb-1">
              Asal Daerah (Opsional)
            </label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="Contoh: RT 01 Jakarta"
              maxLength={20}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-semibold focus:border-red-500 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={playerName.trim().length < 2}
            className="w-full mt-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-game text-xl py-3 rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            MULAI LOMBA!
          </button>
        </form>
      </div>
    </div>
  );
}
