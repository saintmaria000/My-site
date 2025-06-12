let colorSpread = 0;
let maxOffset;
let step = 2;
let gradientHeight = 80;

// パレット管理
let currentPalette = [];
let paletteIndex = 0;
let hueIndex = 0;

let prevHue = 0;
let currentHue = 0;
let nextHue = 60;
let stripeHeight = 4;
let paletteUseCount = 0;

// --- 固定パレット一覧 ---
const fixedPalettes = [
  [0, 30, 60, 90, 120],           // トライアド
  [180, 200, 220, 240, 260],      // 深海ブルー
  [300, 330, 360, 30, 60],        // アラビアン
  [90, 100, 110, 120, 130],       // グリーン
  [240, 210, 180, 150, 120],      // 逆光スペクトル
  [200, 180, 160, 140, 120],      // 柔らかい緑青
  [30, 45, 60, 15, 0],            // オレンジグラデ
  [270, 310, 350, 10, 50],        // オーロラ
];

// --- パレット生成関数一覧 ---
const paletteGenerators = [

  // ゴールデンスキップ法（黄金比でずらす）
  () => {
    let hues = [];
    let h = random(0, 360);
    let phi = 0.61803398875 * 360;
    for (let i = 0; i < 5; i++) {
      hues.push(h % 360);
      h += phi;
    }
    return hues;
  },

  // 正弦波カーブから色を抽出
  () => {
    let hues = [];
    for (let i = 0; i < 5; i++) {
      let h = map(sin(i * PI / 4), -1, 1, 0, 360);
      hues.push(h);
    }
    return hues;
  },

  // 無彩色グラデ
  () => {
    let h = floor(random(0, 360));
    return [h, h, h, h, h];
  },

  // ランダムパレット
  () => {
    let hues = [];
    for (let i = 0; i < 5; i++) hues.push(random(0, 360));
    return hues;
  }
];

// --- パレット初期化 ---
function setupColorPalette() {
  let sourceType = random() < 0.5 ? 'fixed' : 'generated';
  if (sourceType === 'fixed') {
    currentPalette = random(fixedPalettes);
  } else {
    currentPalette = random(paletteGenerators)();
  }
  hueIndex = 0;
  prevHue = currentHue = currentPalette[0];
  nextHue = currentPalette[1 % currentPalette.length];
  paletteUseCount = 0;
}

function drawColorFillSpread() {
  if (!currentPalette.length) setupColorPalette();

  let baseY = height / 2;
  maxOffset = height / 2;

  noStroke();

  for (let offset = 0; offset <= colorSpread && offset <= maxOffset; offset += stripeHeight) {
    let isGradientZone = offset > colorSpread - gradientHeight;
    let t = isGradientZone
      ? map(offset, colorSpread - gradientHeight, colorSpread, 0, 1)
      : 0;

    t = constrain(t, 0, 1);
    t = pow(t, 2.2);

    let hue = lerpHue(currentHue, prevHue, t);
    colorMode(HSB, 360, 100, 100, 100);
    fill(hue % 360, 100, 80, 100);
    rect(0, baseY - offset, width, stripeHeight);
    rect(0, baseY + offset, width, stripeHeight);
  }

  colorSpread += step;

  if (colorSpread > maxOffset + 5) {
    colorSpread = 0;
    hueIndex++;
    paletteUseCount++;

    prevHue = currentHue;
    currentHue = nextHue;
    nextHue = currentPalette[(hueIndex + 1) % currentPalette.length];
    stripeHeight = floor(random(2, 8));

    if (paletteUseCount >= 20) {
      setupColorPalette();
    }
  }
}

// --- 色相補間（360度補正付き） ---
function lerpHue(a, b, t) {
  let d = b - a;
  if (abs(d) > 180) {
    if (d > 0) a += 360;
    else       b += 360;
  }
  return (lerp(a, b, t) + 360) % 360;
}
