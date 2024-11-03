var utterance = new SpeechSynthesisUtterance();

function initCompanion() {
  var voices = window.speechSynthesis.getVoices();
  var frenchVoice = voices.find(function (voice) {
    return voice.name === 'Microsoft Paul - French (France)';
  });
  if (frenchVoice) {
    utterance.voice = frenchVoice;
  } else {
    console.error("La voix spécifique n'est pas disponible.");
    alert("La voix spécifique n'est pas disponible.");
  }
}

function speak(text) {
  utterance.text = text;
  const subtitleElement = document.getElementById('companion-subtitles');
  const textElement = subtitleElement.querySelector('.text');
  window.speechSynthesis.speak(utterance);

  // Update subtitles when speaking
  subtitleElement.style.visibility = 'visible';
  textElement.textContent = text;

  // Remove subtitles
  utterance.onend = function (event) {
    subtitleElement.style.visibility = 'hidden';
    textElement.textContent = '';
  };
}

function print(text) {
  const subtitleElement = document.getElementById('companion-subtitles');
  const textElement = subtitleElement.querySelector('.text');
  subtitleElement.style.visibility = 'visible';
  textElement.textContent = text;
}

function hide() {
  const subtitleElement = document.getElementById('companion-subtitles');
  const textElement = subtitleElement.querySelector('.text');
  subtitleElement.style.visibility = 'hidden';
  textElement.textContent = '';
}

function audio(args) {
  const [url, startTimeStr, endTimeStr] = args.split(';');

  const startTime = parseFloat(startTimeStr) || 0;
  const endTime = endTimeStr ? parseFloat(endTimeStr) : null;

  const audio = new Audio(url);
  audio.volume = 1.0;

  audio.addEventListener('loadeddata', () => {
    audio.currentTime = startTime;
    audio.play().catch(error => {
      console.error('Erreur lors de la lecture de l\'audio :', error);
    });
  });

  audio.addEventListener('timeupdate', () => {
    if (audio.currentTime >= endTime) {
      fonduEnFermeture(audio, audio.volume, 0.0, 4000);
    }
  });
}

function fonduEnFermeture(audio, volumeInitial, volumeFinal, duree) {
  const pas = (volumeInitial - volumeFinal) / (duree / 100);
  let volume = volumeInitial;

  const interval = setInterval(() => {
    volume -= pas;

    if (volume <= volumeFinal) {
      volume = volumeFinal;
      clearInterval(interval);
      audio.pause();
    }

    audio.volume = volume;
  }, 100);
}
