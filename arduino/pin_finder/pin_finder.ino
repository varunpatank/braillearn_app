// Pin Finder - Discovers which pin has the LED
// Blinks each pin one at a time

void setup() {
  Serial.begin(115200);
  delay(3000);
  
  Serial.println("=== PIN FINDER ===");
  Serial.println("Finding which pin has the LED...");
  Serial.println("Watch your board for blinking!");
}

void loop() {
  // Test common ESP32 LED pins one by one
  int testPins[] = {2, 8, 13, 25, 26, 27, 32, 33, 48};
  int numPins = sizeof(testPins) / sizeof(testPins[0]);
  
  for (int i = 0; i < numPins; i++) {
    int pin = testPins[i];
    
    Serial.print("Testing pin ");
    Serial.print(pin);
    Serial.println(" - watch for LED!");
    
    pinMode(pin, OUTPUT);
    
    // Blink this pin 5 times
    for (int blink = 0; blink < 5; blink++) {
      digitalWrite(pin, HIGH);
      delay(200);
      digitalWrite(pin, LOW);
      delay(200);
    }
    
    Serial.print("Pin ");
    Serial.print(pin);
    Serial.println(" test complete");
    
    delay(1000);  // Pause between pins
  }
  
  Serial.println("--- All pins tested ---");
  Serial.println("Did you see any LED blink?");
  Serial.println("Repeating test...");
  Serial.println("");
  
  delay(2000);
}