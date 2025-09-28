// Step-by-Step Debug Program
// We'll test each component individually

void setup() {
  Serial.begin(115200);
  delay(3000);
  
  Serial.println("╔══════════════════════════════════════╗");
  Serial.println("║     STEP-BY-STEP DEBUG PROGRAM      ║");
  Serial.println("╚══════════════════════════════════════╝");
  Serial.println("");
  
  Serial.println("We'll test each part individually:");
  Serial.println("1. Arduino basic function");
  Serial.println("2. Power supply voltage");
  Serial.println("3. GPIO pin output");
  Serial.println("4. Solenoid direct test");
  Serial.println("5. Complete circuit test");
  Serial.println("");
  
  pinMode(2, OUTPUT);
  digitalWrite(2, LOW);
  
  delay(3000);
}

void loop() {
  Serial.println("=== TEST 1: ARDUINO BASIC FUNCTION ===");
  Serial.println("If you see this message, Arduino is working ✅");
  Serial.println("Arduino can receive power and run programs");
  Serial.println("");
  delay(3000);
  
  Serial.println("=== TEST 2: POWER SUPPLY CHECK ===");
  Serial.println("INSTRUCTIONS:");
  Serial.println("1. Use multimeter to measure voltage");
  Serial.println("2. Measure between VIN pin and GND pin");
  Serial.println("3. Should read 5.0V (±0.2V)");
  Serial.println("4. If no voltage: power supply not connected");
  Serial.println("5. If wrong voltage: bad power supply");
  Serial.println("");
  Serial.println("What voltage do you measure? (Check now)");
  delay(10000);  // 10 seconds to check
  
  Serial.println("=== TEST 3: GPIO PIN OUTPUT ===");
  Serial.println("Testing GPIO 2 output...");
  Serial.println("Measure voltage at GPIO 2 pin with multimeter:");
  Serial.println("");
  
  Serial.println("GPIO 2 going HIGH - should measure ~3.3V");
  digitalWrite(2, HIGH);
  delay(5000);
  
  Serial.println("GPIO 2 going LOW - should measure ~0V");
  digitalWrite(2, LOW);
  delay(5000);
  
  Serial.println("Did GPIO 2 voltage change? Y/N");
  Serial.println("");
  delay(3000);
  
  Serial.println("=== TEST 4: SOLENOID DIRECT TEST ===");
  Serial.println("DISCONNECT solenoid from Arduino");
  Serial.println("Connect solenoid DIRECTLY to 5V power:");
  Serial.println("- Solenoid + wire → Power supply +5V");
  Serial.println("- Solenoid - wire → Power supply GND");
  Serial.println("Solenoid should activate immediately!");
  Serial.println("");
  Serial.println("Did solenoid move with direct 5V? Y/N");
  delay(10000);
  
  Serial.println("=== TEST 5: COMPLETE CIRCUIT TEST ===");
  Serial.println("Reconnect solenoid to Arduino:");
  Serial.println("- Solenoid + → GPIO 2");
  Serial.println("- Solenoid - → GND");
  Serial.println("Testing complete circuit...");
  Serial.println("");
  
  Serial.println("Activating GPIO 2 - solenoid should move NOW");
  digitalWrite(2, HIGH);
  delay(3000);
  
  Serial.println("Deactivating GPIO 2 - solenoid should stop");
  digitalWrite(2, LOW);
  delay(3000);
  
  Serial.println("=== DIAGNOSTIC COMPLETE ===");
  Serial.println("Which test failed? Report back!");
  Serial.println("");
  delay(5000);
}