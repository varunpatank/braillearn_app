// Solenoid Test Program for Arduino Nano ESP32
// Tests single solenoid on GPIO 2

#define SOLENOID_PIN 2
#define TEST_LED_PIN 48  // Try built-in LED

void setup() {
  Serial.begin(115200);
  delay(2000);
  
  Serial.println("=== SOLENOID TEST PROGRAM ===");
  Serial.println("Testing solenoid on GPIO 2");
  
  // Initialize pins
  pinMode(SOLENOID_PIN, OUTPUT);
  pinMode(TEST_LED_PIN, OUTPUT);
  
  // Start with solenoid OFF (retracted)
  digitalWrite(SOLENOID_PIN, LOW);
  digitalWrite(TEST_LED_PIN, LOW);
  
  Serial.println("Setup complete");
  Serial.println("Solenoid should be RETRACTED (UP position)");
  delay(3000);
}

void loop() {
  // LED blink to show Arduino is alive
  digitalWrite(TEST_LED_PIN, HIGH);
  delay(100);
  digitalWrite(TEST_LED_PIN, LOW);
  
  Serial.println("--- SOLENOID PUSH DOWN TEST ---");
  Serial.println("Activating solenoid - should PUSH DOWN");
  digitalWrite(SOLENOID_PIN, HIGH);  // Should push DOWN
  delay(2000);  // Hold for 2 seconds
  
  Serial.println("Deactivating solenoid - should RETRACT UP");
  digitalWrite(SOLENOID_PIN, LOW);   // Should retract UP
  delay(3000);  // Wait 3 seconds
  
  Serial.println("Cycle complete. Repeating...");
  delay(1000);
}