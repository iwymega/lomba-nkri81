import React from 'react';

export default function CertificateStory({
  id,
  name,
  region,
  gameName,
  headline,
  scoreLabel,
  scoreValue,
  scoreUnit,
  detailLabel,
  detailValue,
  verdict,
}) {
  return (
    <div
      id={id}
      className="h-[640px] w-[360px] overflow-hidden rounded-[28px] border border-white/12 bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.18),_transparent_38%),linear-gradient(180deg,_#66131b,_#220c10_72%)] p-3 text-white"
      style={{ aspectRatio: '9 / 16' }}
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-4 py-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(255,255,255,0.14),transparent_24%),radial-gradient(circle_at_82%_0%,rgba(250,204,21,0.18),transparent_22%)]"></div>
        <div className="absolute left-0 top-0 h-2 w-full bg-white"></div>
        <div className="absolute left-0 top-2 h-2 w-full bg-red-600"></div>

        <div className="relative z-10 text-center">
          <div className="mb-3 flex justify-center">
            <div className="rounded-[20px] bg-white px-2.5 py-1.5 shadow-[0_16px_34px_rgba(0,0,0,0.18)]">
              <img
                src="/HUTRI81.png"
                alt="Logo resmi HUT RI ke-81"
                className="h-12 w-auto object-contain"
              />
            </div>
          </div>
          <span className="inline-flex rounded-full border border-yellow-200/70 bg-yellow-300 px-3 py-1 text-[9px] font-black uppercase tracking-[0.28em] text-red-950">
            Identitas Resmi HUT RI ke-81
          </span>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.28em] text-yellow-300/80">
            {gameName}
          </p>
          <h2 className="mt-1.5 font-game text-[30px] font-black leading-none text-white">
            {headline}
          </h2>
          <p className="mx-auto mt-1.5 max-w-[240px] text-[10px] leading-4 text-white/68">
            Sertifikat digital hasil arena 17-an yang siap dibagikan ke story.
          </p>
        </div>

        <div className="relative z-10 mt-4 rounded-[24px] border border-yellow-200/45 bg-white px-4 py-4 text-slate-900 shadow-[0_22px_44px_rgba(0,0,0,0.24)]">
          <div className="border-b border-slate-200 pb-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
              Diberikan kepada
            </p>
            <h3 className="mt-1.5 px-2 font-game text-[24px] font-black leading-tight text-red-600">
              {name || 'Pemain Merdeka'}
            </h3>
            <p className="mt-1.5 min-h-[16px] text-[11px] font-semibold text-slate-500">
              {region || 'Komunitas Merdeka Indonesia'}
            </p>
          </div>

          <div className="mt-3 rounded-[20px] bg-red-50 px-4 py-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-red-500">
              {scoreLabel}
            </p>
            <div className="mt-1.5 flex items-end justify-center gap-2">
              <p className="font-game text-[42px] font-black leading-none text-red-600">
                {scoreValue}
              </p>
              <p className="pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                {scoreUnit}
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <div className="rounded-[18px] border border-slate-200 px-3 py-2.5 text-left">
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Detail arena
              </p>
              <p className="mt-1.5 text-[12px] font-semibold leading-[1.15rem] text-slate-700">
                {detailLabel}
              </p>
            </div>
            <div className="rounded-[18px] border border-slate-200 px-3 py-2.5 text-left">
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Hasil utama
              </p>
              <p className="mt-1.5 font-game text-lg font-black leading-none text-slate-900">
                {detailValue}
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-[20px] border border-yellow-300/80 bg-yellow-300 px-4 py-3 text-center text-red-950">
            <p className="text-[9px] font-bold uppercase tracking-[0.24em]">
              Gelar malam ini
            </p>
            <p className="mt-1 font-game text-[18px] font-black leading-tight">
              {verdict}
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-auto pt-3 text-center">
          <p className="text-[13px] font-bold text-yellow-300">
            Tantang temanmu di arena yang sama.
          </p>
          <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/60">
            festival-17an-digital • 14 Agustus 2026
          </p>
        </div>
      </div>
    </div>
  );
}
