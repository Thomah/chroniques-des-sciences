#include <Stepper.h>
#include <Wire.h>
#include "74hc595.h"
#include "MCP23017.h"

bool strobeActive = false;
bool rotateMinuteActive = false;

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
const int ledPin = 2;
const int switchPin = 3;
unsigned long previousMillis = 0;
const long interval = 1000;

// Initialisation du moteur
// Les pins doivent correspondre à votre configuration de câblage
Stepper myStepper = Stepper(1024, 8, 10, 9, 11);


// Broches pour les boutons poussoirs
const int boutonAvancer = 12;
const int boutonReculer = 13;

// Variables pour stocker l'état des boutons
int etatBoutonAvancer = 0;
int etatBoutonReculer = 0;

// Variables pour stocker l'état des boutons et de détection de clic
int etatBoutonAvancerActuel = 0;
int etatBoutonAvancerPrecedent = 0;
int etatBoutonReculerActuel = 0;
int etatBoutonReculerPrecedent = 0;

void setup() {

  // Configure extension boards
    mcp.begin(7);

  // Configurer les broches du MCP23017 en sortie
  for (int i = 0; i < 4; i++) {
    mcp.pinMode(motorPins[i], OUTPUT);
    mcp.digitalWrite(motorPins[i], LOW);
  }

  // Configure arcade buttons
  pinMode(ledPin, OUTPUT);
  pinMode(switchPin, INPUT_PULLUP);

  // Configurer les broches des boutons comme entrée
  pinMode(boutonAvancer, INPUT_PULLUP);
  pinMode(boutonReculer, INPUT_PULLUP);

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
    Serial.println("Rotating");
    delay(5);  // Ajustez selon la vitesse désirée
  }

  // Get command
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim();

    if (command == "strobe") {
      strobeActive = !strobeActive;
      Serial.println(strobeActive ? "Stroboscope activé." : "Stroboscope désactivé.");
    }
    
    if (command == "rotate-minute") {
      rotateMinuteActive = !rotateMinuteActive;
      Serial.println(rotateMinuteActive ? "Minute motor is rotating." : "Motor minute stopped.");
    }
  }
  
  // Manage arcade buttons
  int switchState = digitalRead(switchPin);
  if (switchState == LOW) {
    digitalWrite(ledPin, HIGH);
    unsigned long currentMillis = millis();
    if (currentMillis - previousMillis >= interval) {
      previousMillis = currentMillis;
      Serial.println("Button1");
    }
  } else {
    digitalWrite(ledPin, LOW);
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
  
  
  // // Lire l'état des boutons
  // etatBoutonAvancer = digitalRead(boutonAvancer);
  // etatBoutonReculer = digitalRead(boutonReculer);

  // // Si le bouton "Avancer" est appuyé, faire avancer le moteur d'un certain nombre de pas
  // if (rotateMinuteActive) {
  //   myStepper.step(stepsPerRevolution); // Avancer d'une révolution complète
  //   Serial.println("Le moteur avance");
  // }
  
  // // Si le bouton "Reculer" est appuyé, faire reculer le moteur d'un certain nombre de pas
  // else if (etatBoutonReculer == LOW) {
  //   myStepper.step(-stepsPerRevolution); // Reculer d'une révolution complète
  //   Serial.println("Le moteur recule");
  // }
  
  // Si aucun bouton n'est appuyé, ne rien faire
  //else {
    // Optionnel : vous pouvez également définir une action de mise en veille ici
  //  Serial.println("Moteur en pause");
  //}

  delay(200);

  //SHIFT_REGISTRY = 0b00000000;
  //updateShiftRegister();
  
}
