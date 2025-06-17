//2
let particles = [];
let numParticles = 1000;
let radius = 250;

let lasers = [];
let lastLaserTime = 0;
let laserCooldown = 300;
let spectrum = [];

let souls = []; // 魂オブジェクト（高音反応）

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

  let bass = fft.getEnergy(20, 60);
  let mid = fft.getEnergy(300, 2500);
  let treble = fft.getEnergy(8000, 12000);
  spectrum = fft.analyze();
  let now = millis();

// === Kickでレーザー発射 ===
  let anyLaserActive = lasers.some(l => now - l.startTime < l.duration);

  if (bass > 180 && !anyLaserActive) {
    lastLaserTime = now;
    let dir = p5.Vector.random3D();
    lasers.push({
      start: createVector(0, 0, 0),
      dir: dir,
      startTime: now,
      duration: random(1200, 2000)
    });
  }
  // === 高音で魂を追加 ===
  if (treble > 180 && random() < 0.05) {
    souls.push({
      angle: random(TWO_PI),
      axis: p5.Vector.random3D(),
      startTime: now,
      duration: 2500
    });
  }

  // === レーザー描画 ===
  for (let l of lasers) {
    let elapsed = now - l.startTime;
    if (elapsed > l.duration) continue;

    let progress = elapsed / l.duration;
    let beamWidth = 8 * (1 - abs(sin(progress * PI)));
    let alpha = map(1 - progress, 0, 1, 0, 100);
    let endPos = p5.Vector.add(l.start, p5.Vector.mult(l.dir, 2000));

    push();
    strokeWeight(beamWidth);
    colorMode(HSB, 360, 100, 100, 100);
    stroke(200, 100, 100, alpha);
    line(l.start.x, l.start.y, l.start.z, endPos.x, endPos.y, endPos.z);
    pop();
  }

  // === 魂の描画 ===
  for (let s of souls) {
    let t = (now - s.startTime) / s.duration;
    if (t > 1) continue;

    let theta = s.angle + t * TWO_PI * 2;
    let axis = s.axis;
    let angleOffset = sin(frameCount * 0.05 + s.angle * 5) * 0.4;
    let pos = p5.Vector.fromAngle(theta + angleOffset).mult(radius * 1.1).rotate(axis);

    push();
    colorMode(HSB, 360, 100, 100, 100);
    fill(50, 0, 100, 80 * (1 - t));
    noStroke();
    translate(pos.x, pos.y, pos.z);
    sphere(4);
    pop();
  }

  // === パーティクル位置更新 ===
  for (let p of particles) {
    let displacement = createVector();

    // レーザー通過時の穴
    for (let l of lasers) {
      let elapsed = now - l.startTime;
      if (elapsed > l.duration) continue;
      let beamDir = l.dir;
      let projLength = p.basePos.dot(beamDir);
      let closestPoint = p5.Vector.mult(beamDir, projLength);
      let distToBeam = p.basePos.dist(closestPoint);
      if (distToBeam < 80) {
        let repel = p.basePos.copy().sub(closestPoint).normalize().mult(80 * (1 - elapsed / l.duration));
        displacement.add(repel);
      }
    }

    // φベースのスペクトラム波
    let phiIndex = floor(map(p.phi, 0, PI, 0, spectrum.length));
    let amp = map(spectrum[phiIndex], 0, 255, 0, 1.5);
    let wave = sin(p.phi * 4 + frameCount * 0.08);
    let normal = p.basePos.copy().normalize();
    displacement.add(normal.mult(wave * amp * 28));

    p.pos.lerp(p.basePos.copy().add(displacement), 0.24);
  }

  // === 中音で明滅する線 ===
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

  // === オブジェクト寿命管理 ===
  lasers = lasers.filter(l => now - l.startTime < l.duration);
  souls = souls.filter(s => now - s.startTime < s.duration);
}
