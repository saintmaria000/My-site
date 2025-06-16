let particles = [];
let numParticles = 150;
let fft;
let audio;
let currentVisual = 'otonoami'; // 音の網

function preload() {
  audio = loadSound('your_audio_file.mp3'); // 音楽ファイルをここに
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  fft = new p5.FFT();
  for (let i = 0; i < numParticles; i++) {
    let angle = random(TWO_PI);
    let z = random(-200, 200);
    let radius = 200;
    let x = radius * cos(angle);
    let y = radius * sin(angle);
    particles.push(new Particle(createVector(x, y, z)));
  }
}

function draw() {
  background(10);
  orbitControl(); // マウスで操作可能
  fft.analyze();
  let spectrum = fft.analyze();

  if (currentVisual === 'otonoami') {
    drawOtonoamiVisual(spectrum);
  }
}

function mousePressed() {
  if (audio.isPlaying()) {
    audio.pause();
  } else {
    audio.loop();
  }
}
