let colorSpread = 0;
let currentHue = 0;
let nextHue = 60;
let step = 2;
let maxOffset;

function drawColorFillSpread() {
  let baseY = height / 2;
  maxOffset = height / 2;
  let gradientHeight = 80;

  noStroke();

  for (let offset = 0; offset <= colorSpread && offset <= maxOffset; offset++) {
    let isGradientZone = offset > colorSpread - gradientHeight;
    let t = isGradientZone
      ? map(offset, colorSpread - gradientHeight, colorSpread, 0, 1)
      : 1;

    let hue = lerp(currentHue, nextHue, t);
    let fade = map(offset, 0, maxOffset, 1, 0);
    let alpha = isGradientZone
      ? 100 * fade * pow(t, 2)
      : 100 * fade;

    fill(hue % 360, 100, 80, alpha);

    // 🌊 Y位置を波形に変形
    let waveOffset = sin((offset + frameCount * 2) * 0.05) * 10; // 波の高さ＆速さ

    // 上下にうねる
    rect(0, baseY - offset + waveOffset, width, 1);
    rect(0, baseY + offset + waveOffset, width, 1);
  }

  colorSpread += step;

  if (colorSpread > maxOffset) {
    colorSpread = 0;
    currentHue = nextHue;
    nextHue = (nextHue + 60) % 360;
  }
}
