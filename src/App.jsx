import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, MapPin, Play, Sparkles, Trophy, User } from 'lucide-react';
import KerupukGame from './components/KerupukGame';
import RelayRaceGame from './components/RelayRaceGame';
import SackRaceGame from './components/SackRaceGame';
import TugOfWarGame from './components/TugOfWarGame';
import { fetchLeaderboard, isLeaderboardConfigured } from './utils/leaderboard';

const GAME_LIBRARY = {
  kerupuk: {
    id: 'kerupuk',
    name: 'Makan Kerupuk',
    emoji: '🍘',
    strap: 'Tap cepat dengan ritme rapat, jaga fokus saat fever cepat turun.',
    highlight: 'Tantangan utama: tempo makin ketat dan bonus tidak mudah aktif.',
    component: KerupukGame,
  },
  karung: {
    id: 'karung',
    name: 'Balap Karung',
    emoji: '🏃',
    strap: 'Tap kiri-kanan bergantian dengan tempo pas, terlalu lambat atau salah langkah bikin oleng.',
    highlight: 'Tantangan utama: momentum gampang hilang dan penalti lebih terasa.',
    component: SackRaceGame,
  },
  tarik: {
    id: 'tarik',
    name: 'Tarik Tambang',
    emoji: '🪢',
    strap: 'Timing power meter yang lebih cepat dan zona emas yang sempit.',
    highlight: 'Tantangan utama: presisi tinggi, miss sedikit langsung kena penalti.',
    component: TugOfWarGame,
  },
  estafet: {
    id: 'estafet',
    name: 'Lari Estafet',
    emoji: '🏁',
    strap: 'Gabungkan ritme langkah kiri-kanan dan timing oper baton di zona sempit.',
    highlight: 'Tantangan utama: arena tersulit, salah ritme atau salah oper langsung buang momentum.',
    component: RelayRaceGame,
  },
};

export default function App() {
  const [playerName, setPlayerName] = useState('');
  const [region, setRegion] = useState('');
  const [selectedGameId, setSelectedGameId] = useState('kerupuk');
  const [activeGameId, setActiveGameId] = useState(null);
  const [leaderboardByGame, setLeaderboardByGame] = useState({});
  const [leaderboardStatus, setLeaderboardStatus] = useState(
    isLeaderboardConfigured() ? 'idle' : 'missing-config'
  );

  const selectedGame = useMemo(() => GAME_LIBRARY[selectedGameId], [selectedGameId]);

  useEffect(() => {
    if (!isLeaderboardConfigured()) return;

    let ignore = false;
    setLeaderboardStatus('loading');

    Promise.all(
      Object.keys(GAME_LIBRARY).map(async (gameKey) => {
        const rows = await fetchLeaderboard(gameKey, 10);
        return [gameKey, rows];
      })
    )
      .then((entries) => {
        if (ignore) return;
        setLeaderboardByGame(Object.fromEntries(entries));
        setLeaderboardStatus('ready');
      })
      .catch(() => {
        if (ignore) return;
        setLeaderboardByGame({});
        setLeaderboardStatus('error');
      });

    return () => {
      ignore = true;
    };
  }, [activeGameId]);

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
              <span>4</span>
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
                  Top 10 tiap lomba, swipe untuk lihat semua
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

            {leaderboardStatus === 'ready' &&
              Object.values(leaderboardByGame).every((rows) => !rows?.length) && (
              <p className="text-[13px] leading-5 text-white/68">
                Belum ada skor global. Kamu bisa jadi pemenang pertama di salah satu arena.
              </p>
            )}

            {leaderboardStatus === 'ready' && (
              <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1">
                {Object.values(GAME_LIBRARY).map((game) => {
                  const rows = leaderboardByGame[game.id] || [];
                  const winner = rows[0];

                  return (
                    <div
                      key={game.id}
                      className="min-w-[290px] snap-start rounded-[18px] border border-white/8 bg-white/4 px-3 py-2.5"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="festival-game-emoji !h-9 !w-9 !text-lg">
                            {game.emoji}
                          </div>
                          <div className="min-w-0">
                            <p className="font-game text-base font-bold text-white">
                              {game.name}
                            </p>
                            <p className="text-[10px] uppercase tracking-[0.18em] text-yellow-300/72">
                              Top 10 global
                            </p>
                          </div>
                        </div>
                        {winner && (
                          <p className="font-game text-lg font-black text-yellow-300">
                            {winner.score}
                          </p>
                        )}
                      </div>

                      {!winner && (
                        <p className="text-[12px] text-white/60">
                          Belum ada pemenang untuk lomba ini.
                        </p>
                      )}

                      {winner && (
                        <div className="space-y-1.5">
                          {rows.map((row, index) => (
                            <div
                              key={row.id}
                              className="flex items-center justify-between gap-3 border-t border-white/6 py-1.5 first:border-t-0 first:pt-0"
                            >
                              <div className="flex min-w-0 items-center gap-2.5">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center border border-yellow-300/40 bg-yellow-300/12 text-[11px] font-black text-yellow-300">
                                  {index + 1}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate font-game text-[15px] font-bold text-white">
                                    {row.player_name}
                                  </p>
                                  <p className="truncate text-[10px] text-white/56">
                                    {row.region || 'Komunitas Merdeka'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-game text-[16px] font-black text-yellow-300">
                                  {row.score}
                                </p>
                                <p className="max-w-[92px] truncate text-[10px] text-white/56">
                                  {row.detail_value || row.verdict || 'Skor resmi'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
