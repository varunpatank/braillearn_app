// ESP32 Alive Test - Maximum Compatibility
// Works on any ESP32 board regardless of LED pin

void setup() {
  Serial.begin(115200);
  delay(5000);  // Extra time for ESP32 to stabilize
  
  Serial.println("╔══════════════════════════════════╗");
  Serial.println("║     ESP32 NANO ALIVE TEST        ║");
  Serial.println("╚══════════════════════════════════╝");
  Serial.println("");
  Serial.println("If you see this message repeating,");
  Serial.println("your Arduino Nano ESP32 is working!");
  Serial.println("");
  
  // Initialize common pins (don't worry about which one has LED)
  for (int pin = 2; pin <= 48; pin++) {
    pinMode(pin, OUTPUT);
    digitalWrite(pin, LOW);
  }
  
  Serial.println("All GPIO pins initialized");
  Serial.println("Starting alive test...");
}

void loop() {
  static int counter = 0;
  counter++;
  
  Serial.println("┌─────────────────────────────────┐");
  Serial.print("│ Arduino is ALIVE! Count: ");
  Serial.print(counter);
  Serial.println("     │");
  Serial.println("└─────────────────────────────────┘");
  
  // Blink ALL possible LED pins
  // One of them should light up
  for (int pin = 2; pin <= 48; pin++) {
    digitalWrite(pin, HIGH);
  }
  delay(500);
  
  for (int pin = 2; pin <= 48; pin++) {
    digitalWrite(pin, LOW);
  }
  delay(500);
  
  // Show we're still running
  Serial.print("Uptime: ");
  Serial.print(millis() / 1000);
  Serial.println(" seconds");
  Serial.println("");
}