const intervals = {}; // Store intervals for each chronometer

function startChronometer(args) {
  const [elementId, initialTime] = args.split(';');
  console.log(elementId);
  const chronoElement = document.getElementById(elementId);
  if (chronoElement) {
    let timeElapsed = parseInt(initialTime, 10) || 0;
    let startTime = performance.now();

    function formatTime(milliseconds) {
      const totalSeconds = Math.floor(milliseconds / 1000);
      const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
      const seconds = String(totalSeconds % 60).padStart(2, '0');
      const millis = String(Math.floor(milliseconds % 1000)).padStart(3, '0');
      return `[${minutes}:${seconds}:${millis}]`;
    }

    chronoElement.innerText = formatTime(timeElapsed);

    intervals[elementId] = setInterval(() => {
      const currentTime = performance.now();
      timeElapsed = currentTime - startTime;
      chronoElement.innerText = formatTime(timeElapsed);
    }, 10); // Mettre à jour toutes les 10 ms pour plus de fluidité

    console.log(intervals[elementId]);
  }
}

function stopChronometer(args) {
  if (intervals[args]) {
    clearInterval(intervals[args]);
    delete intervals[args];
  }
}