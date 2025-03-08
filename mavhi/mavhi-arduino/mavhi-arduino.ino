#include <Stepper.h>
#include <Wire.h>
#include "74hc595.h"
#include "MCP23017.h"

bool strobeActive = false;
bool rotateMinuteActive = false;
bool allLightsActive = false;

// MCP23017
MCP23017 mcp;

const uint8_t motorPins[4] = {1, 3, 2, 4};  // GPB0-3 sur MCP23017

const uint8_t steps[8][4] = {
  {1, 0, 0, 0},  // Phase 1
  {1, 1, 0, 0},  // Phase 2
  {0, 1, 0, 0},  // Phase 3
  {0, 1, 1, 0},  // Phase 4
  {0, 0, 1, 0},  // Phase 5
  {0, 0, 1, 1},  // Phase 6
  {0, 0, 0, 1},  // Phase 7
  {1, 0, 0, 1}   // Phase 8
};

// Arcade buttons
const int ARCADE_RED_SW_PIN = 2;
const int ARCADE_RED_LED_PIN = 12;
const int ARCADE_BLUE_SW_PIN = 3;
const int ARCADE_BLUE_LED_PIN = 13;
const long ARCADE_MIN_INTERVAL = 1000;
unsigned long arcadeRedPreviousMillis = 0;
unsigned long arcadeBluePreviousMillis = 0;

// Initialisation du moteur
// Les pins doivent correspondre à votre configuration de câblage
Stepper myStepper = Stepper(1024, 8, 10, 9, 11);

void setup() {

  // Configure extension boards
    mcp.begin(7);

  // Configurer les broches du MCP23017 en sortie
  for (int i = 0; i < 4; i++) {
    mcp.pinMode(motorPins[i], OUTPUT);
    mcp.digitalWrite(motorPins[i], LOW);
  }

  // Configure arcade buttons
  pinMode(ARCADE_RED_SW_PIN, INPUT_PULLUP);
  pinMode(ARCADE_RED_LED_PIN, OUTPUT);
  pinMode(ARCADE_BLUE_SW_PIN, INPUT_PULLUP);
  pinMode(ARCADE_BLUE_LED_PIN, OUTPUT);

  // Init shift
  pinMode(SHIFT_01_DATA_PIN, OUTPUT);
  pinMode(SHIFT_01_CLOCK_PIN, OUTPUT);
  pinMode(SHIFT_01_LATCH_PIN, OUTPUT);
  clearRegisters();
  writeRegisters();

  // Définir la vitesse du moteur (en tours par minute)
  myStepper.setSpeed(19);

  // Initialisation de la communication série (optionnel pour le débogage)
  Serial.begin(9600);
  Serial.println("Envoyez 'strobe' pour activer le mode stroboscope.");
}

void stepMotor(int step) {
  for (int i = 0; i < 4; i++) {
    mcp.digitalWrite(motorPins[i], steps[step][i]);
  }
}

void loop() {

  // Test motor
  for (int i = 0; i < 8; i++) {
    stepMotor(i);
    delay(5);  // Ajustez selon la vitesse désirée
  }

  // Get command
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    Serial.println("Command received : " + command);

    if (command == "strobe") {
      strobeActive = !strobeActive;
      Serial.println(strobeActive ? "Stroboscope activé." : "Stroboscope désactivé.");
    }
    
    if (command == "rotate-minute") {
      rotateMinuteActive = !rotateMinuteActive;
      Serial.println(rotateMinuteActive ? "Minute motor is rotating." : "Motor minute stopped.");
    }

    if (command == "all-lights") {
      allLightsActive = !allLightsActive;
      Serial.println(allLightsActive ? "All lights activated." : "All lights deactivated.");
    }
  }
  
  // Manage arcade buttons
  int arcadeRedSwState = digitalRead(ARCADE_RED_SW_PIN);
  if (arcadeRedSwState == LOW) {
    digitalWrite(ARCADE_RED_LED_PIN, HIGH);
    unsigned long currentMillis = millis();
    if (currentMillis - arcadeRedPreviousMillis >= ARCADE_MIN_INTERVAL) {
      arcadeRedPreviousMillis = currentMillis;
      Serial.println("ARCADE_RED_BUTTON_PRESSED");
    }
  } else {
    if(allLightsActive) {
      digitalWrite(ARCADE_RED_LED_PIN, HIGH);
    } else {
      digitalWrite(ARCADE_RED_LED_PIN, LOW);
    }
  }
  int arcadeBlueSwState = digitalRead(ARCADE_BLUE_SW_PIN);
  if (arcadeBlueSwState == LOW) {
    digitalWrite(ARCADE_BLUE_LED_PIN, HIGH);
    unsigned long currentMillis = millis();
    if (currentMillis - arcadeBluePreviousMillis >= ARCADE_MIN_INTERVAL) {
      arcadeBluePreviousMillis = currentMillis;
      Serial.println("ARCADE_BLUE_BUTTON_PRESSED");
    }
  } else {
    if(allLightsActive) {
      digitalWrite(ARCADE_BLUE_LED_PIN, HIGH);
    } else {
      digitalWrite(ARCADE_BLUE_LED_PIN, LOW);
    }
  }
  
  if (strobeActive) {
    // Turn on the LEDs
    fillRegisters(0b10101010);
    writeRegisters();
    delay(100);

    // Turn off the LEDs
    fillRegisters(0b00000000);
    writeRegisters();
  }
  
  if (rotateMinuteActive) {
    myStepper.step(1024); // Avancer d'une révolution complète
    Serial.println("Le moteur avance");
  }

  if (allLightsActive) {
    fillRegisters(0b10101010);
    writeRegisters();
  } else {
    fillRegisters(0b00000000);
    writeRegisters();
  }
  

  // // Si le bouton "Avancer" est appuyé, faire avancer le moteur d'un certain nombre de pas
  // if (rotateMinuteActive) {
  //   myStepper.step(stepsPerRevolution); // Avancer d'une révolution complète
  //   Serial.println("Le moteur avance");
  // }
  
  // Si aucun bouton n'est appuyé, ne rien faire
  //else {
    // Optionnel : vous pouvez également définir une action de mise en veille ici
  //  Serial.println("Moteur en pause");
  //}

  delay(200);
  
}
