// Solenoid Test for WORKING Arduino Nano ESP32
// Since your Arduino blinks, now we test solenoid with external power

void setup() {
  Serial.begin(115200);
  delay(3000);
  
  Serial.println("=== SOLENOID TEST - WORKING ARDUINO ===");
  Serial.println("Your Arduino is working (LED blinks)!");
  Serial.println("Now testing solenoid with external power");
  Serial.println("");
  
  Serial.println("REQUIRED SETUP:");
  Serial.println("1. External 5V power supply (NOT USB)");
  Serial.println("2. Connect +5V to VIN pin on Arduino");
  Serial.println("3. Connect GND to GND pin on Arduino");
  Serial.println("4. Connect solenoid + wire to GPIO 2");
  Serial.println("5. Connect solenoid - wire to GND");
  Serial.println("");
  
  pinMode(2, OUTPUT);
  digitalWrite(2, LOW);  // Start with solenoid OFF
  
  Serial.println("Setup complete - starting solenoid test");
  Serial.println("IMPORTANT: You MUST use external 5V power!");
  delay(5000);
}

void loop() {
  Serial.println("╔══════════════════════════════════╗");
  Serial.println("║        SOLENOID TEST             ║");
  Serial.println("╚══════════════════════════════════╝");
  
  Serial.println("Step 1: Solenoid OFF (retracted UP)");
  digitalWrite(2, LOW);
  Serial.println("GPIO 2 = LOW, solenoid should be UP");
  delay(3000);
  
  Serial.println("Step 2: Solenoid ON (pushing DOWN)");
  digitalWrite(2, HIGH);
  Serial.println("GPIO 2 = HIGH, solenoid should PUSH DOWN");
  Serial.println("*** LOOK FOR MOVEMENT NOW ***");
  delay(3000);
  
  Serial.println("Step 3: Back to OFF (retracted UP)");
  digitalWrite(2, LOW);
  Serial.println("GPIO 2 = LOW, solenoid should retract UP");
  delay(3000);
  
  Serial.println("--- Test cycle complete ---");
  Serial.println("Did you see the solenoid move?");
  Serial.println("");
  delay(2000);
}