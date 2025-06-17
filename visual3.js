let particles = [];
let numParticles = 800;
let radius = 250;
let spikeSources = [];
let spikeDuration = 200;
let lastSpikeTime = 0;
let beams = [];

function initVisual3() {
  particles = [];
  for (let i = 0; i < numParticles; i++) {
    let phi = Math.acos(1 - 2 * (i + 0.5) / numParticles);
    let theta = Math.PI * (1 + Math.sqrt(5)) * i;
    let x = radius * Math.sin(phi) * Math.cos(theta);
    let y = radius * Math.sin(phi) * Math.sin(theta);
    let z = radius * Math.cos(phi);
    let pos = createVector(x, y, z);
    particles.push({
      basePos: pos.copy(),
      pos: pos.copy(),
      id: i
    });
  }
  spikeSources = [];
  beams = [];
}

function drawVisual3() {
  background(0);
  orbitControl();

  let bass = fft.getEnergy(20, 60);
  let mid = fft.getEnergy(250, 2000);
  let now = millis();

  // --- Kickでスパイク生成 ---
  if (bass > 180 && now - lastSpikeTime > spikeDuration) {
    spikeSources = [];
    for (let i = 0; i < 5; i++) {
      let id = floor(random(particles.length));
      spikeSources.push(id);
      // ビーム追加
      let dir = particles[id].basePos.copy().normalize();
      beams.push({
        origin: createVector(0, 0, 0),
        dir: dir,
        time: now
      });
    }
    lastSpikeTime = now;
  }

  let spikeProgress = constrain((now - lastSpikeTime) / spikeDuration, 0, 1);

  // --- パーティクル更新 ---
  for (let p of particles) {
    let displacement = createVector();
    for (let s of spikeSources) {
      let d = p.basePos.dist(particles[s].basePos);
      if (d < 100) {
        let dir = p.basePos.copy().sub(particles[s].basePos).normalize();
        let strength = map(d, 0, 100, 1, 0) * (1 - spikeProgress);
        displacement.add(dir.mult(300 * strength));
      }
    }
    p.pos = p5.Vector.lerp(p.pos, p.basePos.copy().add(displacement), 0.2);
  }

  // --- メッシュ描画（中音で点滅） ---
  strokeWeight(1);
  colorMode(HSB, 360, 100, 100, 100);
  for (let i = 0; i < particles.length; i++) {
    let a = particles[i];
    for (let j = i + 1; j < particles.length; j++) {
      let b = particles[j];
      let d = a.pos.dist(b.pos);
      if (d < 50) {
        let alpha = map(mid, 0, 255, 0, 80);
        if (random() < 0.2) { // 点滅感
          stroke(200, 80, 100, alpha);
          line(a.pos.x, a.pos.y, a.pos.z, b.pos.x, b.pos.y, b.pos.z);
        }
      }
    }
  }

  // --- ビーム描画 ---
  for (let i = beams.length - 1; i >= 0; i--) {
    let b = beams[i];
    let life = (now - b.time);
    if (life < 300) {
      stroke(200, 100, 100, map(life, 0, 300, 100, 0));
      strokeWeight(3);
      let len = map(life, 0, 300, 0, 1000);
      let end = p5.Vector.add(b.origin, p5.Vector.mult(b.dir, len));
      line(b.origin.x, b.origin.y, b.origin.z, end.x, end.y, end.z);
    } else {
      beams.splice(i, 1);
    }
  }

  // --- パーティクル描画 ---
  noStroke();
  fill(200, 100, 100);
  for (let p of particles) {
    push();
    translate(p.pos.x, p.pos.y, p.pos.z);
    sphere(2);
    pop();
  }
}
