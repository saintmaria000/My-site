// --- グローバル変数 ---
let sound, fft, button, infoDiv;

// --- 音声プリロード ---
function preload() {
  sound = loadSound('music/magiceffect.mp3');
}

// --- 初期化 ---
function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  fft = new p5.FFT();

  button = select('#toggle-btn');
  button.mousePressed(togglePlay);

  infoDiv = createDiv('');
  infoDiv.style('position', 'fixed')
         .style('top', '50%')
         .style('right', '20px')
         .style('transform', 'translateY(-50%)')
         .style('color', '#0f0')
         .style('font-family', 'monospace')
         .style('font-size', '14px')
         .style('background', 'rgba(0, 0, 0, 0.5)')
         .style('padding', '10px')
         .style('border-radius', '6px')
         .style('z-index', '10');

  noFill();
  stroke(255);
  strokeWeight(2);
}

// --- 描画ループ ---
function draw() {
  // FFT入力接続
  if (sound && sound.isPlaying() && fft.input !== sound) {
    fft.setInput(sound);
  }

  // 必須：getEnergy用
  let spectrum = fft.analyze();

  // 虹グラデ背景
  drawGradientBackground();

  // 波形を毎フレームクリアしてから再描画
  clearWaveformArea();

  if (sound && sound.isLoaded()) {
    let waveform = fft.waveform();
    stroke(255);
    noFill();
    beginShape();
    for (let i = 0; i < waveform.length; i++) {
      let x = map(i, 0, waveform.length, 0, width);
      let y = map(waveform[i], -1, 1, 0, height);
      vertex(x, y);
    }
    endShape();

    let bass = fft.getEnergy(20, 150);
    let mid = fft.getEnergy(150, 4000);
    let hi  = fft.getEnergy(4000, 12000);

    noStroke();
    fill(0, 255, 128);   rect(50,  height - bass, 30, bass);
    fill(255, 180, 0);   rect(100, height - mid, 30, mid);
    fill(255, 50, 100);  rect(150, height - hi, 30, hi);

    infoDiv.html(`
      waveform.length: ${waveform.length}<br/>
      isPlaying: ${sound.isPlaying()}<br/>
      volume: ${sound.getVolume().toFixed(2)}<br/>
      bass: ${bass.toFixed(1)}<br/>
      mid: ${mid.toFixed(1)}<br/>
      hi: ${hi.toFixed(1)}<br/>
    `);
  }
}

// --- 虹グラデーション背景 ---
function drawGradientBackground() {
  let baseY = height / 2;
  let speed = 2, layers = 300, max = height / 2, cycle = max;
  let spread = frameCount * speed % (max + cycle);
  let hueOld = (frameCount * 0.5) % 360;
  let hueNew = (hueOld + 60) % 360;

  for (let i = 0; i < layers; i++) {
    let offset = i * (max / layers);
    let t = offset / spread;
    if (t > 1) continue;
    let hue = lerp(hueNew, hueOld, t);
    let alpha = map(t, 0, 1, 30, 0);
    fill(hue, 80, 60, alpha);
    noStroke();
    rect(0, baseY - offset, width, 1);
    rect(0, baseY + offset, width, 1);
  }
}

// --- 波形の残像クリア（背景は消さない） ---
function clearWaveformArea() {
  fill(0, 0, 0, 80); // HSBモードで透明な黒
  noStroke();
  rect(0, 0, width, height);
}

// --- 再生/停止切り替え ---
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

// --- ウィンドウリサイズ対応 ---
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
