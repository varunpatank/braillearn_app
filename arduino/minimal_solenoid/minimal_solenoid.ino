// Minimal Solenoid Test for ESP32 Nano
// Simplest possible solenoid test

void setup() {
  Serial.begin(115200);
  delay(5000);  // ESP32 needs longer startup time
  
  Serial.println("=== MINIMAL SOLENOID TEST ===");
  Serial.println("ESP32 Nano - GPIO 2 solenoid test");
  
  pinMode(2, OUTPUT);
  digitalWrite(2, LOW);  // Start OFF
  
  Serial.println("Solenoid connected to GPIO 2");
  Serial.println("External 5V power required!");
  Serial.println("Starting test in 3 seconds...");
  
  delay(3000);
}

void loop() {
  Serial.println("Solenoid ON - should PUSH DOWN");
  digitalWrite(2, HIGH);
  delay(2000);
  
  Serial.println("Solenoid OFF - should RETRACT UP");
  digitalWrite(2, LOW);
  delay(3000);
  
  Serial.println("--- Cycle complete ---");
}