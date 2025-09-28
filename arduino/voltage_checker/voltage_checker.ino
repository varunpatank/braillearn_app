// Voltage Checker - Helps identify power issues
// Use with multimeter to check all voltages

void setup() {
  Serial.begin(115200);
  delay(3000);
  
  Serial.println("=== VOLTAGE CHECKER PROGRAM ===");
  Serial.println("Use multimeter to check these voltages:");
  Serial.println("");
  
  pinMode(2, OUTPUT);
  digitalWrite(2, LOW);
  
  Serial.println("VOLTAGE MEASUREMENT POINTS:");
  Serial.println("1. Power supply output: Should be 5.0V");
  Serial.println("2. Arduino VIN pin: Should be ~5.0V");
  Serial.println("3. Arduino 3.3V pin: Should be ~3.3V");
  Serial.println("4. GPIO 2 when HIGH: Should be ~3.3V");
  Serial.println("5. GPIO 2 when LOW: Should be ~0V");
  Serial.println("");
  
  delay(5000);
}

void loop() {
  Serial.println("╔══════════════════════════════════════╗");
  Serial.println("║         VOLTAGE MEASUREMENTS        ║");
  Serial.println("╚══════════════════════════════════════╝");
  Serial.println("");
  
  Serial.println("STEP 1: Check power supply");
  Serial.println("Measure power supply output with multimeter");
  Serial.println("Red probe → +5V wire, Black probe → GND wire");
  Serial.println("Expected: 5.0V (±0.2V)");
  delay(5000);
  
  Serial.println("STEP 2: Check Arduino VIN pin");
  Serial.println("Measure VIN pin to GND pin on Arduino");
  Serial.println("Expected: ~5.0V");
  delay(5000);
  
  Serial.println("STEP 3: Check Arduino 3.3V pin");
  Serial.println("Measure 3.3V pin to GND pin on Arduino");
  Serial.println("Expected: ~3.3V (proves Arduino is powered)");
  delay(5000);
  
  Serial.println("STEP 4: Check GPIO 2 - LOW state");
  digitalWrite(2, LOW);
  Serial.println("GPIO 2 is now LOW");
  Serial.println("Measure GPIO 2 pin to GND");
  Serial.println("Expected: ~0V");
  delay(5000);
  
  Serial.println("STEP 5: Check GPIO 2 - HIGH state");
  digitalWrite(2, HIGH);
  Serial.println("GPIO 2 is now HIGH");
  Serial.println("Measure GPIO 2 pin to GND");
  Serial.println("Expected: ~3.3V");
  delay(5000);
  
  digitalWrite(2, LOW);
  Serial.println("STEP 6: Check solenoid voltage");
  Serial.println("With solenoid connected to GPIO 2:");
  Serial.println("Measure across solenoid terminals when GPIO 2 is HIGH");
  Serial.println("Expected: ~3.3V (or 5V if using driver)");
  Serial.println("");
  
  Serial.println("=== MEASUREMENT CYCLE COMPLETE ===");
  Serial.println("Report which voltages are wrong!");
  Serial.println("");
  delay(5000);
}