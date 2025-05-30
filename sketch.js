let sound;
let fft;
let button;

function preload() {
  sound = loadSound('music/Synonmy.mp3');  // 音源ファイルのパス
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  fft = new p5.FFT();
  
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

