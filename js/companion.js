var msg = new SpeechSynthesisUtterance();

function speakText(text) {
  msg.text = text;
  var voices = window.speechSynthesis.getVoices();
  var frenchVoice = voices.find(function (voice) {
    return voice.name === 'Microsoft Paul - French (France)';
  });
  if (frenchVoice) {
    msg.voice = frenchVoice;
    window.speechSynthesis.speak(msg);
  } else {
    console.error("La voix spécifique n'est pas disponible.");
    alert("La voix spécifique n'est pas disponible.");
  }
}