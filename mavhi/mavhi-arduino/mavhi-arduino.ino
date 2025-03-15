#include <Stepper.h>

// Arcade buttons
const int ledPin = 2;
const int switchPin = 3;
unsigned long previousMillis = 0;
const long interval = 1000;

// Définition des paramètres du moteur
const int stepsPerRevolution = 2048;

// Initialisation du moteur
// Les pins doivent correspondre à votre configuration de câblage
Stepper myStepper = Stepper(stepsPerRevolution, 8, 10, 9, 11);

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
  // Configure arcade buttons
  pinMode(ledPin, OUTPUT);
  pinMode(switchPin, INPUT_PULLUP);

  // Configurer les broches des boutons comme entrée
  pinMode(boutonAvancer, INPUT_PULLUP);
  pinMode(boutonReculer, INPUT_PULLUP);

  // Définir la vitesse du moteur (en tours par minute)
  myStepper.setSpeed(19);

  // Initialisation de la communication série (optionnel pour le débogage)
  Serial.begin(9600);
}

void loop() {
  
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

  // Lire l'état des boutons
  etatBoutonAvancer = digitalRead(boutonAvancer);
  etatBoutonReculer = digitalRead(boutonReculer);

  // Si le bouton "Avancer" est appuyé, faire avancer le moteur d'un certain nombre de pas
  if (etatBoutonAvancer == LOW) {
    myStepper.step(stepsPerRevolution); // Avancer d'une révolution complète
    Serial.println("Le moteur avance");
  }
  
  // Si le bouton "Reculer" est appuyé, faire reculer le moteur d'un certain nombre de pas
  else if (etatBoutonReculer == LOW) {
    myStepper.step(-stepsPerRevolution); // Reculer d'une révolution complète
    Serial.println("Le moteur recule");
  }
  
  // Si aucun bouton n'est appuyé, ne rien faire
  else {
    // Optionnel : vous pouvez également définir une action de mise en veille ici
    Serial.println("Moteur en pause");
  }

  // Petite pause pour éviter la détection multiple lors de l'appui d'un bouton
  delay(100);
}
