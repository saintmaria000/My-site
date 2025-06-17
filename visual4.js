let fireParticles = [];
let numFireParticles = 5000;
let fireHeight = 400;
let fireWidth = 200;

function initVisual4() {
  fireParticles = [];
  for (let i = 0; i < numFireParticles; i++) {
    let x = random(-fireWidth, fireWidth);
    let y = random(-fireHeight, 0);
    fireParticles.push({
      basePos: createVector(x, y),
      pos: createVector(x, y),
      speed: random(0.5, 2),
      noiseOffset: random(1000),
      hue: random(20, 40)
    });
  }
}

function drawVisual4() {
  
  push();
  translate(width / 2, height);  // 中央下端起点に変換
  noStroke();
  colorMode(HSB, 360, 100, 100, 100);

  // 残像付きの背景処理
  fill(0, 0, 0, 10);
  background(0, 0, 0, 50);
  rect(-width / 2, -height, width, height * 2);

  let level = amplitude.getLevel();
  let spectrum = fft.analyze();

  for (let p of fireParticles) {
    let n = noise(p.noiseOffset, frameCount * 0.01);
    let sway = map(n, 0, 1, -20, 20) * level * 5;

    let waveIndex = floor(map(p.pos.y, -fireHeight, 0, 0, spectrum.length));
    let amp = map(spectrum[waveIndex], 0, 255, 0, 1);

    let x = p.basePos.x + sway + sin(frameCount * 0.02 + p.pos.y * 0.05) * 10 * amp;
    let y = p.pos.y + p.speed + amp * 5;

    fill(p.hue, 100, 100, map(p.pos.y, -fireHeight, 0, 0, 100));
    ellipse(x + width / 2, y + height, 2, 2);  // -y で上昇方向に描画

    p.pos.y += p.speed + amp * 3;
    if (p.pos.y > 0) {
      p.pos.y = random(-fireHeight, -20);
      p.noiseOffset = random(1000);
      p.basePos.x = random(-fireWidth, fireWidth);
    }
  }

  pop();
}
