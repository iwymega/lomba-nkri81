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
      className="h-[640px] w-[360px] overflow-hidden border border-[#d6b25e] bg-[linear-gradient(180deg,#70141c_0%,#4b0f16_32%,#23080d_100%)] p-2 text-white"
      style={{ aspectRatio: '9 / 16' }}
    >
      <div className="relative flex h-full flex-col border border-[#d6b25e]/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-3 py-2.5">
        <div className="absolute inset-[6px] border border-white/8"></div>
        <div className="absolute left-0 top-0 h-1.5 w-full bg-white"></div>
        <div className="absolute left-0 top-1.5 h-1.5 w-full bg-red-600"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_24%),linear-gradient(180deg,transparent,rgba(0,0,0,0.14))]"></div>

        <div className="relative z-10 border border-white/10 bg-black/10 px-3 py-2 text-center">
          <div className="mb-1.5 flex justify-center">
            <div className="border border-[#d6b25e]/70 bg-white px-2 py-1">
              <img
                src="/HUTRI81.png"
                alt="Logo resmi HUT RI ke-81"
                className="h-9 w-auto object-contain"
              />
            </div>
          </div>

          <p className="text-[8px] font-bold uppercase tracking-[0.34em] text-[#f4d88a]">
            HUT Republik Indonesia ke-81
          </p>
          <h2 className="mt-1.5 font-game text-[26px] font-black leading-none text-white">
            SERTIFIKAT
          </h2>
          <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/70">
            Festival Lomba 17-an Digital
          </p>
        </div>

        <div className="relative z-10 mt-2.5 border border-[#d6b25e]/50 bg-white px-3 py-2.5 text-slate-900 shadow-[0_16px_34px_rgba(0,0,0,0.2)]">
          <div className="border-b border-slate-200 pb-2 text-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-slate-500">
              Penghargaan Resmi Arena
            </p>
            <p className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-red-600">
              {gameName}
            </p>
            <h3 className="mt-1.5 px-1 font-game text-[21px] font-black leading-tight text-slate-900 break-words">
              {headline}
            </h3>
          </div>

          <div className="mt-2.5 text-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-slate-400">
              Diberikan kepada
            </p>
            <h4 className="mt-1.5 border-b border-dashed border-slate-300 px-1 pb-1.5 font-game text-[22px] font-black leading-tight text-red-600 break-words">
              {name || 'Pemain Merdeka'}
            </h4>
            <p className="mt-1 min-h-[14px] px-1 text-[10px] font-semibold leading-4 text-slate-500 break-words">
              {region || 'Komunitas Merdeka Indonesia'}
            </p>
          </div>

          <div className="mt-2.5 grid grid-cols-[1.15fr_0.85fr] gap-2">
            <div className="border border-red-100 bg-red-50 px-2.5 py-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-red-500">
                {scoreLabel}
              </p>
              <div className="mt-1 flex items-end gap-2">
                <p className="font-game text-[34px] font-black leading-none text-red-600">
                  {scoreValue}
                </p>
                <p className="pb-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  {scoreUnit}
                </p>
              </div>
            </div>

            <div className="border border-slate-200 px-2.5 py-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Hasil Utama
              </p>
              <p className="mt-1.5 font-game text-[16px] font-black leading-tight text-slate-900 break-words">
                {detailValue}
              </p>
            </div>
          </div>

          <div className="mt-2 border border-slate-200 px-2.5 py-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Detail Arena
            </p>
            <p className="mt-1 text-[11px] font-semibold leading-[1rem] text-slate-700 break-words">
              {detailLabel}
            </p>
          </div>

          <div className="mt-2 border border-[#d6b25e] bg-[#f4d88a] px-2.5 py-2 text-center text-[#60131a]">
            <p className="text-[8px] font-bold uppercase tracking-[0.28em]">
              Gelar Kehormatan
            </p>
            <p className="mt-1 px-1 font-game text-[16px] font-black leading-tight break-words">
              {verdict}
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-2.5 grid grid-cols-2 gap-2 text-white">
          <div className="border border-white/10 bg-black/10 px-2.5 py-1.5">
            <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-white/55">
              Nomor Arsip
            </p>
            <p className="mt-1 text-[9px] font-semibold tracking-[0.12em] text-[#f4d88a]">
              F17D-081-2026
            </p>
          </div>
          <div className="border border-white/10 bg-black/10 px-2.5 py-1.5 text-right">
            <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-white/55">
              Tanggal
            </p>
            <p className="mt-1 text-[9px] font-semibold tracking-[0.12em] text-[#f4d88a]">
              17 Agustus 2026
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-auto border-t border-[#d6b25e]/35 pt-1.5 text-center">
          <p className="px-1 text-[10px] font-bold leading-4 text-[#f4d88a]">
            Tantang temanmu dan bagikan ke Instagram Story.
          </p>
          <p className="mt-1 text-[7px] font-semibold uppercase tracking-[0.2em] text-white/58">
            festival-17an-digital • identitas resmi peringatan nasional
          </p>
        </div>
      </div>
    </div>
  );
}
