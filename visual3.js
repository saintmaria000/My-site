let particles = [];
let numParticles = 800;
let radius = 250;

let spikeSources = [];
let spikeDuration = 300;
let lastSpikeTime = 0;

let lasers = [];
let laserDuration = 2000;

// === 初期化 ===
function initVisual3() {
  particles = [];
  for (let i = 0; i < numParticles; i++) {
    let phi = Math.acos(1 - 2 * (i + 0.5) / numParticles);
    let theta = Math.PI * (1 + Math.sqrt(5)) * i;

    let x = radius * Math.sin(phi) * Math.cos(theta);
    let y = radius * Math.sin(phi) * Math.sin(theta);
    let z = radius * Math.cos(phi);
    let basePos = createVector(x, y, z);
    particles.push({ basePos, pos: basePos.copy(), id: i });
  }
  lasers = [];
}

// === メイン描画 ===
function drawVisual3() {
  background(0);
  orbitControl();

  let bass = fft.getEnergy(20, 60);
  let mid = fft.getEnergy(300, 2500);
  let spectrum = fft.analyze();

  let now = millis();

  // === キック検出でレーザー追加 ===
  if (bass > 180 && now - lastSpikeTime > spikeDuration) {
    spikeSources = [];
    for (let i = 0; i < 5; i++) {
      spikeSources.push(floor(random(particles.length)));
    }
    lastSpikeTime = now;

    for (let i = 0; i < 2; i++) {
      let dir = p5.Vector.random3D();
      lasers.push({ start: createVector(0, 0, 0), dir, startTime: now });
    }
  }

  // === レーザー描画 ===
  for (let l of lasers) {
    let progress = (now - l.startTime) / laserDuration;
    if (progress > 1) continue;

    let alpha = map(1 - progress, 0, 1, 0, 100);
    let beamWidth = 8 * (1 - abs(sin(progress * PI)));

    push();
    strokeWeight(beamWidth);
    colorMode(HSB, 360, 100, 100, 100);
    stroke(0, 0, 100, alpha);
    let endPos = p5.Vector.add(l.start, p5.Vector.mult(l.dir, 2000));
    line(l.start.x, l.start.y, l.start.z, endPos.x, endPos.y, endPos.z);
    pop();
  }

  // === パーティクル処理 ===
  for (let p of particles) {
    let displace = createVector();

    // Kickスパイクによる局所的変形
    for (let s of spikeSources) {
      let src = particles[s].basePos;
      let dist = p.basePos.dist(src);
      if (dist < 100) {
        let strength = map(dist, 0, 100, 1, 0);
        let dir = p.basePos.copy().sub(src).normalize();
        displace.add(dir.mult(strength * 150));
      }
    }

    // レーザーを避ける動き
    for (let l of lasers) {
      let t = (now - l.startTime) / laserDuration;
      if (t > 1) continue;
      let pointOnBeam = p5.Vector.add(l.start, p5.Vector.mult(l.dir, p.basePos.dot(l.dir)));
      let d = p.basePos.dist(pointOnBeam);
      if (d < 80) {
        let repel = p.basePos.copy().sub(pointOnBeam).normalize().mult(60 * (1 - t));
        displace.add(repel);
      }
    }

    // スペクトラムに合わせた波打ち
    let bandIndex = floor(map(p.id, 0, numParticles, 0, spectrum.length));
    let amp = map(spectrum[bandIndex], 0, 255, 0, 1);
    let normal = p.basePos.copy().normalize();
    displace.add(normal.mult(amp * 20));

    // 合成と元位置への緩やかな戻り
    let target = p.basePos.copy().add(displace);
    p.pos.lerp(target, 0.2);
  }

  // === 線描画（中音で明滅）===
  for (let i = 0; i < particles.length; i++) {
    let a = particles[i];
    for (let j = i + 1; j < particles.length; j++) {
      let b = particles[j];
      let d = a.pos.dist(b.pos);
      if (d < 50) {
        let alpha = map(mid, 0, 255, 0, 60);
        if (random() < 0.6) {
          stroke(180, 60, 100, alpha);
          strokeWeight(1);
          line(a.pos.x, a.pos.y, a.pos.z, b.pos.x, b.pos.y, b.pos.z);
        }
      }
    }
  }

  // === パーティクル描画 ===
  noStroke();
  fill(200, 100, 255);
  for (let p of particles) {
    push();
    translate(p.pos.x, p.pos.y, p.pos.z);
    sphere(2);
    pop();
  }

  // === レーザー寿命制御 ===
  lasers = lasers.filter(l => millis() - l.startTime < laserDuration);
}
