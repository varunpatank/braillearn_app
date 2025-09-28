// Power Supply Tester
// Specifically tests if power supply is adequate

void setup() {
  Serial.begin(115200);
  delay(3000);
  
  Serial.println("=== POWER SUPPLY TESTER ===");
  Serial.println("Testing if power supply is adequate for solenoid");
  Serial.println("");
  
  pinMode(2, OUTPUT);
  digitalWrite(2, LOW);
  
  Serial.println("POWER SUPPLY REQUIREMENTS:");
  Serial.println("- Voltage: 5V DC (±0.2V)");
  Serial.println("- Current: 1A minimum for single solenoid");
  Serial.println("- Type: Switching power supply (wall adapter)");
  Serial.println("");
  
  Serial.println("TESTING PROCEDURE:");
  Serial.println("1. Measure no-load voltage");
  Serial.println("2. Measure voltage under load");
  Serial.println("3. Check for voltage drop");
  Serial.println("");
  
  delay(5000);
}

void loop() {
  Serial.println("╔══════════════════════════════════════╗");
  Serial.println("║       POWER SUPPLY TEST CYCLE       ║");
  Serial.println("╚══════════════════════════════════════╝");
  Serial.println("");
  
  Serial.println("PHASE 1: No load test");
  Serial.println("Measure VIN pin voltage (no solenoid active)");
  Serial.println("Expected: 5.0V ±0.2V");
  digitalWrite(2, LOW);  // No load
  delay(5000);
  
  Serial.println("PHASE 2: Light load test");
  Serial.println("GPIO 2 active but no solenoid connected");
  Serial.println("Measure VIN pin voltage");
  Serial.println("Expected: Still 5.0V ±0.2V");
  digitalWrite(2, HIGH);  // Light load
  delay(3000);
  digitalWrite(2, LOW);
  delay(2000);
  
  Serial.println("PHASE 3: Heavy load test");
  Serial.println("Connect solenoid and activate");
  Serial.println("Measure VIN pin voltage during activation");
  Serial.println("Expected: Should not drop below 4.5V");
  Serial.println("If voltage drops significantly: inadequate power supply");
  digitalWrite(2, HIGH);  // Heavy load
  delay(5000);
  digitalWrite(2, LOW);
  delay(3000);
  
  Serial.println("RESULTS INTERPRETATION:");
  Serial.println("✅ Voltage stays above 4.5V: Power supply OK");
  Serial.println("❌ Voltage drops below 4.5V: Need bigger power supply");
  Serial.println("❌ No voltage at all: Power supply not connected");
  Serial.println("");
  
  delay(5000);
}