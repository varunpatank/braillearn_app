// Ultra-simple test for Arduino Nano ESP32
// Just blinks built-in LED and prints to serial

void setup() {
  Serial.begin(115200);
  delay(2000);  // Give time for serial to initialize
  
  Serial.println("=== ARDUINO NANO ESP32 TEST ===");
  Serial.println("If you see this, Arduino is working!");
  
  // Try common LED pins for ESP32
  pinMode(2, OUTPUT);   // Common LED pin
  pinMode(8, OUTPUT);   // Another common pin
  pinMode(48, OUTPUT);  // ESP32-S3 built-in LED
  
  Serial.println("Setup complete - starting blink test");
}

void loop() {
  Serial.println("LED ON");
  digitalWrite(2, HIGH);
  digitalWrite(8, HIGH);
  digitalWrite(48, HIGH);
  delay(1000);
  
  Serial.println("LED OFF");
  digitalWrite(2, LOW);
  digitalWrite(8, LOW);
  digitalWrite(48, LOW);
  delay(1000);
}