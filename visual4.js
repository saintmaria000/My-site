let flowParticles = [];
let numParticles = 10000;
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
  fill(0, 10); // 黒フェード
  rect(0, 0, width, height);

  colorMode(HSB, 360, 100, 100, 100);

  for (let p of flowParticles) {
    let angle = noise(p.pos.x * flowFieldScale, p.pos.y * flowFieldScale, frameCount * 0.005) * TWO_PI * 2;
    let v = p5.Vector.fromAngle(angle).mult(1.2);

    p.prev.set(p.pos);
    p.pos.add(v);

    // wrap-around & wrapチェック
    let wrapped = false;
    if (p.pos.x < 0) { p.pos.x = width; wrapped = true; }
    if (p.pos.x > width) { p.pos.x = 0; wrapped = true; }
    if (p.pos.y < 0) { p.pos.y = height; wrapped = true; }
    if (p.pos.y > height) { p.pos.y = 0; wrapped = true; }

    // 色（赤系）
    let hue = map(p.pos.y, 0, height, 10, 30); // 赤〜橙
    let alpha = map(p.pos.x, 0, width, 30, 100);

    if (!wrapped) {
      stroke(hue, 100, 100, alpha);
      line(p.prev.x, p.prev.y, p.pos.x, p.pos.y);
    }
  }
}
