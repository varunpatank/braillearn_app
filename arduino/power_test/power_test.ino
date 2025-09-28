// Power Supply Test
// Tests if your power supply can handle solenoid load

#define SOLENOID_PIN 2

void setup() {
  Serial.begin(115200);
  delay(2000);
  
  Serial.println("=== POWER SUPPLY TEST ===");
  Serial.println("This test checks if your power supply is adequate");
  Serial.println("");
  
  pinMode(SOLENOID_PIN, OUTPUT);
  digitalWrite(SOLENOID_PIN, LOW);
  
  Serial.println("POWER REQUIREMENTS:");
  Serial.println("- Voltage: 5V DC (±0.2V)");
  Serial.println("- Current: 500mA minimum per solenoid");
  Serial.println("- For 6 solenoids: 3A minimum");
  Serial.println("");
  
  Serial.println("POWER SUPPLY CHECKLIST:");
  Serial.println("□ Wall adapter (not USB)");
  Serial.println("□ 5V DC output");
  Serial.println("□ 1A+ current rating");
  Serial.println("□ Correct polarity (+ to +, - to -)");
  Serial.println("");
  
  delay(5000);
}

void loop() {
  Serial.println("--- POWER TEST CYCLE ---");
  
  // Test 1: No load
  Serial.println("TEST 1: No load - measuring baseline voltage");
  Serial.println("Measure 5V pin voltage now (should be ~5.0V)");
  delay(3000);
  
  // Test 2: Light load (GPIO only)
  Serial.println("TEST 2: Light load - GPIO pin active");
  digitalWrite(SOLENOID_PIN, HIGH);
  Serial.println("Measure 5V pin voltage now (should still be ~5.0V)");
  delay(3000);
  
  // Test 3: Heavy load simulation
  Serial.println("TEST 3: Heavy load - solenoid should activate");
  Serial.println("Measure 5V pin voltage now");
  Serial.println("If voltage drops below 4.5V, power supply is inadequate");
  delay(5000);
  
  digitalWrite(SOLENOID_PIN, LOW);
  Serial.println("TEST 3 complete - solenoid should deactivate");
  delay(3000);
  
  Serial.println("RESULTS:");
  Serial.println("- If voltage stayed above 4.5V: Power supply OK");
  Serial.println("- If voltage dropped below 4.5V: Need bigger power supply");
  Serial.println("- If solenoid didn't move: Check wiring or solenoid type");
  Serial.println("");
  
  delay(5000);
}