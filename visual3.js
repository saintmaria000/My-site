class Particle {
  constructor(pos) {
    this.pos = pos.copy();
    this.basePos = pos.copy();
    this.vel = createVector(0, 0, 0);
  }

  update(spectrumVal) {
    let dir = p5.Vector.sub(this.basePos, this.pos);
    dir.mult(0.01);
    this.vel.add(dir);
    this.vel.limit(1 + spectrumVal / 255);
    this.pos.add(this.vel);
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    noStroke();
    fill(200, 150, 255, 200);
    sphere(3);
    pop();
  }
}

function drawOtonoamiVisual(spectrum) {
  for (let i = 0; i < particles.length; i++) {
    let spectrumVal = spectrum[i % spectrum.length];
    particles[i].update(spectrumVal);
  }

  // 線描画
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      let d = p5.Vector.dist(particles[i].pos, particles[j].pos);
      if (d < 50) {
        stroke(150, 100);
        line(
          particles[i].pos.x, particles[i].pos.y, particles[i].pos.z,
          particles[j].pos.x, particles[j].pos.y, particles[j].pos.z
        );
      }
    }
  }

  // 球体描画
  for (let p of particles) {
    p.display();
  }
}
