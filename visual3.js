// --- パーティクル管理用 ---
let otonoamiParticles = [];
let numParticles = 150;
let exploded = false;
let explosionTimer = 0;

// --- 初期化関数（setup時に呼ばれる） ---
function initOtonoamiParticles() {
  otonoamiParticles = [];

  for (let i = 0; i < numParticles; i++) {
    let theta = random(TWO_PI);
    let phi = random(PI);
    let radius = 200;
    let x = radius * sin(phi) * cos(theta);
    let y = radius * sin(phi) * sin(theta);
    let z = radius * cos(phi);
    let pos = createVector(x, y, z);
    otonoamiParticles.push(new Particle(pos));
  }

  exploded = false;
  explosionTimer = 0;
}

// --- パーティクル描画＆物理更新処理 ---
function drawOtonoamiExplodingVisual(spectrum, bass) {
  // 低音が一定値を超えたら飛散
  if (bass > 180 && !exploded) {
    for (let p of otonoamiParticles) {
      let force = p5.Vector.random3D().mult(random(3, 6));
      p.applyForce(force);
    }
    exploded = true;
    explosionTimer = millis();
  }

  // 引力（近接する粒子同士に吸引力）
  for (let i = 0; i < otonoamiParticles.length; i++) {
    let pi = otonoamiParticles[i];
    for (let j = i + 1; j < otonoamiParticles.length; j++) {
      let pj = otonoamiParticles[j];
      let d = p5.Vector.dist(pi.pos, pj.pos);
      if (d < 60) {
        let f = p5.Vector.sub(pj.pos, pi.pos).normalize().mult(0.02);
        pi.applyForce(f);
        pj.applyForce(f.mult(-1));
      }
    }
  }

  // 球の形に戻る吸引力
  if (exploded && millis() - explosionTimer > 2500) {
    for (let p of otonoamiParticles) {
      let toBase = p5.Vector.sub(p.basePos, p.pos).mult(0.015);
      p.applyForce(toBase);
    }

    // 十分時間が経ったら状態をリセット
    if (millis() - explosionTimer > 6000) {
      exploded = false;
    }
  }

  // 更新と描画
  for (let p of otonoamiParticles) {
    p.update();
    p.display();
  }

  // 線を描画（近いパーティクル同士）
  stroke(160, 80);
  for (let i = 0; i < otonoamiParticles.length; i++) {
    for (let j = i + 1; j < otonoamiParticles.length; j++) {
      let a = otonoamiParticles[i];
      let b = otonoamiParticles[j];
      let d = p5.Vector.dist(a.pos, b.pos);
      if (d < 60) {
        line(a.pos.x, a.pos.y, a.pos.z, b.pos.x, b.pos.y, b.pos.z);
      }
    }
  }
}

// --- パーティクルクラス ---
class Particle {
  constructor(pos) {
    this.basePos = pos.copy();
    this.pos = pos.copy();
    this.vel = createVector();
    this.acc = createVector();
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.vel.mult(0.94); // 摩擦
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    noStroke();
    fill(200, 150, 255, 160);
    sphere(3);
    pop();
  }
}
