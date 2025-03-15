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

function speak(state) {
  print(state);

  audioState = state;
  audioState.args = `audio/dialogs/${state.id}.mp3;1.0;0;1000`

  audio(audioState, () => {
    console.log('TTS audio file not available. Using browser speech synthesis...');
    useBrowserTTS(text, () => {
      hide();
    });
  }, () => {
    hide();
  });
}

function print(state) {

  const section = document.querySelector("section.present");

  if (section) {
    // Create the div element
    const div = document.createElement("div");
    div.id = "companion-subtitles";

    // Create the span elements
    const iconSpan = document.createElement("span");
    iconSpan.className = "icon";
    iconSpan.textContent = "🤖";

    const textSpan = document.createElement("span");
    textSpan.className = "text";
    textSpan.textContent = state.args;

    // Append spans to div
    div.appendChild(iconSpan);
    div.appendChild(textSpan);

    // Append div to the section
    section.appendChild(div);
  }
}

function hide() {
  const subtitlesDiv = document.getElementById("companion-subtitles");
  if (subtitlesDiv) {
      subtitlesDiv.remove();
  }
}

function audio(state, onError, onEnd) {
  const [url, volume, startTimeStr, endTimeStr] = state.args.split(';');

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

  audio.onerror = () => {
      if (onError) {
        onError(new Error("Failed to load audio"));
      }
  };
  
  audio.onended = () => {
      if (onEnd) {
        onEnd();
      }
  };
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
