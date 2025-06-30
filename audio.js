let sound, fft, amplitude;

// ノイズフロア（平均的な環境ノイズの基準値）
const noiseFloor = {
  bass: 30,
  mid: 40,
  hi: 20
};

// トランジェント検出のための履歴
const historySize = 10;
let bassHistory = [];
let midHistory = [];
let hiHistory = [];

// トランジェント感知のしきい値（感度）
const kickSensitivity = 1.5;
const snareSensitivity = 1.4;
const hatSensitivity = 1.3;

function setupAudio() {
  fft = new p5.FFT();
  amplitude = new p5.Amplitude();
  let button = select('#toggle-btn');
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

  // 履歴更新
  bassHistory.push(getBass());
  if (bassHistory.length > historySize) bassHistory.shift();

  midHistory.push(getMid());
  if (midHistory.length > historySize) midHistory.shift();

  hiHistory.push(getHi());
  if (hiHistory.length > historySize) hiHistory.shift();
}

// ----------------------------
// 基本情報取得
// ----------------------------

function getSpectrum() {
  return fft.analyze();
}

function getWaveform() {
  return fft.waveform();
}

function getAmplitude() {
  return amplitude.getLevel();
}

function getVolumeLevel() {
  return amplitude.getLevel();
}

function isPlaying() {
  return sound && sound.isPlaying();
}

// ----------------------------
// 各帯域のエネルギー取得
// ----------------------------

function getBass() {
  return fft.getEnergy(20, 150);
}

function getMid() {
  return fft.getEnergy(150, 4000);
}

function getHi() {
  return fft.getEnergy(4000, 12000);
}

function getCleanBass() {
  return Math.max(0, getBass() - noiseFloor.bass);
}

function getCleanMid() {
  return Math.max(0, getMid() - noiseFloor.mid);
}

function getCleanHi() {
  return Math.max(0, getHi() - noiseFloor.hi);
}

// ----------------------------
// トランジェント（瞬間的ピーク）検出
// ----------------------------

function isTransient(current, history, sensitivity) {
  if (history.length === 0) return false;
  const avg = history.reduce((a, b) => a + b, 0) / history.length;
  return current > avg * sensitivity;
}

function isKick() {
  return isTransient(getCleanBass(), bassHistory, kickSensitivity);
}

function isSnare() {
  return isTransient(getCleanMid(), midHistory, snareSensitivity);
}

function isHat() {
  return isTransient(getCleanHi(), hiHistory, hatSensitivity);
}
