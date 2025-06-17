// --- パラメータ ---!
let numParticles = 250;
let connectionThreshold = 120;
let sphereRadius = 200;
let maxConnections = 3;

// --- 状態変数 ---
let otonoamiParticles = [];
let exploded = false;
let lastKickTime = 0;
let kickCooldown = 300;
let connectionMap = new Set();
let waveIntensity = 1;

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
    // ノイズによる揺らぎ
    let t = frameCount * 0.015;
    let noiseVal = noise(this.id * 0.3, t);
    let offset = map(noiseVal, 0, 1, -8, 8) * waveIntensity;
    let dir = this.basePos.copy().normalize().mult(offset);
    let target = this.basePos.copy().add(dir);
    let force = p5.Vector.sub(target, this.pos).mult(0.02);
    this.applyForce(force);

    // 加速度制御
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.vel.mult(0.9);
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

// --- 接続記録：球体外に出たペアのみ ---
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
  waveIntensity = 3; // 爆発的な変形へ
  lastKickTime = millis();
  registerOuterConnections();
}

// --- メイン描画関数 ---
function drawOtonoamiExplodingVisual() {
  background(0);
  orbitControl();

  let bass = getBass();
  let treble = getHi();
  let now = millis();

  // キック検出
  if (bass > 180 && now - lastKickTime > kickCooldown) {
    triggerExplosion();
  }

  // 徐々に波打ち強度を戻す
  waveIntensity = lerp(waveIntensity, 1, 0.05);

  // 更新と描画
  for (let p of otonoamiParticles) {
    p.update();
    p.display();
  }

  // 高音で接続線を描画
  if (treble > 80) {
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
        let pulse = map(sin(frameCount * 0.1), -1, 1, 0.4, 2.5);
        strokeWeight(map(n.dist, 0, connectionThreshold, 2.5, 0.8) * pulse);
        stroke(220, 100, 255, map(n.dist, 0, connectionThreshold, 255, 90));
        line(a.pos.x, a.pos.y, a.pos.z, n.p.pos.x, n.p.pos.y, n.p.pos.z);
      }
    }
  }
}
