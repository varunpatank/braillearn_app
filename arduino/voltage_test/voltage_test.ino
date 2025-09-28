// Voltage and Power Test
// Helps diagnose power supply issues

#define SOLENOID_PIN 2
#define LED_PIN 48

void setup() {
  Serial.begin(115200);
  delay(2000);
  
  Serial.println("=== VOLTAGE TEST PROGRAM ===");
  Serial.println("This will help diagnose power issues");
  
  pinMode(SOLENOID_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  
  digitalWrite(SOLENOID_PIN, LOW);
  digitalWrite(LED_PIN, LOW);
  
  Serial.println("Starting voltage test...");
}

void loop() {
  // Test 1: LED only (low current)
  Serial.println("TEST 1: LED only (low current test)");
  digitalWrite(LED_PIN, HIGH);
  delay(1000);
  digitalWrite(LED_PIN, LOW);
  delay(1000);
  
  // Test 2: Solenoid activation (high current)
  Serial.println("TEST 2: Solenoid activation (high current test)");
  Serial.println("If solenoid doesn't move, check:");
  Serial.println("1. Power supply voltage (should be 5V)");
  Serial.println("2. Power supply current rating (should be 1A+)");
  Serial.println("3. Solenoid connections");
  Serial.println("4. ULN2803 wiring");
  
  digitalWrite(SOLENOID_PIN, HIGH);
  Serial.println("Solenoid should PUSH DOWN now...");
  delay(3000);
  
  digitalWrite(SOLENOID_PIN, LOW);
  Serial.println("Solenoid should RETRACT UP now...");
  delay(3000);
  
  Serial.println("--- End of test cycle ---");
  delay(2000);
}