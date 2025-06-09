// --- グローバル変数 ---
let currentVisual = 1;  // 1 = colorSpread, 2 = galaxy

// --- 初期化 ---
function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL); // galaxy用にWEBGL
  colorMode(HSB, 360, 100, 100, 100);

  setupUI();       // UI要素
  setupAudio();    // 音源とFFT

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

  // --- Visual 切り替え処理 ---
  if (currentVisual === 1) {
    drawColorFillSpread();
    drawWaveform();
  } else if (currentVisual === 2) {
    drawGalaxyVisual();  // visual2.js の関数
  }

  // --- 共通のスペクトラム情報・デバッグ ---
  if (sound && sound.isLoaded()) {
    const waveform = fft.waveform();
    const bass = fft.getEnergy(20, 150);
    const mid  = fft.getEnergy(150, 4000);
    const hi   = fft.getEnergy(4000, 12000);

    if (currentVisual === 1) {
      noStroke();
      fill(0, 255, 128);   rect(-width/2 + 50,  height/2 - bass, 30, bass);
      fill(255, 180, 0);   rect(-width/2 + 100, height/2 - mid, 30, mid);
      fill(255, 50, 100);  rect(-width/2 + 150, height/2 - hi, 30, hi);
    }

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

// --- Visual 切り替え用 ---
function switchVisual(mode) {
  currentVisual = mode;
}

// --- ウィンドウリサイズ対応 ---
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
