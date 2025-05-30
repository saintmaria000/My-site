let sound;
let fft;
let button;

function preload() {
  sound = loadSound('music/Synonmy.mp3');  // 音源ファイルのパス
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  fft = new p5.FFT();
   reverb = new p5.Reverb();
  sound.disconnect();              // メイン出力から切り離す
  reverb.process(sound, 3, 2);
  
  // ボタンクリックイベントの設定
  button = select('#toggle-btn');
  button.mousePressed(togglePlay);
  
  noFill();
  stroke(255);
  strokeWeight(2);
}

function draw() {
    background(0, 20); // 残像効果（トレイル演出）
  
    let waveform = fft.waveform();
  
    beginShape();
    for (let i = 0; i < waveform.length; i++) {
      let x = map(i, 0, waveform.length, 0, width);
      let y = map(waveform[i], -1, 1, 0, height);
      vertex(x, y);
    }
    endShape();
  }
function togglePlay() {
   if (sound.isPlaying()) {
    // フェードアウト → 完全停止
    sound.setVolume(0, 1); // 1秒かけて音量0へ
    setTimeout(() => {
      sound.stop();
      sound.setVolume(1); // 次回再生のために戻す
    }, 1000);
  } else {
    sound.setVolume(0); // 再生直後は音量0
    sound.play();
    sound.setVolume(1, 1); // 1秒かけて音量1に（フェードイン）
   }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
