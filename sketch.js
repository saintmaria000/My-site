// --- グローバル変数 ---
let sound, fft, button, infoDiv;
let colorSpread = 0;        // 拡がり量
let colorCycle = 0;         // 現在の色番号
let currentHue = 0;
let nextHue = 60;
let spreading = true;

// --- 音声ファイルのプリロード ---
function preload() {
  sound = loadSound('music/magiceffect.mp3');
}

// --- 初期化処理 ---
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
  // FFTの入力を毎フレーム明示
  if (sound && sound.isPlaying() && fft.input !== sound) {
    fft.setInput(sound);
  }

  // スペクトラム解析（getEnergy有効化）
  fft.analyze();

  // 背景描画：単色が上下に拡がりながら塗り替える
  drawColorFillSpread();

  // 波形領域をクリア（背景は保持）
  clearWaveformArea();

  // 波形＆スペクトル描画
  if (sound && sound.isLoaded()) {
    let waveform = fft.waveform();

    stroke(255);
    noFill();
    beginShape();
    for (let i = 0; i < waveform.length; i++) {
      let x = map(i, 0, waveform.length, 0, width);
      let y = map(waveform[i], -1, 1, height * 0.25, height * 0.75);
      curveVertex(x, y);
    }
    endShape();

    let bass = fft.getEnergy(20, 150);
    let mid = fft.getEnergy(150, 4000);
    let hi = fft.getEnergy(4000, 12000);

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

// --- 中央線から単色が上下に拡がる描画 ---
function drawColorFillSpread() {
  let baseY = height / 2;
  let step = 4;               // 拡がり速度（大きくすると速くなる）
  let maxOffset = height / 2;

  fill(currentHue, 100, 80, 100);
  noStroke();

  for (let offset = 0; offset <= colorSpread; offset += 1) {
    rect(0, baseY - offset, width, 1);
    rect(0, baseY + offset, width, 1);
  }

  // 拡がりを進める
  if (spreading) {
    colorSpread += step;

    // 全画面覆ったら次の色に切り替え
    if (colorSpread >= maxOffset) {
      colorSpread = 0;
      currentHue = nextHue;
      nextHue = (nextHue + 60) % 360;
    }
  }
}

// --- 残像のある波形をリセット（背景は残す） ---
function clearWaveformArea() {
  fill(0, 0, 0, 80); // HSBで透明な黒
  noStroke();
  rect(0, 0, width, height);
}

// --- 再生切り替え ---
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

// --- リサイズ対応 ---
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
