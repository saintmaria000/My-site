let particles = [];
let connections = [];
let numParticles = 800;
let radius = 250;
let spikeSources = [];
let spikeDuration = 200;
let lastSpikeTime = 0;

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
}

function drawVisual3() {
  background(0);
  orbitControl();

  let bass = fft.getEnergy(20, 60);
  let treble = fft.getEnergy(8000, 12000);

  // --- キックでスパイク発生 ---
  if (bass > 180 && millis() - lastSpikeTime > spikeDuration) {
    spikeSources = [];
    for (let i = 0; i < 5; i++) {
      spikeSources.push(floor(random(particles.length)));
    }
    lastSpikeTime = millis();
  }

  let spikeProgress = constrain((millis() - lastSpikeTime) / spikeDuration, 0, 1);

  // --- パーティクル位置更新 ---
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    let displacement = createVector(0, 0, 0);

    // スパイク効果
    for (let s of spikeSources) {
      let d = p.basePos.dist(particles[s].basePos);
      if (d < 100) {
        let dir = p.basePos.copy().sub(particles[s].basePos).normalize();
        let strength = map(d, 0, 100, 1, 0) * (1 - spikeProgress);
        displacement.add(dir.mult(300 * strength));
      }
    }

    // 緩やかに元に戻る
    p.pos = p5.Vector.lerp(p.pos, p.basePos.copy().add(displacement), 0.2);
  }

  // --- 線描画（高音に反応） ---
  strokeWeight(1);
  colorMode(HSB, 360, 100, 100, 100);
  for (let i = 0; i < particles.length; i++) {
    let a = particles[i];
    for (let j = i + 1; j < particles.length; j++) {
      let b = particles[j];
      let d = a.pos.dist(b.pos);
      if (d < 50) {
        let alpha = map(treble, 0, 255, 0, 100);
        stroke(180, 80, 100, alpha);
        line(a.pos.x, a.pos.y, a.pos.z, b.pos.x, b.pos.y, b.pos.z);
      }
    }
  }

  // --- パーティクル描画 ---
  noStroke();
  fill(180, 100, 100);
  for (let p of particles) {
    push();
    translate(p.pos.x, p.pos.y, p.pos.z);
    sphere(2);
    pop();
  }
}
