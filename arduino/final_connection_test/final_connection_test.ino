// Final Connection Test - Arduino + External Power + Solenoid
// Follow the connection guide exactly

void setup() {
  Serial.begin(115200);
  delay(3000);
  
  Serial.println("╔══════════════════════════════════════╗");
  Serial.println("║    FINAL CONNECTION TEST             ║");
  Serial.println("╚══════════════════════════════════════╝");
  Serial.println("");
  
  Serial.println("REQUIRED CONNECTIONS:");
  Serial.println("1. USB cable → Computer (keep connected)");
  Serial.println("2. External 5V power:");
  Serial.println("   Red (+) → VIN pin (top of Arduino)");
  Serial.println("   Black (-) → GND pin (next to VIN)");
  Serial.println("3. Solenoid:");
  Serial.println("   + wire → GPIO 2 pin");
  Serial.println("   - wire → GND pin (bottom of Arduino)");
  Serial.println("");
  
  pinMode(2, OUTPUT);
  digitalWrite(2, LOW);  // Start OFF
  
  Serial.println("✅ Arduino ready!");
  Serial.println("If connected correctly, solenoid will move");
  delay(5000);
}

void loop() {
  Serial.println("🟢 ACTIVATING SOLENOID");
  Serial.println("Should PUSH DOWN now...");
  digitalWrite(2, HIGH);
  delay(2000);
  
  Serial.println("🔴 DEACTIVATING SOLENOID");
  Serial.println("Should RETRACT UP now...");
  digitalWrite(2, LOW);
  delay(3000);
  
  Serial.println("--- Test cycle complete ---");
  Serial.println("Did you see movement? Y/N");
  Serial.println("");
  delay(1000);
}