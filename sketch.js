// --- グローバル変数 ---
let sound, fft, button, infoDiv;

// --- 音声プリロード（最初にロードする曲）---
function preload() {
  sound = loadSound('music/magiceffect.mp3');
}

// --- 初期設定 ---
function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100); // HSBで色操作を柔軟に

  fft = new p5.FFT(); // 周波数解析器

  // 再生ボタン設定
  button = select('#toggle-btn');
  button.mousePressed(togglePlay);

  // デバッグUIのスタイル構築
  infoDiv = createDiv('').style('position', 'fixed')
    .style('top', '50%').style('right', '20px')
    .style('transform', 'translateY(-50%)')
    .style('color', '#0f0').style('font-family', 'monospace')
    .style('font-size', '14px').style('background', 'rgba(0, 0, 0, 0.5)')
    .style('padding', '10px').style('border-radius', '6px')
    .style('z-index', '10');

  noFill();  // 初期化
  stroke(255);
  strokeWeight(2);
}

// --- 毎フレーム描画処理 ---
function draw() {
  // 再生中かつ接続が切れていたらFFTに再接続
  if (sound && sound.isPlaying() && fft.input !== sound) {
    fft.setInput(sound);
  }

  // getEnergyが有効になる解析呼び出し（重要！）
  let spectrum = fft.analyze();

  clearWaveformArea();       // 背景を消さずに波形だけクリア
  drawGradientBackground();  // 背景に虹グラデーションを描画

  if (sound && sound.isLoaded()) {
    let waveform = fft.waveform(); // 波形データ取得
    stroke(255);
    noFill();

    // 👇 横幅は画面全体、高さ方向は中央寄せで滑らかに
    beginShape();
    for (let i = 0; i < waveform.length; i++) {
      let x = map(i, 0, waveform.length, 0, width); // 横幅いっぱい
      let y = map(waveform[i], -1, 1, height * 0.25, height * 0.75); // 上下にゆとり
      curveVertex(x, y); // 滑らかな曲線
    }
    endShape();

    // 👇 各帯域のエネルギー取得（独自に周波数範囲を設定）
    let bass = fft.getEnergy(20, 150);       // 低域
    let mid  = fft.getEnergy(150, 4000);     // 中域
    let hi   = fft.getEnergy(4000, 12000);   // 高域

    // 👇 可視化バー（左下）
    noStroke();
    fill(0, 255, 128);   rect(50,  height - bass, 30, bass);
    fill(255, 180, 0);   rect(100, height - mid,  30, mid);
    fill(255, 50, 100);  rect(150, height - hi,   30, hi);

    // デバッグ表示更新
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

// --- 中央から広がる虹グラデーション背景 ---
function drawGradientBackground() {
  let baseY = height / 2;
  let speed = 0.8;        // 拡がる速さ
  let layers = 500;       // レイヤーの密度（多いほどなめらか）
  let max = height / 2;
  let cycle = max * 1.5;
  let spread = frameCount * speed % (max + cycle); // 拡がりの進行度

  let hueNew = (frameCount * 0.2) % 360;      // 新しい色（HSBで周期的に変化）
  let hueOld = (hueNew + 30) % 360;           // 混ぜる旧色（次の色）

  for (let i = 0; i < layers; i++) {
    let offset = i * (max / layers);
    let progress = offset / spread;

    if (progress > 1) continue; // まだ拡がっていない層は描かない

    // グラデ境界だけ色を混ぜる、それ以外はほぼ単色
    let gradStart = 0.95;
      let t = constrain(map(progress, gradStart, 1, 1, 0), 0, 1);
    let hue = (progress > gradStart)
      ? lerpHue(hueOld, hueNew, pow(t, 2))
      : hueNew;

    let alpha = map(progress, 0, 1, 70, 0); // 徐々に薄く
    fill(hue, 100, 80, alpha);             // 彩度高めで鮮やかに
    noStroke();
    rect(0, baseY - offset, width, 1);
    rect(0, baseY + offset, width, 1);
  }
}
// --- 色相環補間（360度対応のlerp） ---
function lerpHue(a, b, t) {
  let d = b - a;
  if (abs(d) > 180) {
    if (d > 0) {
      a += 360;
    } else {
      b += 360;
    }
  }
  return (lerp(a, b, t) + 360) % 360;
}

// --- 波形エリアだけを消す（残像防止）---
function clearWaveformArea() {
  fill(0, 0, 0, 80); // HSBの透明な黒
  noStroke();
  rect(0, 0, width, height);
}

// --- 再生/停止切り替え（フェード付）---
function togglePlay() {
  getAudioContext().resume().then(() => {
    if (!sound || !sound.isLoaded()) return;

    if (sound.isPlaying()) {
      sound.setVolume(0, 1); // フェードアウト
      setTimeout(() => {
        sound.stop();
        sound.setVolume(1);
      }, 1000);
    } else {
      sound.setVolume(0);
      sound.play();
      setTimeout(() => fft.setInput(sound), 100); // 再接続（GitHub対策）
      sound.setVolume(1, 1); // フェードイン
    }
  });
}

// --- ウィンドウリサイズ対応 ---
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
