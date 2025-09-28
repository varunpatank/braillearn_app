// Simple GPIO Test for Arduino Nano ESP32
// Tests GPIO pins 2-7 and built-in LED

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("=== GPIO Test Starting ===");
  
  // Initialize GPIO pins 2-7 as outputs
  for (int pin = 2; pin <= 7; pin++) {
    pinMode(pin, OUTPUT);
    digitalWrite(pin, LOW);
    Serial.print("GPIO ");
    Serial.print(pin);
    Serial.println(" initialized as OUTPUT");
  }
  
  // Try to find built-in LED
  int ledPins[] = {2, 8, 13, 25, 26, 27, 48};
  for (int i = 0; i < 7; i++) {
    pinMode(ledPins[i], OUTPUT);
    digitalWrite(ledPins[i], HIGH);
    delay(200);
    digitalWrite(ledPins[i], LOW);
    delay(200);
    Serial.print("Tested LED pin: ");
    Serial.println(ledPins[i]);
  }
  
  Serial.println("=== GPIO Test Complete ===");
}

void loop() {
  Serial.println("Testing GPIO pins 2-7...");
  
  // Test each GPIO pin
  for (int pin = 2; pin <= 7; pin++) {
    Serial.print("Testing GPIO ");
    Serial.print(pin);
    Serial.println(" HIGH");
    digitalWrite(pin, HIGH);
    delay(1000);
    
    Serial.print("Testing GPIO ");
    Serial.print(pin);
    Serial.println(" LOW");
    digitalWrite(pin, LOW);
    delay(1000);
  }
  
  Serial.println("--- Test cycle complete ---");
  delay(2000);
}