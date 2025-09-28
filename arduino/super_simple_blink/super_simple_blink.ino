// Super Simple Blink - Just GPIO 2
// Absolute minimum test for Arduino Nano ESP32

void setup() {
  Serial.begin(115200);
  delay(2000);
  
  Serial.println("Super Simple Blink Test");
  Serial.println("GPIO 2 will blink every second");
  
  pinMode(2, OUTPUT);
}

void loop() {
  Serial.println("LED ON");
  digitalWrite(2, HIGH);
  delay(1000);
  
  Serial.println("LED OFF");
  digitalWrite(2, LOW);
  delay(1000);
}