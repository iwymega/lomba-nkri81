import React, { useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Hand, RotateCcw, Share2 } from 'lucide-react';
import CertificateStory from './CertificateStory';
import { shareOrDownloadCertificate } from '../utils/exportToImage';
import { submitScore } from '../utils/leaderboard';
import {
  playCountdownSound,
  playFinishSound,
  playPassSound,
  playSlipSound,
  playStepSound,
  unlockSound,
} from '../utils/soundEffects';

const TOTAL_TIME = 16;
const FINISH_DISTANCE = 100;
const CHECKPOINTS = [25, 50, 75];

function getVerdict(score) {
  if (score >= 165) return 'Kapten Estafet Nasional';
  if (score >= 140) return 'Pelari Senja Tanpa Cela';
  if (score >= 112) return 'Operan Rapi Sampai Garis';
  if (score >= 84) return 'Masih Kuat Mengejar Podium';
  return 'Tempo Belum Menyatu';
}

export default function RelayRaceGame({ playerName, region, onExit }) {
  const [phase, setPhase] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [distance, setDistance] = useState(0);
  const [expectedSide, setExpectedSide] = useState('left');
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [runnerIndex, setRunnerIndex] = useState(1);
  const [nextCheckpoint, setNextCheckpoint] = useState(CHECKPOINTS[0]);
  const [mode, setMode] = useState('run');
  const [meter, setMeter] = useState(0);
  const [successfulPasses, setSuccessfulPasses] = useState(0);
  const [perfectPasses, setPerfectPasses] = useState(0);
  const [flash, setFlash] = useState('');
  const [submitState, setSubmitState] = useState('idle');
  const [isSharing, setIsSharing] = useState(false);

  const submittedRef = useRef(false);
  const directionRef = useRef(1);
  const currentLap = Math.min(4, successfulPasses + 1);

  useEffect(() => {
    if (phase !== 'countdown') return undefined;

    if (countdown === 0) {
      playCountdownSound(0);
      setPhase('playing');
      return undefined;
    }

    playCountdownSound(countdown);

    const timer = window.setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [phase, countdown]);

  useEffect(() => {
    if (phase !== 'playing') return undefined;

    const timeTimer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timeTimer);
          setPhase('finished');
          playFinishSound();
          confetti({ particleCount: 180, spread: 92, origin: { y: 0.62 } });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const meterTimer = window.setInterval(() => {
      setMeter((prev) => {
        const next = prev + directionRef.current * 12;
        if (next >= 100) {
          directionRef.current = -1;
          return 100;
        }
        if (next <= 0) {
          directionRef.current = 1;
          return 0;
        }
        return next;
      });
    }, 85);

    return () => {
      window.clearInterval(timeTimer);
      window.clearInterval(meterTimer);
    };
  }, [phase]);

  const relayScore = useMemo(
    () => Math.round(distance + successfulPasses * 20 + perfectPasses * 10),
    [distance, successfulPasses, perfectPasses]
  );

  useEffect(() => {
    if (phase !== 'finished' || submittedRef.current) return;

    submittedRef.current = true;
    setSubmitState('submitting');
    submitScore({
      gameKey: 'estafet',
      playerName,
      region,
      score: relayScore,
      detailLabel: 'Operan sukses',
      detailValue: `${successfulPasses}/3 • perfect ${perfectPasses}`,
      verdict: getVerdict(relayScore),
    })
      .then((result) => {
        if (result?.skipped) {
          setSubmitState('missing-config');
          return;
        }
        setSubmitState('saved');
      })
      .catch(() => {
        setSubmitState('error');
      });
  }, [phase, playerName, region, relayScore, successfulPasses, perfectPasses]);

  const passZone = useMemo(() => {
    if (meter >= 44 && meter <= 56) return 'perfect';
    if (meter >= 34 && meter <= 66) return 'good';
    return 'miss';
  }, [meter]);

  const handleStep = (side) => {
    if (phase !== 'playing' || mode !== 'run') return;

    unlockSound();

    if (side === expectedSide) {
      playStepSound();
      const nextStreak = streak + 1;
      const gain = Math.min(8, 4 + Math.floor(nextStreak / 3));
      const rawDistance = Math.min(FINISH_DISTANCE, distance + gain);
      const reachedCheckpoint = nextCheckpoint && rawDistance >= nextCheckpoint;

      setDistance(reachedCheckpoint ? nextCheckpoint : rawDistance);
      setExpectedSide(side === 'left' ? 'right' : 'left');
      setStreak(nextStreak);
      setBestStreak((prev) => Math.max(prev, nextStreak));
      setFlash('clean');

      if (reachedCheckpoint) {
        setMode('pass');
        setStreak(0);
      } else if (rawDistance >= FINISH_DISTANCE) {
        setPhase('finished');
      }
    } else {
      playSlipSound();
      setDistance((prev) => Math.max(0, prev - 5));
      setStreak(0);
      setFlash('slip');
    }

    window.setTimeout(() => setFlash(''), 180);
  };

  const handlePass = () => {
    if (phase !== 'playing' || mode !== 'pass') return;

    unlockSound();

    if (passZone === 'miss') {
      playSlipSound();
      setDistance((prev) => Math.max(0, prev - 6));
      setFlash('slip');
      window.setTimeout(() => setFlash(''), 180);
      return;
    }

    const completedPasses = successfulPasses + 1;
    const checkpointIndex = CHECKPOINTS.indexOf(nextCheckpoint);
    const upcomingCheckpoint = CHECKPOINTS[checkpointIndex + 1] ?? null;

    setSuccessfulPasses(completedPasses);
    playPassSound(passZone === 'perfect');
    if (passZone === 'perfect') {
      setPerfectPasses((prev) => prev + 1);
    }
    setRunnerIndex((prev) => Math.min(4, prev + 1));
    setMode('run');
    setExpectedSide(completedPasses % 2 === 1 ? 'right' : 'left');
    setNextCheckpoint(upcomingCheckpoint);
    setFlash('pass');
    window.setTimeout(() => setFlash(''), 220);
  };

  const resetGame = () => {
    setPhase('countdown');
    setCountdown(3);
    setTimeLeft(TOTAL_TIME);
    setDistance(0);
    setExpectedSide('left');
    setStreak(0);
    setBestStreak(0);
    setRunnerIndex(1);
    setNextCheckpoint(CHECKPOINTS[0]);
    setMode('run');
    setMeter(0);
    directionRef.current = 1;
    setSuccessfulPasses(0);
    setPerfectPasses(0);
    setFlash('');
    setSubmitState('idle');
    submittedRef.current = false;
  };

  const handleShare = async () => {
    setIsSharing(true);
    await shareOrDownloadCertificate('certificate-estafet', playerName, relayScore);
    setIsSharing(false);
  };

  return (
    <main className="flex flex-1 flex-col px-4 pb-4">
      {phase === 'countdown' && (
        <section className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="festival-eyebrow mb-3">Arena 04 • Lari Estafet</p>
          <div className="font-game text-[112px] font-black leading-none text-yellow-300">
            {countdown}
          </div>
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/74">
            Ini arena paling sulit. Kamu harus jaga ritme langkah dan melakukan
            oper baton tepat di zona sempit pada tiap pergantian pelari.
          </p>
        </section>
      )}

      {phase === 'playing' && (
        <section className="flex flex-1 flex-col">
          <div className="grid grid-cols-4 gap-2">
            <div className="festival-stat-card">
              <span>Waktu</span>
              <strong>{timeLeft}s</strong>
            </div>
            <div className="festival-stat-card">
              <span>Skor</span>
              <strong>{relayScore}</strong>
            </div>
            <div className="festival-stat-card">
              <span>Lap</span>
              <strong>{currentLap}/4</strong>
            </div>
            <div className="festival-stat-card">
              <span>Oper</span>
              <strong>{successfulPasses}/3</strong>
            </div>
          </div>

          <div className={`relay-scene mt-4 flex-1 ${flash ? `relay-scene-${flash}` : ''}`}>
            <div className="relay-sky"></div>
            <div className="relay-oval-track">
              <div className="relay-oval-inner"></div>
              <div className="relay-oval-lane relay-oval-lane-1"></div>
              <div className="relay-oval-lane relay-oval-lane-2"></div>
              <div className="relay-oval-lane relay-oval-lane-3"></div>
              <div className="relay-lap-gate"></div>
              <div
                className="relay-lap-runner"
                style={{
                  left: `calc(${12 + distance * 0.72}% - 10px)`,
                }}
              ></div>
              <div className="relay-lap-badges">
                {[1, 2, 3, 4].map((lap) => (
                  <span
                    key={lap}
                    className={`relay-lap-badge ${lap === currentLap ? 'relay-lap-badge-active' : ''} ${
                      lap < currentLap ? 'relay-lap-badge-done' : ''
                    }`}
                  >
                    Lap {lap}
                  </span>
                ))}
              </div>
            </div>
            <div className="relay-track"></div>
            <div className="relay-lanes"></div>
            {CHECKPOINTS.map((checkpoint) => (
              <div
                key={checkpoint}
                className="relay-checkpoint"
                style={{ left: `calc(${checkpoint}% - 1px)` }}
              ></div>
            ))}
            <div className="relay-finish-line"></div>

            <div className="relay-runner" style={{ left: `calc(${distance}% - 24px)` }}>
              <div className={`relay-runner-body ${mode === 'run' ? 'relay-runner-body-run' : ''}`}>
                <span className="relay-runner-baton"></span>
              </div>
            </div>

            <div className="relay-banner">
              <p className="festival-eyebrow mb-1">
                {mode === 'run' ? 'Jaga ritme langkah' : 'Momen oper baton'}
              </p>
              <p className="text-sm font-semibold text-white">
                {mode === 'run' ? (
                  <>
                    Lap {currentLap}/4 • tap giliran{' '}
                    <span className="text-yellow-300">{expectedSide.toUpperCase()}</span>
                  </>
                ) : (
                  <>
                    Akhir lap {currentLap} • zona oper:{' '}
                    <span className="text-yellow-300">{passZone.toUpperCase()}</span>
                  </>
                )}
              </p>
              <p className="mt-1 text-[11px] text-white/62">
                Pelari {runnerIndex} • streak terbaik {bestStreak} • perfect pass {perfectPasses}
              </p>
            </div>

            <div className="relay-meter-shell">
              <div className="relay-meter-track">
                <div className="relay-meter-good-zone"></div>
                <div className="relay-meter-perfect-zone"></div>
                <div className="relay-meter-pointer" style={{ left: `${meter}%` }}></div>
              </div>
            </div>
          </div>

          {mode === 'run' ? (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button type="button" onPointerDown={() => handleStep('left')} className="festival-action-pad">
                Langkah Kiri
              </button>
              <button type="button" onPointerDown={() => handleStep('right')} className="festival-action-pad">
                Langkah Kanan
              </button>
            </div>
          ) : (
            <button type="button" onPointerDown={handlePass} className="festival-primary-button mt-4">
              <Hand className="h-5 w-5" />
              Oper baton sekarang
            </button>
          )}
        </section>
      )}

      {phase === 'finished' && (
        <section className="flex flex-1 flex-col items-center text-center">
          <div className="mb-4">
            <CertificateStory
              id="certificate-estafet"
              name={playerName}
              region={region}
              gameName="Arena 04 • Lari Estafet"
              headline="Relay Race Supreme"
              scoreLabel="Skor estafet"
              scoreValue={relayScore}
              scoreUnit="poin"
              detailLabel="Operan sukses"
              detailValue={`${successfulPasses}/3 • perfect ${perfectPasses}`}
              verdict={getVerdict(relayScore)}
            />
          </div>

          <div className="grid w-full gap-2">
            <button type="button" onClick={handleShare} disabled={isSharing} className="festival-primary-button">
              <Share2 className="h-5 w-5" />
              {isSharing ? 'Memproses poster...' : 'Bagikan hasil arena'}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={resetGame} className="festival-secondary-button">
                <RotateCcw className="h-4 w-4" />
                Main lagi
              </button>
              <button type="button" onClick={onExit} className="festival-ghost-button h-full justify-center">
                Pilih arena lain
              </button>
            </div>

            <p className="text-center text-[12px] text-white/62">
              {submitState === 'submitting' && 'Menyimpan skor ke leaderboard global...'}
              {submitState === 'saved' && 'Skor berhasil tersimpan ke leaderboard global.'}
              {submitState === 'missing-config' && 'Leaderboard global belum aktif di environment ini.'}
              {submitState === 'error' && 'Skor gagal tersimpan. Cek koneksi atau konfigurasi database.'}
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
