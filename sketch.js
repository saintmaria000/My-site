let sound;
let fft;
let button;
let reverb;
let volumeSlider;

function setup() {
  createCanvas(windowWidth, windowHeight);
  fft = new p5.FFT();
  volumeSlider = select("#volume-slider");

  document.getElementById("file-input").addEventListener("change", (e) => {
    if (sound) {
      sound.stop();
    }

    const file = e.target.files[0];
    if (file) {
      sound = loadSound(URL.createObjectURL(file), () => {
        console.log("Sound loaded");

        // 音がロードされた後にのみエフェクト処理
        reverb = new p5.Reverb();
        sound.disconnect();             // 必ずsoundが有効になってから
        reverb.process(sound, 3, 2);
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
      sound.setVolume(1); // 次の再生に備えて戻す
    }, 1000);
  } else {
    sound.setVolume(0);
    sound.play();
    sound.setVolume(1, 1); // フェードイン
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
