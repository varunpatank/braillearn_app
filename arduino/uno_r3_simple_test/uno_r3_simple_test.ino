// Simple Arduino Uno R3 Test
// Basic solenoid control without braille patterns

#define SOLENOID_PIN 2
#define STATUS_LED 13

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("=== ARDUINO UNO R3 SIMPLE TEST ===");
  Serial.println("Testing solenoid on pin 2");
  Serial.println("Status LED on pin 13");
  Serial.println("");
  
  pinMode(SOLENOID_PIN, OUTPUT);
  pinMode(STATUS_LED, OUTPUT);
  
  digitalWrite(SOLENOID_PIN, LOW);  // Start OFF
  digitalWrite(STATUS_LED, HIGH);   // LED ON to show ready
  
  Serial.println("Setup complete!");
  Serial.println("Solenoid will activate every 3 seconds");
  Serial.println("IMPORTANT: Connect external 5V power to VIN pin!");
  Serial.println("");
}

void loop() {
  Serial.println("🔴 Solenoid ON - should PUSH DOWN");
  digitalWrite(SOLENOID_PIN, HIGH);
  digitalWrite(STATUS_LED, LOW);    // LED off when solenoid active
  delay(1000);
  
  Serial.println("🔵 Solenoid OFF - should RETRACT UP");
  digitalWrite(SOLENOID_PIN, LOW);
  digitalWrite(STATUS_LED, HIGH);   // LED on when solenoid inactive
  delay(3000);
  
  Serial.println("--- Cycle complete ---");
}