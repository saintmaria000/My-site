// === パラメータ設定 ===
let numParticles = 800;
let sphereRadius = 200;
let particles = [];

// === 初期化処理 ===
function initVisual3() {
  particles = [];
  for (let i = 0; i < numParticles; i++) {
    let phi = Math.acos(1 - 2 * (i + 0.5) / numParticles); // φ: 緯度
    let theta = Math.PI * (1 + Math.sqrt(5)) * i;          // θ: 経度（黄金角）

    let x = Math.sin(phi) * Math.cos(theta);
    let y = Math.sin(phi) * Math.sin(theta);
    let z = Math.cos(phi);

    let normal = createVector(x, y, z);
    let basePos = p5.Vector.mult(normal, sphereRadius);

    particles.push({
      base: basePos,
      normal: normal,
      pos: basePos.copy()
    });
  }
}

// === メイン描画関数 ===
function drawVisual3() {
  background(0);
  orbitControl();

  let spectrum = fft.analyze();
  let bandsPerParticle = floor(spectrum.length / numParticles);

  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];

    // 各パーティクルに対応する周波数の強さを取得
    let index = i * bandsPerParticle;
    index = constrain(index, 0, spectrum.length - 1);
    let energy = spectrum[index];

    // 波打ちの大きさ（例: 0〜40の振幅）
    let offset = map(energy, 0, 255, 0, 40);
    p.pos = p5.Vector.add(p.base, p5.Vector.mult(p.normal, offset));

    // 描画
    push();
    translate(p.pos.x, p.pos.y, p.pos.z);
    noStroke();
    fill(200, 180, 255, 160);
    sphere(2); // 点として表示
    pop();
  }
}
