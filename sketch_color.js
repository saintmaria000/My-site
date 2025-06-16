function preload() {
  sound = loadSound('music/Synonmy.mp3');
}
const fileName = "Synonmy";

// --- 初期化 ---
function setup() {
  createCanvas(windowWidth, windowHeight); // ← 2D Canvas
  colorMode(HSB, 360, 100, 100, 100);
  setupUI();
  setupAudio();
    // ファイル名を表示
  const nameDisplay = document.getElementById("file-name-display");
  if (nameDisplay) {
    nameDisplay.textContent = `🎵 ${fileName}`;
  }
  
  noFill();
  stroke(255);
  strokeWeight(2);
}

// --- 描画ループ ---
function draw() {

  updateAudio(); // fft.analyze()
  
  drawColorFillSpread();
  drawWaveform();
  //clearWaveformArea();
  
  if (isPlaying()) {
    const waveform = getWaveform();
    const bass = getBass();
    const mid = getMid();
    const hi = getHi();
    const volume = getAmplitude();

    noStroke();
    fill(120, 100, 100); rect(50, height - bass, 30, bass);
    fill(40, 100, 100); rect(100, height - mid, 30, mid);
    fill(340, 100, 100); rect(150, height - hi, 30, hi);

    updateDebugInfo({
      waveformLength: waveform.length,
      isPlaying: true,
      volume: volume.toFixed(2),
      bass: bass.toFixed(1),
      mid: mid.toFixed(1),
      hi: hi.toFixed(1)
    });
  }
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
