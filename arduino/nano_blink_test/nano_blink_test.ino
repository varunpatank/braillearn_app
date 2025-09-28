// Arduino Nano ESP32 - Universal Blink Test
// Tests multiple pins to find which one works

void setup() {
  Serial.begin(115200);
  delay(3000);  // Give ESP32 time to start
  
  Serial.println("=== ARDUINO NANO ESP32 BLINK TEST ===");
  Serial.println("Testing multiple pins to find working LED");
  Serial.println("Watch for any blinking lights on your board");
  
  // Test all common LED pins on ESP32 boards
  int testPins[] = {2, 8, 13, 25, 26, 27, 32, 33, 48};
  int numPins = sizeof(testPins) / sizeof(testPins[0]);
  
  // Initialize all pins as outputs
  for (int i = 0; i < numPins; i++) {
    pinMode(testPins[i], OUTPUT);
    digitalWrite(testPins[i], LOW);
    Serial.print("Initialized pin ");
    Serial.println(testPins[i]);
  }
  
  Serial.println("Setup complete - starting blink test");
  Serial.println("Look for blinking LED on your board!");
}

void loop() {
  // Test pins that commonly have LEDs on ESP32 boards
  int ledPins[] = {2, 8, 13, 25, 26, 27, 32, 33, 48};
  int numPins = sizeof(ledPins) / sizeof(ledPins[0]);
  
  Serial.println("--- BLINK CYCLE START ---");
  
  // Turn ALL pins ON
  for (int i = 0; i < numPins; i++) {
    digitalWrite(ledPins[i], HIGH);
  }
  Serial.println("All pins HIGH - LED should be ON");
  delay(1000);
  
  // Turn ALL pins OFF
  for (int i = 0; i < numPins; i++) {
    digitalWrite(ledPins[i], LOW);
  }
  Serial.println("All pins LOW - LED should be OFF");
  delay(1000);
  
  // Test each pin individually
  for (int i = 0; i < numPins; i++) {
    Serial.print("Testing pin ");
    Serial.print(ledPins[i]);
    Serial.println(" individually");
    
    digitalWrite(ledPins[i], HIGH);
    delay(300);
    digitalWrite(ledPins[i], LOW);
    delay(300);
  }
  
  Serial.println("--- BLINK CYCLE COMPLETE ---");
  delay(2000);
}