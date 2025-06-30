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
  fill(0, 10); // 残像フェード
  rect(0, 0, width, height);

  colorMode(HSB, 360, 100, 100, 100);

  // 1万以下なら粒子を追加（左・右・下から）
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

  let level = getBass();  // audio.js 側関数

  for (let p of particles) {
    p.prev.set(p.pos);

    // フロー（Perlin noise）
    let angle = noise(p.pos.x * flowFieldScale, p.pos.y * flowFieldScale, frameCount * 0.005) * TWO_PI * 2;
    let v = p5.Vector.fromAngle(angle).mult(1.2);
    p.pos.add(v);

    // ワープ処理（対角ではなく明示的に方向別）
    if (p.pos.x < 0) p.pos.x = width;
    if (p.pos.x > width) p.pos.x = 0;
    if (p.pos.y < 0) p.pos.y = height;
    if (p.pos.y > height) {
      p.pos.x = random() < 0.5 ? 0 : width;         // 左右どちらか
      p.pos.y = height * 0.5 + random(height * 0.5); // 下半分のランダム位置
    }

    // フェードイン
    if (p.alpha < 100) p.alpha += 2;

    // 色設定（赤〜橙グラデーション）
    let hue = 10 + noise(p.pos.x * 0.01, p.pos.y * 0.01) * 20;
    let alpha = p.alpha;

    // 点滅（低音）
    if (level > pulseThreshold) {
      stroke(0, 0, 100, alpha);
    } else {
      stroke(hue, 100, 100, alpha);
    }

    line(p.prev.x, p.prev.y, p.pos.x, p.pos.y);
  }
}
