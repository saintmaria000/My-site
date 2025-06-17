let particles = [];
let numParticles = 1000;
let radius = 250;

let lasers = [];
let laserMin = 1200;
let laserMax = 2000;

let spectrum = [];
let souls = [];

function initVisual3() {
  particles = [];
  for (let i = 0; i < numParticles; i++) {
    let phi = Math.acos(1 - 2 * (i + 0.5) / numParticles);
    let theta = Math.PI * (1 + Math.sqrt(5)) * i;
    let x = radius * Math.sin(phi) * Math.cos(theta);
    let y = radius * Math.sin(phi) * Math.sin(theta);
    let z = radius * Math.cos(phi);
    let basePos = createVector(x, y, z);
    particles.push({ basePos, pos: basePos.copy(), id: i, phi });
  }
  lasers = [];
  souls = [];
}

function drawVisual3() {
  background(0);
  orbitControl();
  let now = millis();

  // === 音取得 ===
  let bass = fft.getEnergy(20, 60);
  let mid = fft.getEnergy(300, 2500);
  let treble = fft.getEnergy(7000, 12000);
  spectrum = fft.analyze();

  // === レーザー発射 ===
  if (bass > 180) {
    let dir = p5.Vector.random3D();
    lasers.push({
      start: createVector(0, 0, 0),
      dir,
      startTime: now,
      duration: random(laserMin, laserMax)
    });
  }

  // === 魂の生成 ===
  if (treble > 160 && souls.length < 5) {
    souls.push({
      theta: random(TWO_PI),
      phi: random(PI),
      speed: random(0.01, 0.03),
      offset: random(TWO_PI),
      birth: now
    });
  }

  // === 魂描画 ===
  for (let i = souls.length - 1; i >= 0; i--) {
    let s = souls[i];
    let life = now - s.birth;
    if (life > 3000) {
      souls.splice(i, 1);
      continue;
    }

    // ランダムな変化を加えた周回軌道
    s.theta += s.speed;
    let phi = s.phi + sin(frameCount * 0.05 + s.offset) * 0.1;
    let x = (radius + 10) * sin(phi) * cos(s.theta);
    let y = (radius + 10) * sin(phi) * sin(s.theta);
    let z = (radius + 10) * cos(phi);
    push();
    noStroke();
    fill(180, 255, 255, map(3000 - life, 0, 3000, 0, 255));
    translate(x, y, z);
    sphere(4);
    pop();
  }

  // === レーザー描画と影響 ===
  for (let l of lasers) {
    let elapsed = now - l.startTime;
    if (elapsed > l.duration) continue;
    let alpha = map(1 - elapsed / l.duration, 0, 1, 0, 100);
    let beamWidth = 8 * (1 - abs(sin(elapsed / l.duration * PI)));
    let endPos = p5.Vector.add(l.start, p5.Vector.mult(l.dir, 2000));
    strokeWeight(beamWidth);
    stroke(200, 100, 100, alpha);
    line(l.start.x, l.start.y, l.start.z, endPos.x, endPos.y, endPos.z);
  }

  // === パーティクル更新 ===
  for (let p of particles) {
    let displacement = createVector();

    // レーザー回避のみ（穴）
    for (let l of lasers) {
      let elapsed = now - l.startTime;
      if (elapsed > l.duration) continue;
      let proj = p.basePos.dot(l.dir);
      let closest = p5.Vector.mult(l.dir, proj);
      let d = p.basePos.dist(closest);
      if (d < 80) {
        let repel = p.basePos.copy().sub(closest).normalize().mult(80 * (1 - elapsed / l.duration));
        displacement.add(repel);
      }
    }

    // 波打ち（スペクトラム）
    let index = floor(map(p.phi, 0, PI, 0, spectrum.length));
    let amp = map(spectrum[index], 0, 255, 0, 1.5);
    let wave = sin(p.phi * 4 + frameCount * 0.08);
    let normal = p.basePos.copy().normalize();
    displacement.add(normal.mult(wave * amp * 23));

    // 元位置への戻り
    let target = p.basePos.copy().add(displacement);
    p.pos.lerp(target, 0.24);
  }

  // === メッシュ描画（中音反応） ===
  for (let i = 0; i < particles.length; i++) {
    let a = particles[i];
    for (let j = i + 1; j < particles.length; j++) {
      let b = particles[j];
      let d = a.pos.dist(b.pos);
      if (d < 50 && random() < 0.5) {
        let alpha = map(mid, 0, 255, 0, 100);
        strokeWeight(1);
        stroke(180, 100, 100, alpha);
        line(a.pos.x, a.pos.y, a.pos.z, b.pos.x, b.pos.y, b.pos.z);
      }
    }
  }

  // === パーティクル描画 ===
  noStroke();
  fill(190, 100, 255);
  for (let p of particles) {
    push();
    translate(p.pos.x, p.pos.y, p.pos.z);
    sphere(2);
    pop();
  }

  // === 古いレーザー除去 ===
  lasers = lasers.filter(l => now - l.startTime < l.duration);
}
