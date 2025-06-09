function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  setupUI();
  setupAudio();
  noFill();
  stroke(255);
  strokeWeight(2);
}

function draw() {
  if (sound && sound.isPlaying() && fft.input !== sound) {
    fft.setInput(sound);
  }

  fft.analyze();
  drawColorFillSpread();
  clearWaveformArea();

  if (sound && sound.isLoaded()) {
    drawWaveform();

    const bass = fft.getEnergy(20, 150);
    const mid = fft.getEnergy(150, 4000);
    const hi = fft.getEnergy(4000, 12000);

    noStroke();
    fill(0, 255, 128); rect(50,  height - bass, 30, bass);
    fill(255, 180, 0); rect(100, height - mid, 30, mid);
    fill(255, 50, 100); rect(150, height - hi, 30, hi);

    updateDebugInfo({
      waveformLength: fft.waveform().length,
      isPlaying: sound.isPlaying(),
      volume: sound.getVolume().toFixed(2),
      bass: bass.toFixed(1),
      mid: mid.toFixed(1),
      hi: hi.toFixed(1)
    });
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
