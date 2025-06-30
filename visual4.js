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
  fill(0, 10); // 黒フェード背景
  rect(0, 0, width, height);

  colorMode(HSB, 360, 100, 100, 100);

  let bass = getBass(); // audio.js の低音取得関数
  let isFlash = bass > 180; // 180以上で点滅する（中感度）

  for (let p of flowParticles) {
    let angle = noise(
      p.pos.x * flowFieldScale,
      p.pos.y * flowFieldScale,
      frameCount * 0.005
    ) * TWO_PI * 2;

    let v = p5.Vector.fromAngle(angle).mult(1.2);

    p.prev.set(p.pos);
    p.pos.add(v);

    // ワープ処理（wrap-around）と描画スキップ処理
    let wrapped = false;
    if (p.pos.x < 0)       { p.pos.x = width; wrapped = true; }
    else if (p.pos.x > width)  { p.pos.x = 0; wrapped = true; }
    if (p.pos.y < 0)       { p.pos.y = height; wrapped = true; }
    else if (p.pos.y > height) { p.pos.y = 0; wrapped = true; }

    if (wrapped) {
      p.prev.set(p.pos); // 線が引かれないように前回位置更新
      continue;
    }

    // 色設定
    let hue = isFlash ? 0 : map(p.pos.y, 0, height, 10, 30); // 赤〜橙
    let sat = isFlash ? 0 : 100;
    let bri = isFlash ? 100 : 100;
    let alpha = isFlash ? 100 : map(p.pos.x, 0, width, 30, 100);

    stroke(hue, sat, bri, alpha);
    line(p.prev.x, p.prev.y, p.pos.x, p.pos.y);
  }
}
