var utterance = new SpeechSynthesisUtterance();

function initCompanion() {
  const allowedNames = [
    "Microsoft Paul - French (France)",
    "Microsoft RemyMultilingual Online (Natural) - French (France)",
    "Microsoft Henri Online (Natural) - French (France)",
    "French (France)+Paul"
  ];

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

function checkServerAvailability() {
  return fetch('http://localhost:5500/', { method: 'GET', mode: 'cors' })
    .then(response => response.ok)
    .catch(() => false);
}

function useOpenTTS(text, callback) {

  // Encode the text to ensure it works in the URL
  const encodedText = encodeURIComponent(text);
  const voice = 'larynx:tom-glow_tts';
  const vocoder = 'high';
  const denoiserStrength = 0.005;
  const cache = 'true';

  // Construct the URL with query parameters
  const url = `http://localhost:5500/api/tts?voice=${voice}&text=${encodedText}&vocoder=${vocoder}&denoiserStrength=${denoiserStrength}&cache=${cache}`;

  // Make the GET request to OpenTTS
  fetch(url, { method: 'GET', headers: { 'Accept': '*/*' } })
    .then(response => response.blob())  // Expecting the audio as a blob
    .then(audioBlob => {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();

      // Execute the callback when the audio finishes
      audio.onended = () => {
        if (callback && typeof callback === 'function') {
          callback();  // Execute the callback after playback
        }
      };
    })
    .catch(err => {
      console.error('Error generating voice via OpenTTS:', err);
    });
}

function useBrowserTTS(text, callback) {
  utterance.text = text;
  utterance.lang = 'fr-FR';
  window.speechSynthesis.speak(utterance);
  utterance.onend = () => {
    if (callback && typeof callback === 'function') {
      callback();
    }
  };
}

function speak(text) {

  checkServerAvailability().then(isAvailable => {
    const subtitleElement = document.getElementById('companion-subtitles');
    const textElement = subtitleElement.querySelector('.text');

    // Update subtitles when speaking
    subtitleElement.style.visibility = 'visible';
    textElement.textContent = text;

    console.log(isAvailable);

    if (isAvailable) {
      console.log('OpenTTS server is available. Using OpenTTS API...');
      useOpenTTS(text, () => {
        subtitleElement.style.visibility = 'hidden';
        textElement.textContent = '';
      });
    } else {
      console.log('OpenTTS server is unavailable. Using browser speech synthesis...');
      useBrowserTTS(text, () => {
        subtitleElement.style.visibility = 'hidden';
        textElement.textContent = '';
      });
    }
  });

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
  const [url, volume, startTimeStr, endTimeStr] = args.split(';');

  const startTime = parseFloat(startTimeStr) || 0;
  const endTime = endTimeStr ? parseFloat(endTimeStr) : null;

  const audio = new Audio(url);
  audio.volume = volume;

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
