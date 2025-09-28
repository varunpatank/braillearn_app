// Simple Direct Solenoid Test
// Bypasses Arduino completely

void setup() {
  Serial.begin(115200);
  delay(3000);
  
  Serial.println("=== DIRECT SOLENOID TEST ===");
  Serial.println("This test bypasses Arduino completely");
  Serial.println("");
  
  Serial.println("DIRECT CONNECTION TEST:");
  Serial.println("1. DISCONNECT solenoid from Arduino");
  Serial.println("2. Connect solenoid + wire DIRECTLY to +5V");
  Serial.println("3. Connect solenoid - wire DIRECTLY to GND");
  Serial.println("4. Solenoid should activate IMMEDIATELY");
  Serial.println("");
  
  Serial.println("If solenoid doesn't move:");
  Serial.println("❌ Power supply voltage wrong (not 5V)");
  Serial.println("❌ Power supply current too low");
  Serial.println("❌ Solenoid is broken");
  Serial.println("❌ Wrong solenoid type (pull vs push)");
  Serial.println("");
  
  Serial.println("If solenoid DOES move:");
  Serial.println("✅ Solenoid works");
  Serial.println("✅ Power supply works");
  Serial.println("✅ Problem is in Arduino connection");
  Serial.println("");
  
  Serial.println("Try the direct test now!");
}

void loop() {
  Serial.println("⏳ Waiting for direct solenoid test...");
  Serial.println("Disconnect from Arduino and connect directly to 5V");
  Serial.println("Did it move? Report back!");
  delay(10000);
}