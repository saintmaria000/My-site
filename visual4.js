let flowParticles = [];
let numParticles = 10000; // 粒子の数（調整可能）
let flowFieldScale = 0.01;

function initVisual4() {
  flowParticles = [];
  for (let i = 0; i < numParticles; i++) {
    let x = random(width);
    let y = random(height);
    flowParticles.push({
      pos: createVector(x, y),
      prev: createVector(x, y)
    });
  }
}

function drawVisual4() {
  noStroke();
  fill(0, 10);  // 黒フェード（軌跡残し）
  rect(0, 0, width, height);

  colorMode(HSB, 360, 100, 100, 100);

  for (let p of flowParticles) {
    // ノイズベースの角度ベクトル
    let angle = noise(p.pos.x * flowFieldScale, p.pos.y * flowFieldScale, frameCount * 0.005) * TWO_PI * 2;
    let v = p5.Vector.fromAngle(angle).mult(1.2);

    // 現在位置 → 移動
    p.prev.set(p.pos);
    p.pos.add(v);

    // 画面外ループ処理
    if (p.pos.x < 0) p.pos.x = width;
    if (p.pos.x > width) p.pos.x = 0;
    if (p.pos.y < 0) p.pos.y = height;
    if (p.pos.y > height) p.pos.y = 0;

    // 描画（色はY座標などに基づく）
    let hue = map(p.pos.x, 0, width, 180, 220);
    let alpha = map(p.pos.y, 0, height, 40, 100);
    stroke(hue, 80, 100, alpha);
    line(p.prev.x, p.prev.y, p.pos.x, p.pos.y);
  }
}
