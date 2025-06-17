let sound, fft, amplitude;

/**
 * サウンドとFFT初期化、UIイベントも設定
 */
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

// --- 以下：他ファイルから使える音情報取得関数たち ---

function updateAudio() {
  if (sound && sound.isPlaying() && fft.input !== sound) {
  fft.setInput(sound);
  } 
  fft.analyze();
}

function getVolumeLevel() {
  return amplitude.getLevel();
}

function getSpectrum() {
  return fft.analyze(); // 配列
}

function getWaveform() {
  return fft.waveform();
}

function getBass() {
  return fft.getEnergy(20, 150);
}

function getMid() {
  return fft.getEnergy(150, 4000);
}

function getHi() {
  return fft.getEnergy(4000, 12000);
}

function getAmplitude() {
  return amplitude.getLevel();
}

function isPlaying() {
  return sound && sound.isPlaying();
}
