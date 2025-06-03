let sound;
let fft;
let button;
let volumeSlider;

function preload() {
  // 最初にデフォルトの音を読み込む
  sound = loadSound('sound.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  fft = new p5.FFT();

  volumeSlider = select("#volume-slider");

  // デフォルトサウンドをFFTにセット
  fft.setInput(sound);

  // ファイル読み込みのイベント
  document.getElementById("file-input").addEventListener("change", (e) => {
    if (sound && sound.isPlaying()) {
      sound.stop();
    }

    const file = e.target.files[0];
    if (file) {
      sound = loadSound(URL.createObjectURL(file), () => {
        console.log("User Sound loaded");
        fft.setInput(sound);
      });
    }
  });

  button = select('#toggle-btn');
  button.mousePressed(togglePlay);

  noFill();
  stroke(255);
  strokeWeight(2);
}

function draw() {
  background(0, 20); // 残像効果

  if (sound && sound.isLoaded()) {
    let waveform = fft.waveform();

    beginShape();
    for (let i = 0; i < waveform.length; i++) {
      let x = map(i, 0, waveform.length, 0, width);
      let y = map(waveform[i], -1, 1, 0, height);
      vertex(x, y);
    }
    endShape();
  }
}

function togglePlay() {
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
    fft.setInput(sound);
    sound.setVolume(1, 1);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
