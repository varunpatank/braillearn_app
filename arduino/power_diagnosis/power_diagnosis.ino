// Power Diagnosis Program
// Helps identify power supply issues

void setup() {
  Serial.begin(115200);
  delay(3000);
  
  Serial.println("=== POWER DIAGNOSIS ===");
  Serial.println("Checking power supply setup...");
  
  pinMode(2, OUTPUT);
  digitalWrite(2, LOW);
  
  Serial.println("POWER CHECKLIST:");
  Serial.println("1. Is external 5V power connected to VIN pin?");
  Serial.println("2. Is GND connected between power supply and Arduino?");
  Serial.println("3. Is power supply rated for 1A or more?");
  Serial.println("4. Is power supply actually 5V DC (not AC)?");
  Serial.println("");
  
  delay(5000);
}

void loop() {
  Serial.println("--- POWER TEST ---");
  Serial.println("If this message stops appearing, power supply failed");
  
  // Very gentle test - just GPIO, no solenoid
  digitalWrite(2, HIGH);
  Serial.println("GPIO 2 is HIGH (should be 3.3V if measured)");
  delay(2000);
  
  digitalWrite(2, LOW);
  Serial.println("GPIO 2 is LOW (should be 0V if measured)");
  delay(2000);
  
  Serial.println("Test cycle complete");
  delay(1000);
}