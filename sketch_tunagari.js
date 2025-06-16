// --- グローバル変数 ---
const fileName = "magiceffect";
let currentVisual = "otonoami"; // 音の網モード
let particles = [];
let numParticles = 150;
let fft;
let sound;

function preload() {
  sound = loadSound('music/magiceffect.mp3'); // 音楽ファイルをここに
}

// --- 初期化 ---
function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  colorMode(HSB, 360, 100, 100, 100);
  setupUI();
  setupAudio();

  // ↓ Galaxy不要な場合はコメントアウト
  // initGalaxyStars();

  // ファイル名を表示
  const nameDisplay = document.getElementById("file-name-display");
  if (nameDisplay) {
    nameDisplay.textContent = `🎵 ${fileName}`;
  }

  noFill();
  stroke(255);
  strokeWeight(2);

  // パーティクル初期化
  for (let i = 0; i < numParticles; i++) {
    let angle = random(TWO_PI);
    let z = random(-200, 200);
    let radius = 200;
    let x = radius * cos(angle);
    let y = radius * sin(angle);
    particles.push(new Particle(createVector(x, y, z)));
  }
}

// --- 描画ループ ---
function draw() {
  if (sound && sound.isPlaying() && fft.input !== sound) {
    fft.setInput(sound);
  }

  background(0);
  fft.analyze();
  let spectrum = fft.analyze();

  if (currentVisual === 'otonoami') {
    drawOtonoamiVisual(spectrum);
  }

  // デバッグ情報表示
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
