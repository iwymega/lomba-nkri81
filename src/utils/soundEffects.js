let audioContext = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  return audioContext;
}

function playTone({
  frequency = 440,
  type = 'sine',
  duration = 0.08,
  volume = 0.04,
  when = 0,
  sweepTo = null,
}) {
  const context = getAudioContext();
  if (!context) return;

  const start = context.currentTime + when;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  if (sweepTo) {
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(1, sweepTo),
      start + duration
    );
  }

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

export async function unlockSound() {
  const context = getAudioContext();
  if (!context) return;

  if (context.state === 'suspended') {
    await context.resume();
  }
}

export async function playStepSound() {
  await unlockSound();
  playTone({ frequency: 210, type: 'triangle', duration: 0.07, volume: 0.028, sweepTo: 170 });
}

export async function playSlipSound() {
  await unlockSound();
  playTone({ frequency: 160, type: 'sawtooth', duration: 0.09, volume: 0.022, sweepTo: 90 });
}

export async function playPassSound(isPerfect = false) {
  await unlockSound();
  playTone({ frequency: isPerfect ? 720 : 560, type: 'square', duration: 0.07, volume: 0.028, sweepTo: isPerfect ? 920 : 700 });
  playTone({ frequency: isPerfect ? 920 : 700, type: 'triangle', duration: 0.11, volume: 0.018, when: 0.05 });
}

export async function playCountdownSound(tick) {
  await unlockSound();
  const isStart = tick === 0;
  playTone({
    frequency: isStart ? 880 : 520 + tick * 30,
    type: isStart ? 'square' : 'triangle',
    duration: isStart ? 0.12 : 0.07,
    volume: isStart ? 0.032 : 0.02,
    sweepTo: isStart ? 1120 : null,
  });
}

export async function playFinishSound() {
  await unlockSound();
  playTone({ frequency: 520, type: 'triangle', duration: 0.08, volume: 0.026 });
  playTone({ frequency: 660, type: 'triangle', duration: 0.08, volume: 0.026, when: 0.08 });
  playTone({ frequency: 880, type: 'square', duration: 0.15, volume: 0.03, when: 0.16, sweepTo: 1040 });
}

export async function playLaneSound() {
  await unlockSound();
  playTone({ frequency: 320, type: 'triangle', duration: 0.08, volume: 0.02, sweepTo: 480 });
}

export async function playJumpSound() {
  await unlockSound();
  playTone({ frequency: 240, type: 'sine', duration: 0.18, volume: 0.026, sweepTo: 650 });
}

export async function playHitSound() {
  await unlockSound();
  playTone({ frequency: 160, type: 'sawtooth', duration: 0.24, volume: 0.02, sweepTo: 35 });
}

export async function playCoinSound() {
  await unlockSound();
  playTone({ frequency: 750, type: 'sine', duration: 0.1, volume: 0.024, sweepTo: 1150 });
}
