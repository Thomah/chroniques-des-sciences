#include "74hc595.h"

byte SHIFT_REGISTRY = 0b00000000;

void InsertFirstBit() {
  // Set SHIFT_01_DATA_PIN high to insert first bit
  digitalWrite(SHIFT_01_DATA_PIN, HIGH);
  Clock();
  digitalWrite(SHIFT_01_DATA_PIN, LOW);
  Latch();
}

void Clock() {
  // When we set the clock HIGH, the shift register shifts the output by one bit.
  digitalWrite(SHIFT_01_CLOCK_PIN, LOW);
  delay(1);
  digitalWrite(SHIFT_01_CLOCK_PIN, HIGH);
}

// Flush shift register values to outputs.
void Latch() {
  digitalWrite(SHIFT_01_LATCH_PIN, LOW);
  delay(1);
  digitalWrite(SHIFT_01_LATCH_PIN, HIGH);
}
