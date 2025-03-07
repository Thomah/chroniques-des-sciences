// Function to start the warning effect
function startWarning() {
  // Add a red blinking border
  let warningOverlay = document.createElement("div");
  warningOverlay.id = "warning-overlay";
  document.body.appendChild(warningOverlay);

  // Add CSS styles
  let style = document.createElement("style");
  style.id = "warning-style";
  style.innerHTML = `
      @keyframes blink {
          0% { border-color: red; opacity: 1; }
          50% { border-color: darkred; opacity: 0.5; }
          100% { border-color: red; opacity: 1; }
      }
      
      #warning-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          border: 20px solid red;
          box-sizing: border-box;
          animation: blink 0.5s infinite alternate;
          pointer-events: none;
          z-index: 9999;
      }
  `;
  document.head.appendChild(style);

  // Play alarm sound
  let alarmSound = document.createElement("audio");
  alarmSound.id = "alarm-sound";
  alarmSound.src = "audio/alarm.mp3";
  alarmSound.loop = true;
  alarmSound.play();
  document.body.appendChild(alarmSound);
}

// Function to stop the warning effect
function stopWarning() {
  let warningOverlay = document.getElementById("warning-overlay");
  let style = document.getElementById("warning-style");
  let alarmSound = document.getElementById("alarm-sound");

  if (warningOverlay) warningOverlay.remove();
  if (style) style.remove();
  if (alarmSound) {
      alarmSound.pause();
      alarmSound.remove();
  }
}

// Example usage:
// Call startWarning() when needed, e.g., Reveal.addEventListener('slidechanged', startWarning);
