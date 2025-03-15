var utterance = new SpeechSynthesisUtterance();

function initCompanion() {
  const allowedNames = ["Microsoft Paul - French (France)", "Microsoft RemyMultilingual Online (Natural) - French (France)", "Microsoft Henri Online (Natural) - French (France)"];

  function selectVoice() {
    getFrenchVoicesByNames(allowedNames).then(({ frenchVoices, allVoices }) => {
      if (frenchVoices.length > 0) {
        utterance.voice = frenchVoices[0];
        console.log(`Selected voice :`);
        console.log(utterance.voice);
      } else {
        alert("No voice found for the companion. Please reload the page or check the console for available voices");
        console.log("No voice found for the companion. Complete list of voices :");
        allVoices.forEach(voice => console.log(voice));
      }
    });
  }

  window.speechSynthesis.onvoiceschanged = function () {
    selectVoice();
  }
  selectVoice();
}

function getFrenchVoicesByNames(allowedNames) {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;

    function checkVoices() {
      let voices = synth.getVoices();
      if (voices.length > 0) {
        const frenchVoices = voices.filter(voice =>
          voice.lang.includes('fr') && allowedNames.includes(voice.name)
        );
        resolve({ frenchVoices, allVoices: voices });
      } else {
        synth.onvoiceschanged = () => resolve(getFrenchVoicesByNames(allowedNames));
      }
    }

    checkVoices();
  });
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
