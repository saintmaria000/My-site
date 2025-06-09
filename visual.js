let colorSpread = 0;
let currentHue = 0;
let nextHue = 60;
let step = 4;
let maxOffset;

function drawColorFillSpread() {
  let baseY = height / 2;
  maxOffset = height / 2;
  let gradientHeight = 60; // グラデーションの範囲

  noStroke();

  for (let offset = 0; offset <= colorSpread && offset <= maxOffset; offset++) {
    let isGradientZone = (offset > colorSpread - gradientHeight);
    let t = isGradientZone
      ? map(offset, colorSpread - gradientHeight, colorSpread, 0, 1)
      : 1;

    let hue = lerp(currentHue, nextHue, t);
    let alpha = map(offset, 0, maxOffset, 100, 0);  // 徐々に薄くなる

    fill(hue % 360, 100, 80, alpha);

    rect(0, baseY - offset, width, 1);
    rect(0, baseY + offset, width, 1);
  }

  colorSpread += step;

  if (colorSpread > maxOffset) {
    colorSpread = 0;
    currentHue = nextHue;
    nextHue = (nextHue + 60) % 360;
  }
}
