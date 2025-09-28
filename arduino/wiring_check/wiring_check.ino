// Wiring Check Program
// Helps verify connections are correct

void setup() {
  Serial.begin(115200);
  delay(3000);
  
  Serial.println("=== WIRING CHECK PROGRAM ===");
  Serial.println("This helps verify your connections");
  Serial.println("");
  
  Serial.println("REQUIRED CONNECTIONS:");
  Serial.println("1. Power Supply +5V → Arduino VIN pin");
  Serial.println("2. Power Supply GND → Arduino GND pin");
  Serial.println("3. Solenoid + wire → ULN2803 pin 18");
  Serial.println("4. Solenoid - wire → Power Supply GND");
  Serial.println("5. Arduino GPIO 2 → ULN2803 pin 1");
  Serial.println("6. ULN2803 pin 9 → Arduino GND");
  Serial.println("7. ULN2803 pin 10 → Power Supply +5V");
  Serial.println("");
  
  pinMode(2, OUTPUT);
  digitalWrite(2, LOW);
  
  Serial.println("Starting wiring test...");
  delay(3000);
}

void loop() {
  Serial.println("--- WIRING TEST CYCLE ---");
  
  Serial.println("Step 1: GPIO 2 going HIGH");
  Serial.println("Measure GPIO 2 with multimeter: should be ~3.3V");
  digitalWrite(2, HIGH);
  delay(5000);
  
  Serial.println("Step 2: GPIO 2 going LOW");
  Serial.println("Measure GPIO 2 with multimeter: should be ~0V");
  digitalWrite(2, LOW);
  delay(5000);
  
  Serial.println("Step 3: If using ULN2803:");
  Serial.println("When GPIO 2 is HIGH, ULN2803 pin 18 should be ~0V");
  Serial.println("When GPIO 2 is LOW, ULN2803 pin 18 should be floating");
  digitalWrite(2, HIGH);
  delay(3000);
  digitalWrite(2, LOW);
  delay(3000);
  
  Serial.println("Wiring test cycle complete");
  Serial.println("");
  delay(2000);
}