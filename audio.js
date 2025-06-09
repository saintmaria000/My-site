let sound, fft, amplitude;

//function preload() {
//  sound = loadSound('music/magiceffect.mp3');
//}

function setupAudio() {
  fft = new p5.FFT();
  amplitude = new p5.Amplitude();
  amplitude.setInput(sound); // ⭐ 重要

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
