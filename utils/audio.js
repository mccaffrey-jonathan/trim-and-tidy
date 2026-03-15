let ctx = null;

function getContext() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function playNoise(duration, filterFreq) {
  const ac = getContext();
  const bufferSize = ac.sampleRate * duration;
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = ac.createBufferSource();
  source.buffer = buffer;

  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = filterFreq;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.3, ac.currentTime);
  gain.gain.linearRampToValueAtTime(0, ac.currentTime + duration);

  source.connect(filter).connect(gain).connect(ac.destination);
  source.start();
}

function playTone(freq, duration, startTime) {
  const ac = getContext();
  const t = startTime || ac.currentTime;
  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = freq;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.2, t);
  gain.gain.linearRampToValueAtTime(0, t + duration);

  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + duration);
}

export function playSnip() {
  playNoise(0.05, 2000);
}

export function playCrunch() {
  playNoise(0.1, 500);
}

export function playDing() {
  playTone(800, 0.1);
}

export function playComplete() {
  const ac = getContext();
  const t = ac.currentTime;
  playTone(523, 0.15, t);       // C5
  playTone(659, 0.15, t + 0.15); // E5
  playTone(784, 0.15, t + 0.3);  // G5
}

export function playFail() {
  const ac = getContext();
  const t = ac.currentTime;
  playTone(392, 0.2, t);       // G4
  playTone(262, 0.2, t + 0.2); // C4
}
