// --- カラースプレッド背景ビジュアル（中央から上下へ色を塗り広げる） ---
let colorSpread = 0;
let currentHue = 0;
let nextHue = 60;
let step = 4;
let maxOffset;

function drawColorFillSpread() {
  let baseY = 0; // WEBGL座標系では中心が(0,0)
  maxOffset = height / 2;
  let gradientHeight = 60;

  noStroke();

  for (let offset = 0; offset <= colorSpread && offset <= maxOffset; offset++) {
    let isGradientZone = (offset > colorSpread - gradientHeight);
    let t = isGradientZone
      ? map(offset, colorSpread - gradientHeight, colorSpread, 0, 1)
      : 1;

    let hue = lerp(currentHue, nextHue, t);
    let alpha = map(offset, 0, maxOffset, 100, 0);

    fill(hue % 360, 100, 80, alpha);

    rect(-width / 2, baseY - offset, width, 1); // 上方向
    rect(-width / 2, baseY + offset, width, 1); // 下方向
  }

  colorSpread += step;

  if (colorSpread > maxOffset) {
    colorSpread = 0;
    currentHue = nextHue;
    nextHue = (nextHue + 60) % 360;
  }
}
