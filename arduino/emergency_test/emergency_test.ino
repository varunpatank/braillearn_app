// Emergency Arduino Test
// Absolute simplest test to see if Arduino works

void setup() {
  Serial.begin(115200);
  delay(3000);  // Extra time for serial
  
  Serial.println("EMERGENCY TEST - ARDUINO ALIVE CHECK");
  Serial.println("If you see this message, Arduino is working");
  
  // Test multiple possible LED pins
  pinMode(2, OUTPUT);
  pinMode(8, OUTPUT);
  pinMode(13, OUTPUT);
  pinMode(48, OUTPUT);
  
  Serial.println("Testing all possible LED pins...");
}

void loop() {
  Serial.println("Arduino is alive - cycle count");
  
  // Try all pins at once
  digitalWrite(2, HIGH);
  digitalWrite(8, HIGH);
  digitalWrite(13, HIGH);
  digitalWrite(48, HIGH);
  
  delay(500);
  
  digitalWrite(2, LOW);
  digitalWrite(8, LOW);
  digitalWrite(13, LOW);
  digitalWrite(48, LOW);
  
  delay(500);
}