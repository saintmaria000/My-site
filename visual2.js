// === visual2.js ===
// 【Galaxy Visual】星々が腕に沿って配置され、中心スフィアが鼓動する3D表現

let stars = [];
let limStars = 500;
let RANGE = 600;

/**
 * 銀河風に星を初期化
 */
function initGalaxyStars() {
  let arms = 7;
  let spread = 0.5;
  stars = [];

  for (let i = 0; i < limStars; i++) {
    let arm = i % arms;
    let distance = random(50, RANGE);
    let angle = arm / arms * TWO_PI + distance * 0.02;
    angle += sin(distance * 0.1 + frameCount * 0.01) * 0.3;

    let x = distance * cos(angle) + randomGaussian() * distance * spread;
    let y = distance * sin(angle) + randomGaussian() * distance * spread;
    let z = random(-RANGE / 2, RANGE / 2);

    let hue = map(distance, 50, RANGE, 180, 300);
    stars.push(new Star(x, y, z, hue));
  }
}

/**
 * 星クラス
 */
class Star {
  constructor(x, y, z, hue) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.hue = hue;
  }
}

/**
 * 描画関数：Galaxy Visual
 */
function drawGalaxyVisual() {
  orbitControl();

  // === ライティング ===
  ambientLight(255);                           // 全体を柔らかく照らす
  pointLight(255, 255, 255, 0, 0, 200);        // 中央から光を照射

  // === 中央の鼓動スフィア ===
  let rms = amplitude.getLevel();
  let size = 9 + rms * 200;

  push();
  noStroke();
  specularMaterial(255);                       // 光沢マテリアル
  shininess(60);
  sphere(size);
  pop();

  // === 星々 ===
  rotateY(frameCount * 0.002);
  noStroke();
  for (let i = 0; i < stars.length; i++) {
    let p = stars[i];
    push();
    translate(p.x, p.y, p.z);
    // HSB → RGB に変換して emissiveMaterial に渡す
    colorMode(HSB, 360, 100, 100);
    let col = color(p.hue, 100, 100);
    colorMode(RGB, 255);
    emissiveMaterial(red(col), green(col), blue(col));
    //fill(255, 0, 0);
    sphere(2);
    pop();
  }
}
