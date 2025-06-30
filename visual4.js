let flowParticles = [];
let gridCols = 100;
let gridRows = 100;
let flowFieldScale = 0.01;

function initVisual4() {
  flowParticles = [];
  for (let i = 0; i < gridCols; i++) {
    for (let j = 0; j < gridRows; j++) {
      let x = (i + 0.5) * width / gridCols;
      let y = (j + 0.5) * height / gridRows;
      flowParticles.push({
        pos: createVector(x, y),
        prev: createVector(x, y)
      });
    }
  }
}

function drawVisual4() {
  noStroke();
  fill(0, 10);  // 黒フェードで軌跡を残す
  rect(0, 0, width, height);

  colorMode(HSB, 360, 100, 100, 100);

  for (let p of flowParticles) {
    // ノイズに基づく角度を取得
    let angle = noise(p.pos.x * flowFieldScale, p.pos.y * flowFieldScale, frameCount * 0.005) * TWO_PI * 2;
    let v = p5.Vector.fromAngle(angle).mult(1.2);

    // 現在位置を保持 → 移動
    p.prev.set(p.pos);
    p.pos.add(v);

    // 画面外に出たら巻き戻す
    if (p.pos.x < 0) p.pos.x = width;
    if (p.pos.x > width) p.pos.x = 0;
    if (p.pos.y < 0) p.pos.y = height;
    if (p.pos.y > height) p.pos.y = 0;

    // 描画（色はXとYに応じて変化）
    let hue = map(p.pos.x, 0, width, 180, 220);  // 青系
    let alpha = map(p.pos.y, 0, height, 40, 100);
    stroke(hue, 80, 100, alpha);
    line(p.prev.x, p.prev.y, p.pos.x, p.pos.y);
  }
}
