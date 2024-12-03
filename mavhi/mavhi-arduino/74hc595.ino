#include "74hc595.h"

const int numRegisters = 3;
byte registerValues[numRegisters];

void fillRegisters(byte value) {
  for (int i = 0; i < numRegisters; i++) {
    registerValues[i] = value;
  }
}

void clearRegisters() {
  fillRegisters(0b00000000);
}

void writeRegisters() {
  digitalWrite(SHIFT_01_LATCH_PIN, LOW); 

  for (int i = numRegisters - 1; i >= 0; i--) {
    shiftOut(SHIFT_01_DATA_PIN, SHIFT_01_CLOCK_PIN, MSBFIRST, registerValues[i]);
  }

  digitalWrite(SHIFT_01_LATCH_PIN, HIGH);
}

void ShiftOut(byte data) {
  digitalWrite(SHIFT_01_LATCH_PIN, LOW);

  for (int i = 7; i >= 0; i--) {
    digitalWrite(SHIFT_01_CLOCK_PIN, LOW);
    digitalWrite(SHIFT_01_DATA_PIN, (data & (1 << i)) ? HIGH : LOW);
    digitalWrite(SHIFT_01_CLOCK_PIN, HIGH);
  }

  digitalWrite(SHIFT_01_LATCH_PIN, HIGH);
}