let flowParticles = [];
let maxParticles = 10000;
let flowFieldScale = 0.005;

function initVisual4() {
  flowParticles = [];
}

function drawVisual4() {
  // 背景フェード
  noStroke();
  fill(0, 20);
  rect(0, 0, width, height);

  colorMode(HSB, 360, 100, 100, 100);

  let level = getBass(); // audio.js 経由で取得
  let flash = level > 180;

  // 新規パーティクル生成（最大数まで下から発生）
  if (flowParticles.length < maxParticles) {
    let x = random(width);
    let y = random(height * 0.5, height);  // 下半分
    flowParticles.push({
      pos: createVector(x, y),
      prev: createVector(x, y)
    });
  }

  for (let p of flowParticles) {
    let angle = noise(p.pos.x * flowFieldScale, p.pos.y * flowFieldScale, frameCount * 0.003) * TWO_PI * 2;
    let v = p5.Vector.fromAngle(angle).mult(1.2);

    p.prev.set(p.pos);
    p.pos.add(v);

    // 対角循環（軌跡は描画しない）
    let wrapped = false;
    if (p.pos.x < 0) { p.pos.x = width; p.pos.y = height - p.pos.y; wrapped = true; }
    if (p.pos.x > width) { p.pos.x = 0; p.pos.y = height - p.pos.y; wrapped = true; }
    if (p.pos.y < 0) { p.pos.y = height; p.pos.x = width - p.pos.x; wrapped = true; }
    if (p.pos.y > height) { p.pos.y = 0; p.pos.x = width - p.pos.x; wrapped = true; }

    if (!wrapped) {
      let hue = flash ? 0 : map(p.pos.y, 0, height, 10, 30);  // 赤系
      let alpha = flash ? 100 : map(p.pos.x, 0, width, 20, 80);
      stroke(hue, 100, 100, alpha);
      line(p.prev.x, p.prev.y, p.pos.x, p.pos.y);
    }
  }
}
