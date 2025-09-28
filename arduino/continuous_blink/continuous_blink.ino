// Continuous Blink Test - Diagnoses Power Issues
// If this stops working, you have a power problem

void setup() {
  Serial.begin(115200);
  delay(2000);
  
  Serial.println("=== CONTINUOUS BLINK TEST ===");
  Serial.println("This should blink forever");
  Serial.println("If it stops, you have a power issue");
  
  pinMode(2, OUTPUT);
  
  Serial.println("Starting continuous blink on GPIO 2...");
}

void loop() {
  // Fast blink to make power issues obvious
  digitalWrite(2, HIGH);
  Serial.print(".");
  delay(100);
  
  digitalWrite(2, LOW);
  delay(100);
  
  // Print status every 50 blinks
  static int count = 0;
  count++;
  if (count >= 50) {
    Serial.println("");
    Serial.print("Blink count: ");
    Serial.println(count);
    count = 0;
  }
}