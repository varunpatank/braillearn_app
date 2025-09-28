// Success Test - Full Arduino + Solenoid Control
// This should work if everything is connected correctly

void setup() {
  Serial.begin(115200);
  delay(3000);
  
  Serial.println("╔══════════════════════════════════════╗");
  Serial.println("║     🎉 SUCCESS TEST 🎉               ║");
  Serial.println("║  Arduino + External Power + Solenoid ║");
  Serial.println("╚══════════════════════════════════════╝");
  Serial.println("");
  
  pinMode(2, OUTPUT);
  digitalWrite(2, LOW);
  
  Serial.println("If this works, you're ready for the full braille display!");
  Serial.println("Starting automated test...");
  delay(2000);
}

void loop() {
  // Test pattern: short pulses
  Serial.println("🟢 Quick pulse test");
  digitalWrite(2, HIGH);
  delay(500);
  digitalWrite(2, LOW);
  delay(1000);
  
  // Test pattern: longer activation
  Serial.println("🔵 Long activation test");
  digitalWrite(2, HIGH);
  delay(2000);
  digitalWrite(2, LOW);
  delay(2000);
  
  // Test pattern: rapid pulses
  Serial.println("🟡 Rapid pulse test");
  for (int i = 0; i < 5; i++) {
    digitalWrite(2, HIGH);
    delay(200);
    digitalWrite(2, LOW);
    delay(200);
  }
  delay(3000);
  
  Serial.println("✅ All tests complete - solenoid working!");
  Serial.println("Ready for full 6-solenoid braille display!");
  Serial.println("");
  delay(3000);
}