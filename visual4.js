let fireParticles = [];
let gridCols = 200;
let gridRows = 100;

function initVisual4() {
  fireParticles = [];
  let xSpacing = width / gridCols;
  let ySpacing = height / gridRows;

  for (let i = 0; i < gridCols; i++) {
    for (let j = 0; j < gridRows; j++) {
      fireParticles.push({
        x: i * xSpacing - width / 2 + xSpacing / 2,
        y: j * ySpacing - height / 2 + ySpacing / 2
      });
    }
  }
}

function drawVisual4() {
  push();
  translate(width / 2, height / 2); // 画面中央起点
  noStroke();
  colorMode(HSB, 360, 100, 100, 100);
  background(0, 0, 0, 20);

  let t = frameCount * 0.05;
  let waveScale = 0.05;     // ノイズのスケール
  let waveSpeed = 0.01;     // ノイズの進行速度
  let waveHeight = 60;      // 波の高さ

  for (let p of fireParticles) {
    let n = noise(p.x * waveScale, p.y * waveScale, t);
    let offset = map(n, 0, 1, -waveHeight, waveHeight);

    let brightness = map(offset, -waveHeight, waveHeight, 50, 100);
    let hue = map(offset, -waveHeight, waveHeight, 180, 240);
    let alpha = 100;

    fill(hue, 80, brightness, alpha);
    ellipse(p.x, p.y + offset, 2, 2);
  }

  pop();
}
