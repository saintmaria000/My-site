let flowParticles = [];
let numParticles = 10000;
let flowFieldScale = 0.01;
let flashTimer = 0;  // 点滅制御タイマー

function initVisual4() {
  flowParticles = [];
  for (let i = 0; i < numParticles; i++) {
    let x = random(width);
    let y = random(height);
    flowParticles.push({
      pos: createVector(x, y),
      prev: createVector(x, y),
      life: int(random(300, 600))
    });
  }
}

function drawVisual4() {
  // === 黒フェード背景 ===
  noStroke();
  fill(0, 10);  
  rect(0, 0, width, height);

  colorMode(HSB, 360, 100, 100, 100);

  // === Bass反応で白点滅 ===
  let bass = getBass();  // audio.js にある関数
  if (bass > 180) {
    flashTimer = 3;  // 中程度の感度設定（高：150〜、低：200〜）
  }

  for (let p of flowParticles) {
    // --- 寿命管理 ---
    p.life--;
    if (p.life <= 0) {
      p.pos = createVector(random(width), random(height));
      p.prev = p.pos.copy();
      p.life = int(random(300, 600));
      continue;
    }

    // --- ノイズベクトル計算 ---
    let angle = noise(p.pos.x * flowFieldScale, p.pos.y * flowFieldScale, frameCount * 0.005) * TWO_PI * 2;
    angle += random(-0.05, 0.05);  // 少し乱れを加える
    let v = p5.Vector.fromAngle(angle).mult(1.2);

    p.prev.set(p.pos);
    p.pos.add(v);

    // --- 画面外 → ラップで反対側に戻す ---
    if (p.pos.x < 0) p.pos.x = width;
    if (p.pos.x > width) p.pos.x = 0;
    if (p.pos.y < 0) p.pos.y = height;
    if (p.pos.y > height) p.pos.y = 0;

    // --- 色：白点滅 or 赤系 ---
    let hue = map(p.pos.y, 0, height, 10, 30);  // 赤〜橙
    let alpha = map(p.pos.x, 0, width, 30, 100);

    if (flashTimer > 0) {
      stroke(0, 0, 100, alpha);  // 白（HSB）
    } else {
      stroke(hue, 100, 100, alpha);
    }

    line(p.prev.x, p.prev.y, p.pos.x, p.pos.y);
  }

  if (flashTimer > 0) flashTimer--;
}
