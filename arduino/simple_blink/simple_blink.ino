// Simplest possible test
// Just blinks GPIO 2 to verify Arduino works

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("Simple GPIO 2 blink test");
  Serial.println("Connect LED between GPIO 2 and GND to see blinking");
  
  pinMode(2, OUTPUT);
}

void loop() {
  Serial.println("GPIO 2 HIGH");
  digitalWrite(2, HIGH);
  delay(1000);
  
  Serial.println("GPIO 2 LOW");
  digitalWrite(2, LOW);
  delay(1000);
}