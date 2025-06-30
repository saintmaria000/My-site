let sound, fft, amplitude;

const noiseFloor = {
  bass: 30,
  mid: 40,
  hi: 20
};

const kickThreshold = 80;  // 四つ打ち感知のベースエネルギー閾値

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
}

// --- 通常の生値取得 ---
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

// --- 帯域の生値取得 ---
function getBass() {
  return fft.getEnergy(20, 150);
}

function getMid() {
  return fft.getEnergy(150, 4000);
}

function getHi() {
  return fft.getEnergy(4000, 12000);
}

// --- ノイズ除去済み帯域 ---
function getCleanBass() {
  return Math.max(0, getBass() - noiseFloor.bass);
}

function getCleanMid() {
  return Math.max(0, getMid() - noiseFloor.mid);
}

function getCleanHi() {
  return Math.max(0, getHi() - noiseFloor.hi);
}

// --- キック検出（四つ打ち感知） ---
function isKick() {
  return getBass() > kickThreshold;
}
