let waveGrid = [];
let cols = 150;
let rows = 80;

function initVisual4() {
  waveGrid = [];
  let spacingX = width / cols;
  let spacingY = height / rows;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      waveGrid.push({
        x: -width / 2 + i * spacingX,
        yBase: -height / 2 + j * spacingY,
        z: map(j, 0, rows, 1, 0.2),
        phaseShift: random(TWO_PI),  // Y方向の揺れの位相差
        flashTimer: 0
      });
    }
  }
}

function drawVisual4() {
  push();
  translate(width / 2, height / 2);
  noStroke();
  colorMode(HSB, 360, 100, 100, 100);

  fill(0, 0, 0, 10);
  rect(-width / 2, -height / 2, width, height);

  let t = frameCount * 0.03;

  for (let p of waveGrid) {
    // 複数のsin波を合成（列と行の位相ずれで海のような揺れ）
    let wave = sin(p.x * 0.02 + t) * 30 + sin(p.yBase * 0.04 + t * 1.2 + p.phaseShift) * 20;
    let y = p.yBase + wave;

    // 発色と立体感（Z値によって）
    let hue = map(p.z, 0.2, 1, 20, 40);
    let alpha = map(p.z, 0.2, 1, 30, 100);
    let size = map(p.z, 0.2, 1, 1, 3);

    if (random() < 0.005) p.flashTimer = 3;

    if (p.flashTimer > 0) {
      fill(0, 0, 100, alpha);
      p.flashTimer--;
    } else {
      fill(hue, 100, 100, alpha);
    }

    ellipse(p.x, y, size, size);
  }

  pop();
}
