let fireParticles = [];
let gridCols = 200;  // 横の粒子分割数
let gridRows = 120;  // 縦の粒子分割数

function initVisual4() {
  fireParticles = [];

  let xSpacing = width / gridCols;
  let ySpacing = height / gridRows;

  for (let i = 0; i < gridCols; i++) {
    for (let j = 0; j < gridRows; j++) {
      let x = i * xSpacing - width / 2 + xSpacing / 2;
      let y = j * ySpacing - height + ySpacing / 2;

      fireParticles.push({
        x: x,
        y: y
      });
    }
  }
}

function drawVisual4() {
  push();
  translate(width / 2, height);  // 描画の基準点を画面下中央に
  noStroke();
  colorMode(HSB, 360, 100, 100, 100);
  background(0, 0, 0, 20);  // 軽い残像の黒背景

  let t = frameCount * 0.15;
  let waveAmplitude = 50;      // 波の振幅（xの揺れ幅）
  let waveSpeed = 0.01;        // 波のスピード
  let waveX = (y) => sin(y * waveSpeed - t) * waveAmplitude;  // 縦方向進行波

  for (let p of fireParticles) {
    let waveCenterX = waveX(p.y);
    let distance = abs(p.x - waveCenterX);
    let threshold = 60;  // 波の影響範囲

    // 波の中心に近いほど強い影響（色・透明度が変化）
    let intensity = constrain(1 - distance / threshold, 0, 1);

    let hue = lerp(30, 200, intensity);      // オレンジ〜青
    let sat = lerp(100, 50, intensity);      // 彩度
    let bri = lerp(100, 100, intensity);     // 輝度（固定）
    let alpha = lerp(20, 100, intensity);    // 透明度（中心で明るく）

    fill(hue, sat, bri, alpha);
    ellipse(p.x, p.y, 2, 2);  // 粒子を描画
  }

  pop();
}
