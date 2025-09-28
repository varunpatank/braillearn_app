// External Power Solenoid Test
// Arduino controls solenoid with external 5V power

void setup() {
  Serial.begin(115200);
  delay(3000);
  
  Serial.println("=== EXTERNAL POWER SOLENOID TEST ===");
  Serial.println("Arduino + External 5V Power + Solenoid");
  Serial.println("");
  
  Serial.println("CONNECTIONS NEEDED:");
  Serial.println("1. Keep USB connected (for programming/serial)");
  Serial.println("2. Connect external 5V power:");
  Serial.println("   - Power supply +5V → Arduino VIN pin");
  Serial.println("   - Power supply GND → Arduino GND pin");
  Serial.println("3. Connect solenoid:");
  Serial.println("   - Solenoid + wire → Arduino GPIO 2");
  Serial.println("   - Solenoid - wire → Arduino GND");
  Serial.println("");
  
  pinMode(2, OUTPUT);
  digitalWrite(2, LOW);  // Start OFF
  
  Serial.println("Setup complete!");
  Serial.println("External power should now control solenoid");
  delay(3000);
}

void loop() {
  Serial.println("🔴 SOLENOID TEST CYCLE");
  Serial.println("");
  
  Serial.println("Phase 1: Solenoid OFF");
  Serial.println("GPIO 2 = LOW → Solenoid should be RETRACTED (UP)");
  digitalWrite(2, LOW);
  delay(3000);
  
  Serial.println("Phase 2: Solenoid ON");
  Serial.println("GPIO 2 = HIGH → Solenoid should PUSH DOWN");
  Serial.println("*** WATCH FOR MOVEMENT NOW ***");
  digitalWrite(2, HIGH);
  delay(3000);
  
  Serial.println("Phase 3: Solenoid OFF again");
  Serial.println("GPIO 2 = LOW → Solenoid should RETRACT UP");
  digitalWrite(2, LOW);
  delay(3000);
  
  Serial.println("✅ Test cycle complete!");
  Serial.println("Did you see the solenoid move up and down?");
  Serial.println("");
  delay(2000);
}