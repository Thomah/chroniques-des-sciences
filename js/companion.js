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
  utterance.onend = function(event) {
    subtitleElement.style.visibility = 'hidden';
    textElement.textContent = '';
  };
}