// Direct Solenoid Test - Bypass Arduino
// Tests solenoid with direct power connection

void setup() {
  Serial.begin(115200);
  delay(3000);
  
  Serial.println("=== DIRECT SOLENOID TEST ===");
  Serial.println("This test bypasses Arduino completely");
  Serial.println("");
  
  Serial.println("DIRECT TEST PROCEDURE:");
  Serial.println("1. Disconnect solenoid from Arduino");
  Serial.println("2. Connect solenoid + wire directly to +5V");
  Serial.println("3. Connect solenoid - wire directly to GND");
  Serial.println("4. Solenoid should activate immediately");
  Serial.println("");
  
  Serial.println("If solenoid doesn't move with direct connection:");
  Serial.println("- Wrong voltage (not 5V)");
  Serial.println("- Insufficient current (need 500mA+)");
  Serial.println("- Bad solenoid");
  Serial.println("- Wrong solenoid type (pull vs push)");
  Serial.println("");
  
  Serial.println("If direct test works, reconnect to Arduino");
  Serial.println("and run the Arduino solenoid test");
}

void loop() {
  Serial.println("Waiting for direct solenoid test...");
  Serial.println("Disconnect solenoid and test with direct 5V");
  delay(5000);
}