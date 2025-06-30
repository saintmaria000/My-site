let sound, fft, amplitude;

let previousEnergy = { bass: 0, mid: 0, hi: 0 };
let currentEnergy = { bass: 0, mid: 0, hi: 0 };

const noiseFloor = {
  bass: 20,
  mid: 30,
  hi: 15
};

// 閾値設定（生エネルギー + 差分）
const thresholds = {
  bass: { energy: 60, diff: 15 },
  mid: { energy: 40, diff: 12 },
  hi: { energy: 25, diff: 8 }
};

function setupAudio() {
  fft = new p5.FFT();
  amplitude = new p5.Amplitude();
  const button = select('#toggle-btn');
  button.mousePressed(togglePlay);
}

function togglePlay() {
  getAudioContext().resume().then(() => {
    if (!sound || !sound.isLoaded()) return;
    if (sound.isPlaying()) {
      sound.setVolume(0, 1);
      setTimeout(() => {
        sound.stop();
        sound.setVolume(1);
      }, 1000);
    } else {
      sound.setVolume(0);
      sound.play();
      setTimeout(() => fft.setInput(sound), 100);
      sound.setVolume(1, 1);
    }
  });
}

function updateAudio() {
  if (sound && sound.isPlaying() && fft.input !== sound) {
    fft.setInput(sound);
  }
  fft.analyze();

  // エネルギー更新（前回との差を保存）
  previousEnergy.bass = currentEnergy.bass;
  previousEnergy.mid = currentEnergy.mid;
  previousEnergy.hi = currentEnergy.hi;

  currentEnergy.bass = getCleanBass();
  currentEnergy.mid = getCleanMid();
  currentEnergy.hi = getCleanHi();
}

// --- 音量関連 ---
function getVolumeLevel() {
  return amplitude.getLevel();
}
function getWaveform() {
  return fft.waveform();
}
function getSpectrum() {
  return fft.analyze();
}
function isPlaying() {
  return sound && sound.isPlaying();
}

// --- 生エネルギー取得 ---
function getBass() {
  return fft.getEnergy(20, 150);
}
function getMid() {
  return fft.getEnergy(150, 4000);
}
function getHi() {
  return fft.getEnergy(4000, 12000);
}

// --- ノイズ除去後のエネルギー ---
function getCleanBass() {
  return Math.max(0, getBass() - noiseFloor.bass);
}
function getCleanMid() {
  return Math.max(0, getMid() - noiseFloor.mid);
}
function getCleanHi() {
  return Math.max(0, getHi() - noiseFloor.hi);
}

// --- 差分取得 ---
function getBassDiff() {
  return currentEnergy.bass - previousEnergy.bass;
}
function getMidDiff() {
  return currentEnergy.mid - previousEnergy.mid;
}
function getHiDiff() {
  return currentEnergy.hi - previousEnergy.hi;
}

// --- 判定関数（精度調整済） ---
function isKick() {
  return (
    currentEnergy.bass > thresholds.bass.energy &&
    getBassDiff() > thresholds.bass.diff
  );
}

function isSnare() {
  return (
    currentEnergy.mid > thresholds.mid.energy &&
    getMidDiff() > thresholds.mid.diff
  );
}

function isHat() {
  return (
    currentEnergy.hi > thresholds.hi.energy &&
    getHiDiff() > thresholds.hi.diff
  );
}
