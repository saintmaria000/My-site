let debugDiv;

function setupDebugUI() {
  debugDiv = createDiv('').style('position', 'fixed')
    .style('top', '50%')
    .style('right', '0')
    .style('transform', 'translateY(-50%)')
    .style('color', 'lime')
    .style('font-family', 'monospace')
    .style('font-size', '12px')
    .style('background', 'rgba(0,0,0,0.6)')
    .style('padding', '8px')
    .style('line-height', '1.4')
    .style('z-index', '9999');
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
  const snare = isSnare() ? '🔵' : '⚫️';
  const hat = isHat() ? '🔴' : '⚫️';

  debugDiv.html(`
    <b>🎧 Audio Debug</b><br>
    Playing: ${isPlaying()}<br>
    Volume: ${vol.toFixed(2)}<br><br>
    
    Bass: ${bass.toFixed(1)} / Clean: ${cleanBass.toFixed(1)}<br>
    Mid: ${mid.toFixed(1)} / Clean: ${cleanMid.toFixed(1)}<br>
    Hi: ${hi.toFixed(1)} / Clean: ${cleanHi.toFixed(1)}<br><br>
    
    Kick: ${kick}<br>
    Snare: ${snare}<br>
    Hat: ${hat}<br>
  `);
}
