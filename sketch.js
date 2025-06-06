/// --- グローバル変数 ---
let sound;       // 音源
let fft;         // FFT解析用
let button;      // 再生ボタン
let infoDiv;     // 音声情報表示用div

/// --- 音声ファイルのプリロード（初期音源を読み込む） ---
function preload() {
  sound = loadSound('music/magiceffect.mp3');
}

/// --- セットアップ処理（初期化） ---
function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);  // 背景を虹色グラデ用にHSBに設定

  fft = new p5.FFT();

  button = select('#toggle-btn');
  button.mousePressed(togglePlay);

  // 音のデバッグ情報表示UI
  infoDiv = createDiv('');
  infoDiv.style('position', 'fixed');
  infoDiv.style('top', '50%');
  infoDiv.style('right', '20px');
  infoDiv.style('transform', 'translateY(-50%)');
  infoDiv.style('color', '#0f0');
  infoDiv.style('font-family', 'monospace');
  infoDiv.style('font-size', '14px');
  infoDiv.style('background', 'rgba(0, 0, 0, 0.5)');
  infoDiv.style('padding', '10px');
  infoDiv.style('border-radius', '6px');
  infoDiv.style('z-index', '10');

  noFill();
  stroke(255);
  strokeWeight(2);
}

/// --- メイン描画処理 ---
function draw() {
  console.log("draw loop running");
  if (sound && sound.isPlaying() && fft.input !== sound) {
    fft.setInput(sound);
  }
  // 🔥 ここで解析処理を実行（これがないと getEnergy() が効かない！）
  let spectrum = fft.analyze();
  
  /// 背景に虹色のグラデーション
  // === 中央線から上下に虹色グラデーションが広がる背景 ===
  let baseY = height / 2;         // 中央線の位置（波形中心）
  let layerCount = 100;           // 何本のラインを描くか
  let hueBase = (frameCount * 0.5) % 360;

  for (let i = 0; i < layerCount; i++) {
    let offset = i * 2;  // 各ラインの上下オフセット（2px間隔）
    let hue = (hueBase + i * 2) % 360;  // 色相を少しずつずらす
    let alpha = map(i, 0, layerCount, 30, 0); // 外側へ行くほど薄く

    fill(hue, 80, 60, alpha); // HSB色＋透明度
    noStroke();
    rect(0, baseY - offset, width, 2); // 上方向
    rect(0, baseY + offset, width, 2); // 下方向
  }
  /// 再生中の音がロードされていればビジュアライズ実行
  if (sound && sound.isLoaded()) {
    // 安定のため再接続チェック
    if (sound.isPlaying() && fft.input !== sound) {
      fft.setInput(sound);
    }

    /// 波形の描画
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

    /// 帯域エネルギーの取得
    let bass = fft.getEnergy(20, 150);
    let mid = fft.getEnergy(150, 4000);
    let hi = fft.getEnergy("4000, 12000");

    /// 左下にバーで帯域を可視化
    noStroke();
    fill(0, 255, 128);   rect(50, height - bass, 30, bass);  // bass
    fill(255, 180, 0);   rect(100, height - mid, 30, mid);   // mid
    fill(255, 50, 100);  rect(150, height - hi, 30, hi);     // hi

    /// デバッグ情報を更新
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

/// --- 再生・停止の切り替え（フェード付き） ---
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

      // 🔥 再生後にfftを再接続（GitHub Pages対策）
      setTimeout(() => {
        fft.setInput(sound);
      }, 100);

      sound.setVolume(1, 1); // フェードイン
    }
  });
}

/// --- ウィンドウリサイズに対応 ---
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
