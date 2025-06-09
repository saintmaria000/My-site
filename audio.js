let sound, fft, amplitude;

//function preload() {
//  sound = loadSound('music/magiceffect.mp3');
//}

function setupAudio() {
  fft = new p5.FFT();
  amplitude = new p5.Amplitude();
  amplitude.setInput(sound); // ⭐ 重要
  document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById('file-input');
    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        if (sound && sound.isPlaying()) {
          sound.stop();
        }
        sound = loadSound(URL.createObjectURL(file), () => {
          console.log('音声読み込み完了');
          fileName = file.name;  // ← ここでファイル名を保存
          document.getElementById('file-name-display').textContent = `🎵 ${fileName}`;
          sound.play();
        });
      }
    });
  });

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
