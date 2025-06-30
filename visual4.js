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
  fill(0, 10);
  rect(0, 0, width, height);

  colorMode(HSB, 360, 100, 100, 100);

  // 発生処理：下端＆左右から追加
  if (particles.length < maxParticles) {
    for (let i = 0; i < emissionRate; i++) {
      let edge = random(["left", "right", "bottom"]);
      let x = (edge === "left") ? 0 :
              (edge === "right") ? width : random(width);
      let y = (edge === "bottom") ? height : random(height * 0.5, height);
      particles.push({
        pos: createVector(x, y),
        alpha: 0
      });
    }
  }

  let level = getBass();  // audio.js 側の関数を使用

  for (let p of particles) {
    // Perlin noise による方向ベクトル
    let angle = noise(p.pos.x * flowFieldScale, p.pos.y * flowFieldScale, frameCount * 0.005) * TWO_PI * 2;
    let v = p5.Vector.fromAngle(angle).mult(1.2);
    p.pos.add(v);

    // ワープ処理（軌道線描画なし）
    let warped = false;
    if (p.pos.x < 0) { p.pos.x = width; warped = true; }
    else if (p.pos.x > width) { p.pos.x = 0; warped = true; }

    if (p.pos.y < 0) { p.pos.y = height; warped = true; }
    else if (p.pos.y > height) { 
      // 下に出たら、上からランダムにワープ
      p.pos.x = random(width);
      p.pos.y = 0;
      warped = true;
    }

    // 分裂的挙動（ワープ時のみ）
    if (warped && random() < 0.3) {
      // ランダム方向ジャンプ
      let newAngle = angle + random(-PI / 2, PI / 2);
      let jump = p5.Vector.fromAngle(newAngle).mult(random(30, 100));
      p.pos.add(jump);
      p.alpha = 0;  // フェードイン
    }

    // フェードイン
    if (p.alpha < 100) p.alpha += 2;

    // 色設定（赤系、低音点滅）
    let hue = 10 + noise(p.pos.x * 0.01, p.pos.y * 0.01) * 20;
    let alpha = p.alpha;

    if (level > pulseThreshold) {
      fill(0, 0, 100, alpha);  // 白点滅
    } else {
      fill(hue, 100, 100, alpha);
    }

    ellipse(p.pos.x, p.pos.y, 2, 2);
  }
}
