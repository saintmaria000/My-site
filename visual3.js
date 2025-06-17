// --- パラメータ ---
let numParticles = 150;
let connectionThreshold = 120;
let sphereRadius = 200;
let maxConnections = 3;

// --- 状態変数 ---
let otonoamiParticles = [];
let exploded = false;
let lastKickTime = 0;
let kickCooldown = 300;
let connectionMap = new Set();

// --- 初期化 ---
function initOtonoamiParticles() {
  otonoamiParticles = [];
  for (let i = 0; i < numParticles; i++) {
    let phi = Math.acos(1 - 2 * (i + 0.5) / numParticles);
    let theta = Math.PI * (1 + Math.sqrt(5)) * i;
    let r = sphereRadius;
    let x = r * Math.sin(phi) * Math.cos(theta);
    let y = r * Math.sin(phi) * Math.sin(theta);
    let z = r * Math.cos(phi);
    let pos = createVector(x, y, z);
    otonoamiParticles.push(new Particle(pos, i));
  }
  exploded = false;
  connectionMap.clear();
}

// --- パーティクルクラス ---
class Particle {
  constructor(pos, id) {
    this.id = id;
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
    this.vel.mult(0.92);
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

// --- 接続の記録：球体外に出たペアだけ ---
function registerOuterConnections() {
  connectionMap.clear();
  for (let i = 0; i < otonoamiParticles.length; i++) {
    let a = otonoamiParticles[i];
    if (a.pos.mag() <= sphereRadius) continue;
    for (let j = i + 1; j < otonoamiParticles.length; j++) {
      let b = otonoamiParticles[j];
      if (b.pos.mag() <= sphereRadius) continue;

      let d = p5.Vector.dist(a.pos, b.pos);
      if (d < connectionThreshold) {
        let key = [a.id, b.id].sort().join("-");
        connectionMap.add(key);
      }
    }
  }
}

function shouldConnect(a, b) {
  let key = [a.id, b.id].sort().join("-");
  return connectionMap.has(key);
}

// --- 爆発処理 ---
function triggerExplosion() {
  for (let p of otonoamiParticles) {
    let force = p5.Vector.random3D().mult(random(3, 8));
    p.applyForce(force);
  }
  exploded = true;
  lastKickTime = millis();
  registerOuterConnections(); // 外側ペアを記録
}

// --- メイン描画関数 ---
function drawOtonoamiExplodingVisual() {
  let bass = getBass();
  let mid = getMid();
  let treble = getHi();
  let amp = getAmplitude();
  let now = millis();

  if (bass > 180 && now - lastKickTime > kickCooldown) {
    triggerExplosion();
  }

  // 中音で波打ち
  if (!exploded && mid > 130) {
    for (let p of otonoamiParticles) {
      let n = noise(p.id * 0.2, frameCount * 0.02);
      let offset = map(n, 0, 1, -12, 12) * amp * 6;
      let dir = p.basePos.copy().normalize().mult(offset);
      let target = p.basePos.copy().add(dir);
      let force = p5.Vector.sub(target, p.pos).mult(0.015);
      p.applyForce(force);
    }
  }

  // 自然な球状への戻り
  for (let p of otonoamiParticles) {
    let toBase = p5.Vector.sub(p.basePos, p.pos).mult(0.01);
    p.applyForce(toBase);
  }

  if (exploded) {
    let allClose = otonoamiParticles.every(p => p.pos.dist(p.basePos) < 5);
    if (allClose) exploded = false;
  }

  // 更新と描画
  for (let p of otonoamiParticles) {
    p.update();
    p.display();
  }

  // 線の描画：高音でのみ可視化
  if (treble > 100) {
    for (let i = 0; i < otonoamiParticles.length; i++) {
      let a = otonoamiParticles[i];
      let connections = [];

      for (let j = 0; j < otonoamiParticles.length; j++) {
        if (i === j) continue;
        let b = otonoamiParticles[j];
        if (shouldConnect(a, b)) {
          let d = p5.Vector.dist(a.pos, b.pos);
          connections.push({ p: b, dist: d });
        }
      }

      connections.sort((a, b) => a.dist - b.dist);
      for (let k = 0; k < Math.min(maxConnections, connections.length); k++) {
        let n = connections[k];
        let pulse = map(sin(frameCount * 0.1), -1, 1, 0.3, 2);
        strokeWeight(map(n.dist, 0, connectionThreshold, 2, 0.5) * pulse);
        stroke(220, 100, 255, map(n.dist, 0, connectionThreshold, 255, 60));
        line(a.pos.x, a.pos.y, a.pos.z, n.p.pos.x, n.p.pos.y, n.p.pos.z);
      }
    }
  }
}
