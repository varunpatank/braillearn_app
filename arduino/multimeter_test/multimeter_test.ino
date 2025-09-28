// Multimeter Test Program
// Helps you measure voltages at different points

#define SOLENOID_PIN 2
#define LED_PIN 48

void setup() {
  Serial.begin(115200);
  delay(2000);
  
  Serial.println("=== MULTIMETER TEST PROGRAM ===");
  Serial.println("Use this with a multimeter to check voltages");
  Serial.println("");
  
  pinMode(SOLENOID_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  
  digitalWrite(SOLENOID_PIN, LOW);
  digitalWrite(LED_PIN, LOW);
  
  Serial.println("MEASUREMENT POINTS:");
  Serial.println("1. Power supply output: Should be 5.0V");
  Serial.println("2. Arduino 5V pin: Should be ~5V");
  Serial.println("3. Arduino 3.3V pin: Should be ~3.3V");
  Serial.println("4. GPIO 2 when HIGH: Should be ~3.3V");
  Serial.println("5. GPIO 2 when LOW: Should be ~0V");
  Serial.println("");
  
  delay(3000);
}

void loop() {
  // Test sequence with measurement instructions
  
  Serial.println("--- MEASUREMENT CYCLE START ---");
  
  // Phase 1: All OFF
  digitalWrite(SOLENOID_PIN, LOW);
  digitalWrite(LED_PIN, LOW);
  Serial.println("PHASE 1: All pins LOW");
  Serial.println("Measure GPIO 2: Should be ~0V");
  delay(5000);
  
  // Phase 2: GPIO HIGH
  digitalWrite(SOLENOID_PIN, HIGH);
  digitalWrite(LED_PIN, HIGH);
  Serial.println("PHASE 2: All pins HIGH");
  Serial.println("Measure GPIO 2: Should be ~3.3V");
  Serial.println("If using ULN2803, measure its output: Should be ~0V");
  Serial.println("Measure solenoid voltage: Should be ~5V");
  delay(5000);
  
  // Phase 3: Back to LOW
  digitalWrite(SOLENOID_PIN, LOW);
  digitalWrite(LED_PIN, LOW);
  Serial.println("PHASE 3: Back to LOW");
  Serial.println("Measure GPIO 2: Should be ~0V");
  delay(5000);
  
  Serial.println("--- MEASUREMENT CYCLE COMPLETE ---");
  Serial.println("Did your measurements match expected values?");
  Serial.println("");
  delay(3000);
}