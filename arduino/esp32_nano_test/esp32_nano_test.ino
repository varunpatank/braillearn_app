// ESP32 Nano Specific Test
// Addresses common ESP32 Nano issues

void setup() {
  // ESP32 needs longer delay for serial
  Serial.begin(115200);
  delay(5000);  // Longer delay for ESP32
  
  Serial.println("=== ESP32 NANO TEST ===");
  Serial.println("Board: Arduino Nano ESP32");
  Serial.println("If you see this, the program is running!");
  
  // ESP32 Nano specific LED pin
  pinMode(48, OUTPUT);  // Built-in LED on ESP32-S3
  pinMode(2, OUTPUT);   // GPIO 2 for solenoid
  
  // Initial state
  digitalWrite(48, LOW);
  digitalWrite(2, LOW);
  
  Serial.println("Setup complete - starting test");
}

void loop() {
  Serial.println("ESP32 is running - LED should blink");
  
  // Blink built-in LED
  digitalWrite(48, HIGH);
  digitalWrite(2, HIGH);
  delay(1000);
  
  digitalWrite(48, LOW);
  digitalWrite(2, LOW);
  delay(1000);
}