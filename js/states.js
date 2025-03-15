async function fetchAndParseYaml(url) {
  try {
      // Télécharger le contenu du fichier YAML depuis l'URL
      const response = await fetch(url);
      const yamlContent = await response.text();

      // Parser le contenu YAML
      const parsedData = parseYaml(yamlContent);

      return parsedData;
  } catch (error) {
      console.error('Erreur lors du téléchargement ou du parsing du fichier YAML:', error);
      throw error;
  }
}

// Fonction basique pour parser YAML
function parseYaml(yamlString) {
  return YAML.parse(yamlString);
}

function getIndexH() {
  var url = window.location.href;
  var segments = url.split("/");
  var numSegments = segments.length;
  var firstNumber, secondNumber, thirdNumber;
  if (numSegments === 7) {
      firstNumber = parseInt(segments[numSegments - 3]);
      secondNumber = parseInt(segments[numSegments - 2]);
      thirdNumber = parseInt(segments[numSegments - 1]);
  } else if (numSegments === 6) {
      firstNumber = parseInt(segments[numSegments - 2]);
      secondNumber = parseInt(segments[numSegments - 1]);
      thirdNumber = 0;
  } else if (numSegments === 5) {
      firstNumber = parseInt(segments[numSegments - 1]);
      secondNumber = 0;
      thirdNumber = 0;
  } else if (numSegments === 4) {
    firstNumber = 0;
  }
  return firstNumber;
}

function getIndexV() {
  var url = window.location.href;
  var segments = url.split("/");
  var numSegments = segments.length;
  var firstNumber, secondNumber, thirdNumber;
  if (numSegments === 7) {
      firstNumber = parseInt(segments[numSegments - 3]);
      secondNumber = parseInt(segments[numSegments - 2]);
      thirdNumber = parseInt(segments[numSegments - 1]);
  } else if (numSegments === 6) {
      firstNumber = parseInt(segments[numSegments - 2]);
      secondNumber = parseInt(segments[numSegments - 1]);
      thirdNumber = 0;
  } else if (numSegments === 5) {
      firstNumber = parseInt(segments[numSegments - 1]);
      secondNumber = 0;
      thirdNumber = 0;
  } else if (numSegments === 4) {
    secondNumber = 0;
  }
  return secondNumber;
}

function getFragmentIndex() {
  var url = window.location.href;
  var segments = url.split("/");
  var numSegments = segments.length;
  var firstNumber, secondNumber, thirdNumber;
  if (numSegments === 7) {
      firstNumber = parseInt(segments[numSegments - 3]);
      secondNumber = parseInt(segments[numSegments - 2]);
      thirdNumber = parseInt(segments[numSegments - 1]);
  } else if (numSegments === 6) {
      firstNumber = parseInt(segments[numSegments - 2]);
      secondNumber = parseInt(segments[numSegments - 1]);
      thirdNumber = 0;
  } else if (numSegments === 5) {
      firstNumber = parseInt(segments[numSegments - 1]);
      secondNumber = 0;
      thirdNumber = 0;
  } else if (numSegments === 4) {
    thirdNumber = 0;
  }
  return thirdNumber;
}

var states = {};
var currentElementIndex = 0;
var elementsTriggered = [];

function initStates() {
  fetchAndParseYaml('states.yaml')
    .then(data => {
        states = data;
        console.log('Contenu YAML parsé:', data);
    })
    .catch(error => {
        console.error('Erreur:', error);
    });
}

function runState(Reveal, stateId, trigger) {
  console.log("Run state: " + stateId);
  var state = states[stateId];
  if(window.self === window.top && state !== undefined) {
    let element = state[currentElementIndex];
    if (currentElementIndex < state.length && element.trigger === trigger && !element.triggered) {
      console.log("Current element index: " + currentElementIndex);
      console.log("Current element trigger : " + element.trigger);
      console.log("Current element triggered : " + element.triggered);
      console.log("Current element exec : " + element.exec);
      elementsTriggered[currentElementIndex] = setTimeout(() => {
        console.log(element.exec);
        switch(element.exec) {
          case 'Reveal.next':
            Reveal.next();
            break;
          default:
            window[element.exec](element.args);
            break;
        }
        element.triggered = true;
        nextState();
        if(`${getIndexH()}_${getIndexV()}` == stateId) {
          runState(Reveal, stateId, "auto");
        }
      }, element.delay);
    }
  }
}

function getStates() {
  return states;
}

function nextState() {
  currentElementIndex = currentElementIndex + 1;
}

function resetState() {
  Object.values(states).forEach(state => {
    state.forEach(element => {
      element.triggered = false;
    });
  });
  currentElementIndex = 0;
}

function waitForUrlChange(callback, checkInterval = 100) {
  let currentUrl = window.location.href;

  const intervalId = setInterval(() => {
    if (currentUrl !== window.location.href) {
      currentUrl = window.location.href;
      callback(currentUrl);
    }
  }, checkInterval);

  // Stop observing if needed
  return () => clearInterval(intervalId);
}