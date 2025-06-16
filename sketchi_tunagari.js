// --- グローバル変数 ---
let particles = [];
let numParticles = 150;
let fft;
let audio;
let currentVisual = 'otonoami'; // 音の網
const fileName = "magiceffect";
function preload() {
  sound = loadSound('music/magiceffect.mp3'); // 音楽ファイルをここに
}

// --- 初期化 ---
function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL); // ← 3Dモード
  colorMode(HSB, 360, 100, 100, 100);
  setupUI();
  setupAudio();
  initGalaxyStars();
  
  // ファイル名を表示
  const nameDisplay = document.getElementById("file-name-display");
  if (nameDisplay) {
    nameDisplay.textContent = `🎵 ${fileName}`;
  }
  
  noFill();
  stroke(255);
  strokeWeight(2);
  }

  for (let i = 0; i < numParticles; i++) {
    let angle = random(TWO_PI);
    let z = random(-200, 200);
    let radius = 200;
    let x = radius * cos(angle);
    let y = radius * sin(angle);
    particles.push(new Particle(createVector(x, y, z)));
  }

// --- 描画ループ ---
function draw() {
  if (sound && sound.isPlaying() && fft.input !== sound) {
    fft.setInput(sound);
  }

  fft.analyze();
  background(0);
  let spectrum = fft.analyze();

  if (currentVisual === 'otonoami') {
    drawOtonoamiVisual(spectrum);
  }

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







