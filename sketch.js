let sound;       // 音声ファイル
let fft;         // FFT解析
let button;      // 再生/停止ボタン
let infoDiv;     // 波形・帯域情報表示用の要素

function preload() {
  sound = loadSound('music/Synonmy.mp3'); // 初期音源を読み込み
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // HSBモードで色を扱うことで、虹色のグラデーションが作りやすくなる
  colorMode(HSB, 360, 100, 100, 100);  

  fft = new p5.FFT();
  fft.setInput(sound);

  button = select('#toggle-btn');
  button.mousePressed(togglePlay);

  // 波形・帯域情報の可視化用要素を作成
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

function draw() {
  console.log("drewing...");
  // --- 音エネルギーで色の振動を強調 ---
  let energy = fft.getEnergy("bass");
  let hue = (frameCount * 0.5 + energy * 0.5) % 360;

  // --- 虹色グラデーション背景（滲みのような演出） ---
  fill(hue, 80, 40, 10); // 彩度80, 明度40, 透明度10%
  noStroke();
  rect(0, 0, width, height); // 透明な色で背景を重ねて塗る

  if (sound && sound.isLoaded()) {
    let waveform = fft.waveform();
    
    // --- 波形描画 ---
    stroke(255);
    noFill();
    beginShape();
    for (let i = 0; i < waveform.length; i++) {
      let x = map(i, 0, waveform.length, 0, width);
      let y = map(waveform[i], -1, 1, 0, height);
      vertex(x, y);
    }
    endShape();

    // --- 帯域エネルギー取得 ---
    let bass = fft.getEnergy("bass");
    let mid = fft.getEnergy("mid");
    let hi = fft.getEnergy("treble");

    // --- 帯域バー描画（下から上）---
    noStroke();
    fill(0, 255, 128);   rect(50, height - bass, 30, bass);  // bass: 緑
    fill(255, 180, 0);   rect(100, height - mid, 30, mid);   // mid: オレンジ
    fill(255, 50, 100);  rect(150, height - hi, 30, hi);     // hi: ピンク

    // --- デバッグ情報表示 ---
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
      fft.setInput(sound);
      sound.setVolume(1, 1); // フェードイン
    }
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
