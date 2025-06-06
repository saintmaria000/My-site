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

  // 波形を毎フレームクリアしてから再描画
  clearWaveformArea();

  // 虹グラデ背景
  drawGradientBackground();

  if (sound && sound.isLoaded()) {
    let waveform = fft.waveform();
    stroke(255);
    noFill();
    let displayWidth = width * 0.6;  
    
    beginShape();
    for (let i = 0; i < waveform.length; i++) {
      let x = map(i, 0, waveform.length, 0, width);
      let y = map(waveform[i], -1, 1, height * 0.25, height * 0.75);
      curveVertex(x, y);
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
  let speed = 0.8;                 // ゆっくり広がる
  let layers = 300;
  let max = height / 2;
  let cycle = max * 1.5;           // 拡がる距離＋遷移領域
  let spread = frameCount * speed % (max + cycle);

  // 色のループ（赤→黄→緑→青→紫→赤）
  let hueNew = (frameCount * 0.2) % 360;
  let hueOld = (hueNew + 30) % 360; // 次の色と混ぜる差分（柔らかめ）

  for (let i = 0; i < layers; i++) {
    let offset = i * (max / layers);
    let progress = offset / spread;

    if (progress > 1) continue;

    // 色の境界付近のみグラデーション、それ以外は単色に近く
    let gradStart = 0.85;
    let hue = (progress > gradStart)
      ? lerp(hueOld, hueNew, map(progress, gradStart, 1, 1, 0))
      : hueNew;

    let alpha = map(progress, 0, 1, 30, 0);
    fill(hue,100, 60, alpha); // 彩度低めで優しく
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
