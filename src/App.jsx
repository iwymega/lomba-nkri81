import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, MapPin, Play, Sparkles, Trophy, User } from 'lucide-react';
import KerupukGame from './components/KerupukGame';
import SackRaceGame from './components/SackRaceGame';
import TugOfWarGame from './components/TugOfWarGame';
import { fetchLeaderboard, isLeaderboardConfigured } from './utils/leaderboard';

const GAME_LIBRARY = {
  kerupuk: {
    id: 'kerupuk',
    name: 'Makan Kerupuk',
    emoji: '🍘',
    strap: 'Tap cepat, buru-buru habiskan kerupuk gantung dengan ritme stabil.',
    highlight: 'Rasa paling sinematik dan cocok jadi hero game utama.',
    component: KerupukGame,
  },
  karung: {
    id: 'karung',
    name: 'Balap Karung',
    emoji: '🏃',
    strap: 'Tap kiri-kanan bergantian untuk melompat tanpa kehilangan momentum.',
    highlight: 'Nuansa lapangan sore dan race tempo tinggi.',
    component: SackRaceGame,
  },
  tarik: {
    id: 'tarik',
    name: 'Tarik Tambang',
    emoji: '🪢',
    strap: 'Timing power meter, rebut momentum sebelum lawan menarik balik.',
    highlight: 'Cocok untuk tensi dramatis dan efek crowd.',
    component: TugOfWarGame,
  },
};

export default function App() {
  const [playerName, setPlayerName] = useState('');
  const [region, setRegion] = useState('');
  const [selectedGameId, setSelectedGameId] = useState('kerupuk');
  const [activeGameId, setActiveGameId] = useState(null);
  const [leaderboardRows, setLeaderboardRows] = useState([]);
  const [leaderboardStatus, setLeaderboardStatus] = useState(
    isLeaderboardConfigured() ? 'idle' : 'missing-config'
  );

  const selectedGame = useMemo(() => GAME_LIBRARY[selectedGameId], [selectedGameId]);

  useEffect(() => {
    if (!isLeaderboardConfigured()) return;

    let ignore = false;
    setLeaderboardStatus('loading');

    fetchLeaderboard(selectedGameId, 5)
      .then((rows) => {
        if (ignore) return;
        setLeaderboardRows(rows);
        setLeaderboardStatus('ready');
      })
      .catch(() => {
        if (ignore) return;
        setLeaderboardRows([]);
        setLeaderboardStatus('error');
      });

    return () => {
      ignore = true;
    };
  }, [selectedGameId, activeGameId]);

  const handleStart = (event) => {
    event.preventDefault();
    if (playerName.trim().length < 2) return;
    setActiveGameId(selectedGameId);
  };

  const handleExitGame = () => {
    setActiveGameId(null);
  };

  if (activeGameId) {
    const ActiveGame = GAME_LIBRARY[activeGameId].component;

    return (
      <div className="festival-app min-h-screen text-slate-50">
        <div className="festival-noise"></div>
        <div className="festival-shell mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden border-x border-white/10">
          <header className="relative z-10 flex items-center justify-between px-4 pb-2 pt-5">
            <button
              type="button"
              onClick={handleExitGame}
              className="festival-ghost-button"
            >
              <ChevronLeft className="h-4 w-4" />
              Arena
            </button>
            <span className="festival-badge">
              <img
                src="/HUTRI81.png"
                alt="Logo resmi HUT RI ke-81"
                className="h-[18px] w-[18px] rounded-full bg-white object-cover p-0.5"
              />
              Festival 17-an Digital
            </span>
          </header>

          <ActiveGame
            playerName={playerName}
            region={region}
            onExit={handleExitGame}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="festival-app min-h-screen text-slate-50">
      <div className="festival-noise"></div>
      <div className="festival-shell mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden border-x border-white/10">
        <div className="festival-lights">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <header className="relative z-10 px-4 pb-3 pt-5">
          <span className="festival-badge mb-3 inline-flex">
            <img
              src="/HUTRI81.png"
              alt="Logo resmi HUT RI ke-81"
              className="h-[18px] w-[18px] rounded-full bg-white object-cover p-0.5"
            />
            HUT RI ke-81
          </span>

          <div className="festival-hero-card">
            <div className="mb-3 flex justify-center">
              <div className="rounded-[24px] bg-white/95 p-2.5 shadow-[0_16px_38px_rgba(0,0,0,0.18)]">
                <img
                  src="/HUTRI81.png"
                  alt="Logo resmi HUT RI ke-81"
                  className="h-16 w-auto object-contain"
                />
              </div>
            </div>
            <p className="festival-eyebrow">Kenangan lama, rasa baru</p>
            <h1 className="font-game text-[34px] font-black leading-none tracking-tight text-white">
              FESTIVAL
              <span className="mt-1 block text-riGold">LOMBA 17-AN</span>
            </h1>
            <p className="mt-2 max-w-[28rem] text-[13px] leading-5 text-white/74">
              Kita rombak jadi hub mini game dengan atmosfer sore kampung, crowd hidup,
              dan animasi yang lebih sinematik daripada versi awal.
            </p>
          </div>
        </header>

        <main className="relative z-10 flex-1 px-4 pb-4">
          <section className="festival-panel mb-3">
            <div className="mb-3 flex items-center gap-2 text-yellow-300">
              <Sparkles className="h-4 w-4" />
              <p className="text-xs font-bold uppercase tracking-[0.28em]">
                Pilih profil dan arena
              </p>
            </div>

            <form onSubmit={handleStart} className="space-y-3">
              <label className="block">
                <span className="festival-label">Nama pemain</span>
                <div className="festival-input-wrap">
                  <input
                    type="text"
                    value={playerName}
                    onChange={(event) => setPlayerName(event.target.value)}
                    maxLength={18}
                    required
                    placeholder="Contoh: Bima Nusantara"
                    className="festival-input"
                  />
                  <User className="festival-input-icon" />
                </div>
              </label>

              <label className="block">
                <span className="festival-label">RT / Kota / Komunitas</span>
                <div className="festival-input-wrap">
                  <input
                    type="text"
                    value={region}
                    onChange={(event) => setRegion(event.target.value)}
                    maxLength={24}
                    placeholder="Contoh: Makassar Selatan"
                    className="festival-input"
                  />
                  <MapPin className="festival-input-icon" />
                </div>
              </label>

              <div>
                <p className="festival-label mb-2">Mini game utama</p>
                <div className="space-y-2">
                  {Object.values(GAME_LIBRARY).map((game) => (
                    <button
                      key={game.id}
                      type="button"
                      onClick={() => setSelectedGameId(game.id)}
                      className={`festival-game-card ${
                        selectedGameId === game.id ? 'festival-game-card-active' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3 text-left">
                        <div className="festival-game-emoji">{game.emoji}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <h2 className="font-game text-base font-bold text-white">
                              {game.name}
                            </h2>
                            {selectedGameId === game.id && (
                              <span className="rounded-full bg-yellow-300 px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-red-950">
                                Aktif
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-[13px] leading-5 text-white/70">
                            {game.strap}
                          </p>
                          <p className="mt-1.5 text-[11px] font-semibold text-yellow-300">
                            {game.highlight}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="festival-selected-summary">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-yellow-300/80">
                    Arena terpilih
                  </p>
                  <p className="mt-0.5 font-game text-lg font-bold text-white">
                    {selectedGame.emoji} {selectedGame.name}
                  </p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-300" />
              </div>

              <button
                type="submit"
                disabled={playerName.trim().length < 2}
                className="festival-primary-button"
              >
                <Play className="h-5 w-5 fill-red-950" />
                Masuk ke Arena
              </button>
            </form>
          </section>

          <section className="grid grid-cols-3 gap-2">
            <div className="festival-mini-stat">
              <span>3</span>
              Arena aktif
            </div>
            <div className="festival-mini-stat">
              <span>9:16</span>
              Hasil shareable
            </div>
            <div className="festival-mini-stat">
              <span>HD</span>
              Motion-first UI
            </div>
          </section>

          <section className="festival-panel mt-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="festival-eyebrow">Leaderboard Global</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  Top pemain {selectedGame.name}
                </p>
              </div>
              <Trophy className="h-5 w-5 text-yellow-300" />
            </div>

            {leaderboardStatus === 'missing-config' && (
              <p className="text-[13px] leading-5 text-white/68">
                Isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY` dulu
                agar leaderboard global aktif saat publish.
              </p>
            )}

            {leaderboardStatus === 'loading' && (
              <p className="text-[13px] leading-5 text-white/68">
                Mengambil papan skor terbaru...
              </p>
            )}

            {leaderboardStatus === 'error' && (
              <p className="text-[13px] leading-5 text-amber-200">
                Gagal memuat leaderboard. Cek konfigurasi Supabase atau policy tabel.
              </p>
            )}

            {leaderboardStatus === 'ready' && leaderboardRows.length === 0 && (
              <p className="text-[13px] leading-5 text-white/68">
                Belum ada skor global untuk arena ini. Kamu bisa jadi yang pertama.
              </p>
            )}

            {leaderboardStatus === 'ready' && leaderboardRows.length > 0 && (
              <div className="space-y-2">
                {leaderboardRows.map((row, index) => (
                  <div
                    key={row.id}
                    className="flex items-center justify-between gap-3 rounded-[18px] border border-white/8 bg-white/4 px-3 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-300 text-sm font-black text-red-950">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-game text-base font-bold text-white">
                          {row.player_name}
                        </p>
                        <p className="truncate text-[11px] text-white/56">
                          {row.region || 'Komunitas Merdeka'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-game text-lg font-black text-yellow-300">
                        {row.score}
                      </p>
                      <p className="max-w-[96px] truncate text-[11px] text-white/56">
                        {row.detail_value || row.verdict || 'Skor resmi'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
