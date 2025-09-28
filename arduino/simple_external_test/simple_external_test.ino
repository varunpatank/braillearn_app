// Simple External Power Test
// Clear instructions for connecting external 5V power

void setup() {
  Serial.begin(115200);
  delay(3000);
  
  Serial.println("=== SIMPLE EXTERNAL POWER TEST ===");
  Serial.println("");
  Serial.println("STEP-BY-STEP CONNECTIONS:");
  Serial.println("1. Keep USB cable connected");
  Serial.println("2. External 5V power supply:");
  Serial.println("   Red wire (+) → VIN pin on Arduino");
  Serial.println("   Black wire (-) → GND pin near VIN");
  Serial.println("3. Solenoid:");
  Serial.println("   Positive wire → GPIO 2 pin");
  Serial.println("   Negative wire → GND pin near GPIO 2");
  Serial.println("");
  Serial.println("NOTE: Arduino has 2 GND pins - use both!");
  Serial.println("");
  
  pinMode(2, OUTPUT);
  digitalWrite(2, LOW);
  
  Serial.println("✅ Setup complete!");
  Serial.println("If connected correctly, solenoid will move every 3 seconds");
  delay(3000);
}

void loop() {
  Serial.println("🔴 Solenoid should PUSH DOWN now");
  digitalWrite(2, HIGH);
  delay(2000);
  
  Serial.println("🔵 Solenoid should RETRACT UP now");
  digitalWrite(2, LOW);
  delay(3000);
  
  Serial.println("--- Cycle complete ---");
}