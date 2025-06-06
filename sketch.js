let sound;      // 音データを格納する変数
let fft;        // 音の波形や周波数を解析するFFTインスタンス
let button;     // 再生ボタンのHTML要素

function preload() {
  // 初期ロードする音楽ファイル
  sound = loadSound('music/Synonmy.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight); // フル画面キャンバス作成
  fft = new p5.FFT();                      // FFTインスタンス生成
  fft.setInput(sound);                     // soundをFFTに接続

  // ファイル選択時の処理（inputで音源を変える）
  document.getElementById("file-input").addEventListener("change", (e) => {
    if (sound && sound.isPlaying()) {
      sound.stop(); // 前の音が流れていたら停止
    }

    const file = e.target.files[0];
    if (file) {
      // 新しい音源ファイルを読み込んでセット
      sound = loadSound(URL.createObjectURL(file), () => {
        fft.setInput(sound);
      });
    }
  });

  // 再生ボタンとクリックイベントを結びつけ
  button = select('#toggle-btn');
  button.mousePressed(togglePlay);

  noFill();       // 描画の塗りつぶしをなしに
  stroke(255);    // 線の色を白に
  strokeWeight(2);
}

function draw() {
  background(0, 20); // 少しずつ薄くして残像感を出す

  if (sound && sound.isLoaded()) {
    let waveform = fft.waveform(); // 音の波形を取得

    beginShape(); // 線の描画開始
    for (let i = 0; i < waveform.length; i++) {
      let x = map(i, 0, waveform.length, 0, width);         // 横方向に波形を配置
      let y = map(waveform[i], -1, 1, 0, height);           // 縦方向に波形をマッピング
      vertex(x, y); // 線の頂点を描画
    }
    endShape(); // 線の描画終了
  }
}

function togglePlay() {
  getAudioContext().resume().then(() => {
    if (!sound || !sound.isLoaded()) return;

    if (sound.isPlaying()) {
      sound.setVolume(0, 1); // フェードアウト
      setTimeout(() => {
        sound.stop();
        sound.setVolume(1);  // 音量リセット
      }, 1000);
    } else {
      sound.setVolume(0);
      sound.play();          // 音の再生開始
      fft.setInput(sound);   // FFT再セット（必要）
      sound.setVolume(1, 1); // フェードイン
    }
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight); // 画面リサイズ対応
}
