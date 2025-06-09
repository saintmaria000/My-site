// === visual2.js ===
// 【役割】Galaxy Visual: 星々が銀河の腕に沿って3D空間に描画される。中心には音量に反応するスフィアが鼓動する。

let stars = [];
let limStars = 500;
let RANGE = 600;

/**
 * 初期化関数：銀河風に星を配置する
 */
function initGalaxyStars() {
  let arms = 7;              // 銀河の腕の数
  let spread = 0.5;          // 星のばらつき具合
  stars = [];                // 初期化

  for (let i = 0; i < limStars; i++) {
    let arm = i % arms;
    let distance = random(50, RANGE);
    let angle = arm / arms * TWO_PI + distance * 0.02;
    angle += sin(distance * 0.1 + frameCount * 0.01) * 0.3;  // うねりを追加

    let x = distance * cos(angle) + randomGaussian() * distance * spread;
    let y = distance * sin(angle) + randomGaussian() * distance * spread;
    let z = random(-RANGE / 4, RANGE / 4);

    let hue = map(distance, 50, RANGE, 180, 300); // 外側ほど青く
    let saturation = map(distance, 50, RANGE, 0, 100); // 中心：無彩色 → 外側：彩度高い
    let brightness = map(distance, 50, RANGE, 100, 80); // 明度も少し落とす
    fill(hue, saturation, brightness);
    stars.push(new Star(x, y, z, hue));
  }
}

/**
 * 星オブジェクト
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
 * メイン描画関数：Galaxy Visualを描画
 * - 中央に音量でサイズが変わるスフィア
 * - 星は銀河の腕にそって3D空間に回転
 */
function drawGalaxyVisual() {
  orbitControl(); // マウス操作でカメラ制御
  
  // === 中央の鼓動スフィア ===
  let rms = amplitude.getLevel();
  let size = 9 + rms * 200;

  push();
  noStroke();
  specularMaterial(255);   // 反射材質（ハイライト）
  shininess(50);          // ハイライト強度
  //fill(100, 100, 100); // 明るい中心色（黄系）
  sphere(size);
  pop();

  // === 星を描画（銀河の腕風） ===
  rotateY(frameCount * 0.002); // ゆっくり回転
  noStroke();
  for (let i = 0; i < stars.length; i++) {
    let p = stars[i];
    push();
    translate(p.x, p.y, p.z);
    // 色の発光（fillの代わり）
    emissiveMaterial(p.hue, 100, 100); // 自ら光る星
    //fill(p.hue, 60, 100); // hueに応じて色分け
    sphere(2);
    pop();
  }
}
