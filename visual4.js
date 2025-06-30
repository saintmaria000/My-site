let particles = [];
let maxParticles = 10000;
let emissionRate = 50;
let flowFieldScale = 0.01;
let pulseThreshold = 0.7;

function initVisual4() {
  particles = [];
}

function drawVisual4() {
  noStroke();
  fill(0, 10); // 黒フェード背景
  rect(0, 0, width, height);

  colorMode(HSB, 360, 100, 100, 100);

  // パーティクル追加（最大1万まで）
  if (particles.length < maxParticles) {
    for (let i = 0; i < emissionRate; i++) {
      let edge = random(["left", "right", "bottom"]);
      let x = (edge === "left") ? 0 :
              (edge === "right") ? width : random(width);
      let y = (edge === "bottom") ? height : random(height);
      particles.push({
        pos: createVector(x, y),
        prev: createVector(x, y),
        alpha: 0
      });
    }
  }

  let level = getBass(); // audio.js 側関数

  for (let p of particles) {
    p.prev.set(p.pos);

    // フローベクトル
    let angle = noise(p.pos.x * flowFieldScale, p.pos.y * flowFieldScale, frameCount * 0.005) * TWO_PI * 2;
    let v = p5.Vector.fromAngle(angle).mult(1.2);
    p.pos.add(v);

    // ワープ判定
    let wrapped = false;
    if (p.pos.x < 0) { p.pos.x = width; wrapped = true; }
    if (p.pos.x > width) { p.pos.x = 0; wrapped = true; }
    if (p.pos.y < 0) { p.pos.y = height; wrapped = true; }
    if (p.pos.y > height) {
      p.pos.x = random() < 0.5 ? 0 : width;
      p.pos.y = height * 0.5 + random(height * 0.5);
      wrapped = true;
    }

    // フェードイン
    if (p.alpha < 100) p.alpha += 2;

    // 色
    let hue = 10 + noise(p.pos.x * 0.01, p.pos.y * 0.01) * 20;
    let alpha = p.alpha;

    if (!wrapped) {
      if (level > pulseThreshold) {
        stroke(0, 0, 100, alpha);  // 白点滅
      } else {
        stroke(hue, 100, 100, alpha);  // 通常色
      }
      line(p.prev.x, p.prev.y, p.pos.x, p.pos.y);
    }
  }
}
