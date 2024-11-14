var gameContainer = document.getElementById("booleanhero-container");
var hitZone = document.getElementById("hit-zone");
var scoreCounter = document.getElementById("booleanhero-score-counter");
var music = document.getElementById("booleanhero-music");
var edgeEffects = document.querySelectorAll('.edge-effect');

const blockSpeed = 3;
let score = 0;
let keysPressed = {};

// Music BPM and beat interval in milliseconds
const BPM = 100;
const beatInterval = 60000 / BPM;

// Set the start and end times (in seconds) for the audio segment you want to play
const audioStartTime = 10;
const audioEndTime = 80;

// Mapping array for beats and required actions with wait beats
const beatMap = [
  { beat: 4, requiredPress: "A AND NOT B" },
  { beat: 2, requiredPress: "NOT A AND B" },
  { beat: 3, requiredPress: "A AND NOT B" },
  { beat: 5, requiredPress: "NOT A AND NOT B" },
  { beat: 6, requiredPress: "NOT A AND NOT B" },
  { beat: 4, requiredPress: "A AND NOT B" },
  { beat: 7, requiredPress: "NOT A AND B" },
  { beat: 3, requiredPress: "A AND NOT B" },
  { beat: 6, requiredPress: "NOT A AND NOT B" },
  { beat: 4, requiredPress: "NOT A AND B" },
  { beat: 5, requiredPress: "A AND NOT B" },
  { beat: 8, requiredPress: "A AND NOT B" },
  { beat: 2, requiredPress: "NOT A AND NOT B" },
  { beat: 3, requiredPress: "NOT A AND B" },
  { beat: 5, requiredPress: "A AND NOT B" },
  { beat: 4, requiredPress: "NOT A AND B" },
  { beat: 6, requiredPress: "NOT A AND NOT B" },
  { beat: 3, requiredPress: "A AND NOT B" },
  { beat: 5, requiredPress: "NOT A AND B" },
  { beat: 4, requiredPress: "A AND NOT B" },
  { beat: 2, requiredPress: "NOT A AND NOT B" },
  { beat: 3, requiredPress: "A AND NOT B" },
  { beat: 4, requiredPress: "A AND NOT B" },
  { beat: 6, requiredPress: "NOT A AND NOT B" },
  { beat: 7, requiredPress: "NOT A AND NOT B" },
  { beat: 4, requiredPress: "NOT A AND B" },
  { beat: 5, requiredPress: "NOT A AND NOT B" },
  { beat: 3, requiredPress: "A AND NOT B" },
  { beat: 4, requiredPress: "A AND NOT B" },
  { beat: 5, requiredPress: "NOT A AND B" },
  { beat: 4, requiredPress: "NOT A AND NOT B" },
  { beat: 2, requiredPress: "A AND NOT B" },
  { beat: 6, requiredPress: "NOT A AND B" },
  { beat: 3, requiredPress: "A AND NOT B" }
];

// Map for displaying the required press conditions
const displayMap = {
  "A AND B": "A ∧ B",
  "NOT A AND B": "<span class='not'>A</span><span> ∧ B</span>",
  "A AND NOT B": "<span>A ∧ </span><span class='not'>B</span>",
  "NOT A AND NOT B": "<span class='not'>A</span><span> ∧ </span><span class='not'>B</span>"
};

let currentBeatIndex = 0;
let beatsPassed = 0;
let blockInterval;

// Function to create a new block if no block is currently active
function createBlock(condition) {
  const block = document.createElement("div");
  block.classList.add("block");
  block.style.top = "0px";
  block.innerHTML = displayMap[condition] || condition;
  block.dataset.requiredPress = condition;
  gameContainer.appendChild(block);
  return block; // Return the block created
}

// Function to move all blocks downwards
function moveBlocks() {
  const blocks = document.querySelectorAll(".block");
  blocks.forEach(block => {
    let blockTop = parseInt(block.style.top);
    block.style.top = (blockTop + blockSpeed) + "px";

    const hitZoneRect = hitZone.getBoundingClientRect();
    const blockRect = block.getBoundingClientRect();

    // Check if the block is in the hit zone
    if (blockRect.top >= hitZoneRect.bottom) {
      evaluateBlockCondition(block);
    }

    // Remove the block if it moves past the game container
    if (blockTop > 800) {
      console.log('Block moved past the game container, removing it.');
      gameContainer.removeChild(block);
    }
  });
}

// Function to evaluate the block condition
function evaluateBlockCondition(block) {
  const requiredPress = block.dataset.requiredPress;

  if (requiredPress === "NOT A AND NOT B" && !keysPressed["ArrowLeft"] && !keysPressed["ArrowRight"]) {
    console.log(`Evaluating block condition: ${requiredPress}`);
    handleScore(true);
    console.log('Block removed because of condition');
    gameContainer.removeChild(block);
  }
}

// Key press handling and score
function handleKeyPress(event) {
  // Check if the current block is in the hit zone
  const hitZoneRect = hitZone.getBoundingClientRect();
  const blocks = document.querySelectorAll(".block");
  let keyHandled = false;

  blocks.forEach(block => {
    const blockRect = block.getBoundingClientRect();
    if (blockRect.bottom >= hitZoneRect.top && blockRect.top <= hitZoneRect.bottom) {
      keysPressed[event.key] = true;
      const requiredPress = block.dataset.requiredPress;
      let isCorrect = false;

      console.log(`Key pressed: ${event.key}`); // Log key press

      if (requiredPress === "NOT A AND B" && event.key === "à") {
        isCorrect = true;
      } else if (requiredPress === "A AND NOT B" && event.key === "&") {
        isCorrect = true;
      } else if (requiredPress === "A AND B" && keysPressed["&"] && keysPressed["à"]) {
        isCorrect = true;
      }

      if (isCorrect) {
        console.log(`Correct key pressed for block: ${requiredPress}`); // Log success
        handleScore(true);
        gameContainer.removeChild(block);
        keyHandled = true; // Mark that a key has been handled
      }
    }
  });
}

function handleKeyUp(event) {
  keysPressed[event.key] = false;
}

function handleScore(success) {
  score += success ? 1 : -1;
  console.log(`Score updated: ${score}`);
  scoreCounter.textContent = "Score: " + score;

  // Activate edge effect
  edgeEffects.forEach(edge => edge.classList.add("active"));
  setTimeout(() => {
    edgeEffects.forEach(edge => edge.classList.remove("active"));
  }, 1000);
}

// Function to fade out the audio
function fadeOutAudio(duration) {
  let volume = music.volume; // Initial volume
  const fadeOutInterval = 100; // Fade out interval in ms
  const fadeOutSteps = duration / fadeOutInterval; // Number of steps

  const fadeOut = setInterval(() => {
    volume -= 1 / fadeOutSteps; // Decrease volume
    if (volume <= 0) {
      volume = 0;
      clearInterval(fadeOut);
      music.pause(); // Stop the audio
      stopGame();
      music.currentTime = audioStartTime; // Reset to start time if needed
    }
    music.volume = volume; // Set the new volume
  }, fadeOutInterval);
}

// Function to play music and start blocks on beats
function startGame() {
  music.currentTime = audioStartTime;
  music.play();
  blockInterval = setInterval(spawnBlockOnBeat, beatInterval);

  // Fade out the audio before it ends
  const fadeOutTime = 3000; // Time before audio ends to start fading out

  // Event listener to stop audio at the specified end time
  music.addEventListener("timeupdate", () => {
    if (music.currentTime >= audioEndTime) {
      fadeOutAudio(fadeOutTime); // Start fading out before audio ends
      clearInterval(blockInterval); // Stop generating blocks
    }
  });
}

// Function to spawn a block based on the current beat
function spawnBlockOnBeat() {
  console.log(`Beats passed: ${beatsPassed}, Current Beat Index: ${currentBeatIndex}`); // Log beat status

  // Create block if we have waited enough beats
  if (beatsPassed >= beatMap[currentBeatIndex]?.beat) {
    const beatInfo = beatMap[currentBeatIndex];
    console.log(`Creating block for beat index: ${currentBeatIndex}, required press: ${beatInfo.requiredPress}`); // Log block spawn
    createBlock(beatInfo.requiredPress);
    currentBeatIndex++;
    beatsPassed = 0; // Reset beats passed after spawning a block

    // If we run out of beats, stop the interval
    if (currentBeatIndex >= beatMap.length) {
      console.log(`No more beats, ending the game`);
      clearInterval(blockInterval);
    }
  } else {
    beatsPassed++; // Increment the count of beats passed
  }
}

function stopGame() {
  const blocks = document.querySelectorAll(".block");
  blocks.forEach(block => gameContainer.removeChild(block)); // Clear any existing blocks
}

function adaptSection(divId, finalHeight, duration, callback) {
  const element = document.getElementById(divId);
  const titleElement = document.getElementById("booleanAlgrebraTitle");
  let sectionElement = element;
  while (sectionElement) {
    if (sectionElement.tagName === 'SECTION') {
      break;
    }
    sectionElement = sectionElement.parentElement;
  }

  if (sectionElement && element) {

    let currentHeight = 0;
    let currentTop = parseFloat(getComputedStyle(sectionElement).top) || 0;
    let currentOpacity = 1;
    let currentFadeHeight = titleElement.offsetHeight;

    const intervalTime = 10;
    const heightIncrement = finalHeight / (duration / intervalTime);
    const topDecrement = currentTop / (duration / intervalTime);
    const opacityDecrement = 1 / (duration / intervalTime);
    const fadeHeightDecrement = currentFadeHeight / (duration / intervalTime);

    const animation = setInterval(() => {
      // Increase height container
      currentHeight += heightIncrement;
      if (currentHeight >= finalHeight) {
        element.style.height = `${finalHeight}px`;
      } else {
        element.style.height = `${currentHeight}px`;
      }

      // Reduce section top
      currentTop -= topDecrement;
      if (currentTop <= 0) {
        sectionElement.style.top = `0`;
      } else {
        sectionElement.style.top = `${currentTop}px`;
      }

      // Decrease opacity for the fade-out effect
      currentOpacity -= opacityDecrement;
      currentFadeHeight -= fadeHeightDecrement;
      if (currentOpacity <= 0) {
        titleElement.style.opacity = 0;
      } else {
        titleElement.style.opacity = currentOpacity;
        titleElement.style.height = `${Math.max(0, currentFadeHeight)}px`;
      }

      // Stoppe l'animation quand les deux critères sont atteints
      if (currentHeight >= finalHeight && currentTop <= 0 && currentOpacity <= 0) {
        clearInterval(animation);
        if (typeof callback === "function") callback();
      }
    }, intervalTime);
  }
}

function initBooleanHero() {
  gameContainer = document.getElementById("booleanhero-container");
  hitZone = document.getElementById("hit-zone");
  scoreCounter = document.getElementById("booleanhero-score-counter");
  music = document.getElementById("booleanhero-music");
  edgeEffects = document.querySelectorAll('.edge-effect');

  document.addEventListener("keydown", handleKeyPress);
  document.addEventListener("keyup", handleKeyUp);

  keysPressed = { "ArrowLeft": false, "ArrowRight": false };

  adaptSection("booleanhero-container", 600, 2000, () => {
    startGame();
    requestAnimationFrame(function gameLoop() {
      moveBlocks();
      requestAnimationFrame(gameLoop);
    });
  })
}