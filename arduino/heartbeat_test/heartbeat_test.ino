// Heartbeat Test - Proves Arduino is Alive
// Fast blinking pattern that's easy to see

void setup() {
  Serial.begin(115200);
  delay(2000);
  
  Serial.println("=== HEARTBEAT TEST ===");
  Serial.println("Arduino should blink in heartbeat pattern");
  
  // Try multiple pins in case one has an LED
  pinMode(2, OUTPUT);
  pinMode(8, OUTPUT);
  pinMode(13, OUTPUT);
  pinMode(48, OUTPUT);  // ESP32-S3 built-in LED
}

void loop() {
  Serial.println("♥ Heartbeat");
  
  // Heartbeat pattern: quick double blink
  // Turn ON
  digitalWrite(2, HIGH);
  digitalWrite(8, HIGH);
  digitalWrite(13, HIGH);
  digitalWrite(48, HIGH);
  delay(100);
  
  // Turn OFF
  digitalWrite(2, LOW);
  digitalWrite(8, LOW);
  digitalWrite(13, LOW);
  digitalWrite(48, LOW);
  delay(100);
  
  // Turn ON again
  digitalWrite(2, HIGH);
  digitalWrite(8, HIGH);
  digitalWrite(13, HIGH);
  digitalWrite(48, HIGH);
  delay(100);
  
  // Turn OFF and wait
  digitalWrite(2, LOW);
  digitalWrite(8, LOW);
  digitalWrite(13, LOW);
  digitalWrite(48, LOW);
  delay(700);  // Longer pause between heartbeats
}