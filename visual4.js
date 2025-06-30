let fireParticles = [];
let numFireParticles = 5000;
let fireHeight;
let fireWidth;

function initVisual4() {
  fireHeight = height;
  fireWidth = width;
  fireParticles = [];

  for (let i = 0; i < numFireParticles; i++) {
    let x = random(-fireWidth / 2, fireWidth / 2);
    let y = random(-fireHeight, 0); // パーティクル帯の基準Y
    let z = random(0.2, 1); // 奥行き（立体感）

    fireParticles.push({
      basePos: createVector(x, y),
      noiseOffset: random(1000),
      hue: random(20, 40),
      z: z,
      flashTimer: 0
    });
  }
}

function drawVisual4() {
  push();
  translate(width / 2, height);  // 中央下端起点
  noStroke();
  colorMode(HSB, 360, 100, 100, 100);

  // 背景残像
  fill(0, 0, 0, 10);
  rect(-width / 2, -height, width, height * 2);

  let spectrum = fft.analyze();
  let level = amplitude.getLevel();

  // 波の可視化：線グラフ（画面上部）
  push();
  translate(-width / 2, 0); // 左上基準
  noFill();
  strokeWeight(1);
  stroke(0, 0, 100); // 白線

  beginShape();
  for (let i = 0; i < fireParticles.length; i += 20) {
    let p = fireParticles[i];

    let noiseVal = noise(p.noiseOffset, frameCount * 0.01);
    let noiseSway = map(noiseVal, 0, 1, -20, 20);

    let sinSway = sin(frameCount * 0.05 + p.basePos.x * 0.01) * 40;
    let totalSway = noiseSway + sinSway;

    let x = map(i, 0, fireParticles.length, 0, width);
    let y = 180 - totalSway;

    vertex(x, y);
  }
  endShape();
  pop();

  // ラベル
  push();
  translate(-width / 2, 0);
  noStroke();
  fill(0, 0, 80);
  textSize(12);
  text("sway (noise + sin)", 10, 160);
  pop();

  // パーティクル描画
  for (let p of fireParticles) {
    // 固定ベースY + sin揺れ
    let baseY = map(p.basePos.y, -fireHeight, 0, -height, 0);
    let yWave = sin(frameCount * 0.04 + p.basePos.x * 0.01) * 30 * level * p.z;
    let y = baseY + yWave;

    // X揺れ：noise + sin
    let noiseVal = noise(p.noiseOffset, frameCount * 0.01);
    let noiseSway = map(noiseVal, 0, 1, -20, 20) * p.z;
    let sinSway = sin(frameCount * 0.05 + p.basePos.x * 0.01) * 40 * level * p.z;
    let x = p.basePos.x + noiseSway + sinSway;

    // 音による反応
    let waveIndex = floor(map(p.basePos.y, -fireHeight, 0, 0, spectrum.length));
    let amp = map(spectrum[waveIndex], 0, 255, 0, 1) * p.z;

    // 色・サイズ・透明度
    let hue = map(y, -height, 0, 20, 40);
    let alpha = map(y, -height, 0, 100, 0) * p.z;
    let size = map(p.z, 0.2, 1, 1, 3);

    // 白点滅
    if (amp > 0.8 && random() < 0.6) {
      p.flashTimer = 3;
    }

    if (p.flashTimer > 0) {
      fill(0, 0, 100, alpha);
      p.flashTimer--;
    } else {
      fill(hue, 100, 100, alpha);
    }

    ellipse(x, y, size, size);
  }

  pop();
}
