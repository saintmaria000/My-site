// --- グローバル変数 ---
let currentVisual = 2;

// --- 初期化 ---
function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL); // ← 3Dモード
  colorMode(HSB, 360, 100, 100, 100);
  setupUI();
  setupAudio();
  initGalaxyStars();

  noFill();
  stroke(255);
  strokeWeight(2);
}

// --- 描画ループ ---
function draw() {
  if (sound && sound.isPlaying() && fft.input !== sound) {
    fft.setInput(sound);
  }

  fft.analyze();
  background(0);
  ambientLight(150); // 柔らかい全体光（必須）
  pointLight(255, 255, 255, 0, 0, 0); // 中央から白い光を放つ
  drawGalaxyVisual(); // visual2.js の関数を実行

  if (sound && sound.isLoaded()) {
    const waveform = fft.waveform();
    const bass = fft.getEnergy(20, 150);
    const mid = fft.getEnergy(150, 4000);
    const hi = fft.getEnergy(4000, 12000);

    updateDebugInfo({
      waveformLength: waveform.length,
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
