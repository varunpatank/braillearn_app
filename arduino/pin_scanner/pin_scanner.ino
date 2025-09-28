// Pin Scanner - finds which pins work for LED
// Helps identify the correct LED pin for your board

void setup() {
  Serial.begin(115200);
  delay(2000);
  
  Serial.println("=== PIN SCANNER ===");
  Serial.println("Scanning for working LED pins...");
  
  // Common ESP32 LED pins to test
  int testPins[] = {2, 8, 13, 25, 26, 27, 32, 33, 48};
  int numPins = sizeof(testPins) / sizeof(testPins[0]);
  
  for (int i = 0; i < numPins; i++) {
    int pin = testPins[i];
    Serial.print("Testing pin ");
    Serial.print(pin);
    Serial.println("...");
    
    pinMode(pin, OUTPUT);
    
    // Blink 3 times
    for (int j = 0; j < 3; j++) {
      digitalWrite(pin, HIGH);
      delay(200);
      digitalWrite(pin, LOW);
      delay(200);
    }
    
    Serial.print("Pin ");
    Serial.print(pin);
    Serial.println(" test complete");
    delay(1000);
  }
  
  Serial.println("Pin scan complete. Did you see any LEDs blink?");
}

void loop() {
  // Do nothing in loop
  delay(1000);
}