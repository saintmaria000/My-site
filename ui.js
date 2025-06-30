// --- UI初期化とデバッグ表示 ---
let infoDiv;

function setupUI() {
  infoDiv = createDiv('');
  infoDiv.style('position', 'fixed')
         .style('top', '50%')
         .style('right', '20px')
         .style('transform', 'translateY(-50%)')
         .style('color', '#0f0')
         .style('font-family', 'monospace')
         .style('font-size', '14px')
         .style('background', 'rgba(0, 0, 0, 0.5)')
         .style('padding', '10px')
         .style('border-radius', '6px')
         .style('z-index', '10');
}

function updateDebugInfo() {
  const amp = getAmplitude();
  const vol = getVolumeLevel();

  const bass = getBass();
  const mid = getMid();
  const hi = getHi();

  const cleanBass = getCleanBass();
  const cleanMid = getCleanMid();
  const cleanHi = getCleanHi();

  const kick = isKick() ? '🟢' : '⚫️';
  const snare = isSnare ? (isSnare() ? '🔵' : '⚫️') : '–';
  const hat = isHat ? (isHat() ? '🔴' : '⚫️') : '–';

  infoDiv.html(`
    <b>🎧 Audio Debug</b><br/>
    isPlaying: ${isPlaying()}<br/>
    volume: ${vol.toFixed(2)}<br/><br/>

    Bass: ${bass.toFixed(1)} / Clean: ${cleanBass.toFixed(1)}<br/>
    Mid: ${mid.toFixed(1)} / Clean: ${cleanMid.toFixed(1)}<br/>
    Hi: ${hi.toFixed(1)} / Clean: ${cleanHi.toFixed(1)}<br/><br/>

    Kick: ${kick}<br/>
    Snare: ${snare}<br/>
    Hat: ${hat}
  `);
}
