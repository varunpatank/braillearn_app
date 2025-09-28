/*
Arduino UNO R4 WiFi Braille Display - Built-in Bluetooth
Based on your reference code with corrections for standard braille patterns

Physical Layout (matches your diagram):
Solenoid #1 (Pin 2) = Dot 1    Solenoid #4 (Pin 5) = Dot 4
Solenoid #2 (Pin 3) = Dot 2    Solenoid #5 (Pin 6) = Dot 5  
Solenoid #3 (Pin 4) = Dot 3    Solenoid #6 (Pin 7) = Dot 6

Hardware: Arduino UNO R4 WiFi (built-in Bluetooth)
*/

#include "WiFiS3.h"
#include "ArduinoBLE.h"

// BLE Service and Characteristic UUIDs (must match web app)
#define SERVICE_UUID        "19b10000-e8f2-537e-4f6c-d104768a1214"
#define CHARACTERISTIC_UUID "19b10001-e8f2-537e-4f6c-d104768a1214"

// Pin assignments matching your diagram
int controlPins[6] = {2, 3, 4, 5, 6, 7};  // Pins 2-7 control solenoids 1-6
char alphabet[] = "abcdefghijklmnopqrstuvwxyz";

// CORRECTED braille patterns (standard braille alphabet)
// Array index [0-5] maps to your solenoids [1-6] which are dots [1-6]
int braille[26][6] = {
  {1,0,0,0,0,0},  // a - dot 1 only
  {1,1,0,0,0,0},  // b - dots 1,2
  {1,0,0,1,0,0},  // c - dots 1,4
  {1,0,0,1,1,0},  // d - dots 1,4,5
  {1,0,0,0,1,0},  // e - dots 1,5
  {1,1,0,1,0,0},  // f - dots 1,2,4
  {1,1,0,1,1,0},  // g - dots 1,2,4,5
  {1,1,0,0,1,0},  // h - dots 1,2,5
  {0,1,0,1,0,0},  // i - dots 2,4
  {0,1,0,1,1,0},  // j - dots 2,4,5
  {1,0,1,0,0,0},  // k - dots 1,3
  {1,1,1,0,0,0},  // l - dots 1,2,3
  {1,0,1,1,0,0},  // m - dots 1,3,4
  {1,0,1,1,1,0},  // n - dots 1,3,4,5
  {1,0,1,0,1,0},  // o - dots 1,3,5
  {1,1,1,1,0,0},  // p - dots 1,2,3,4
  {1,1,1,1,1,0},  // q - dots 1,2,3,4,5
  {1,1,1,0,1,0},  // r - dots 1,2,3,5
  {0,1,1,1,0,0},  // s - dots 2,3,4
  {0,1,1,1,1,0},  // t - dots 2,3,4,5
  {1,0,1,0,0,1},  // u - dots 1,3,6
  {1,1,1,0,0,1},  // v - dots 1,2,3,6
  {0,1,0,1,1,1},  // w - dots 2,4,5,6
  {1,0,1,1,0,1},  // x - dots 1,3,4,6
  {1,0,1,1,1,1},  // y - dots 1,3,4,5,6
  {1,0,1,0,1,1},  // z - dots 1,3,5,6
};

// BLE Service and Characteristic
BLEService brailleService(SERVICE_UUID);
BLECharacteristic brailleCharacteristic(CHARACTERISTIC_UUID, BLEWrite, 20);

// Status LED (built-in on pin 13)
const int statusLED = 13;
bool deviceConnected = false;

void setup() {
  Serial.begin(115200);
  delay(3000);  // Give time for serial to initialize
  
  Serial.println("╔══════════════════════════════════════╗");
  Serial.println("║   ARDUINO UNO R4 BRAILLE DISPLAY    ║");
  Serial.println("║        Built-in Bluetooth           ║");
  Serial.println("╚══════════════════════════════════════╝");
  Serial.println("");
  
  // Initialize solenoid pins
  for(int i = 0; i < 6; i++) {
    pinMode(controlPins[i], OUTPUT);
    digitalWrite(controlPins[i], LOW);
    Serial.print("Initialized Pin ");
    Serial.print(controlPins[i]);
    Serial.print(" (Solenoid #");
    Serial.print(i + 1);
    Serial.println(")");
  }
  
  // Initialize status LED
  pinMode(statusLED, OUTPUT);
  digitalWrite(statusLED, LOW);
  
  Serial.println("");
  Serial.println("🔧 Hardware initialized");
  Serial.println("📡 Starting Bluetooth...");
  
  // Initialize BLE
  if (!BLE.begin()) {
    Serial.println("❌ Starting Bluetooth® Low Energy module failed!");
    while (1);
  }
  
  // Set BLE device name and service
  BLE.setLocalName("Braille_Display");
  BLE.setAdvertisedService(brailleService);
  
  // Add characteristic to service
  brailleService.addCharacteristic(brailleCharacteristic);
  
  // Add service
  BLE.addService(brailleService);
  
  // Set event handlers
  BLE.setEventHandler(BLEConnected, onBLEConnected);
  BLE.setEventHandler(BLEDisconnected, onBLEDisconnected);
  brailleCharacteristic.setEventHandler(BLEWritten, onCharacteristicWritten);
  
  // Start advertising
  BLE.advertise();
  
  Serial.println("✅ Bluetooth initialized and advertising");
  Serial.println("📱 Device name: 'Braille_Display'");
  Serial.println("");
  
  // Test all solenoids on startup
  testAllSolenoids();
  
  Serial.println("🎉 READY FOR CONNECTION!");
  Serial.println("💡 Connect from web app or send serial commands");
  Serial.println("");
  Serial.println("Serial Commands:");
  Serial.println("  char:a     - Display letter 'a'");
  Serial.println("  word:hello - Display word 'hello'");
  Serial.println("  test       - Test all solenoids");
  Serial.println("  pin1-pin6  - Test individual pins");
  Serial.println("");
}

void loop() {
  // Poll for BLE events
  BLE.poll();
  
  // Handle serial commands
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    command.toLowerCase();
    
    processSerialCommand(command);
  }
  
  // Status LED: blink when waiting, solid when connected
  static unsigned long lastBlink = 0;
  if (!deviceConnected) {
    if (millis() - lastBlink > 1000) {
      digitalWrite(statusLED, !digitalRead(statusLED));
      lastBlink = millis();
    }
  } else {
    digitalWrite(statusLED, HIGH);  // Solid when connected
  }
}

void onBLEConnected(BLEDevice central) {
  deviceConnected = true;
  digitalWrite(statusLED, HIGH);
  Serial.print("🔗 BLE Connected to: ");
  Serial.println(central.address());
}

void onBLEDisconnected(BLEDevice central) {
  deviceConnected = false;
  digitalWrite(statusLED, LOW);
  Serial.print("📱 BLE Disconnected from: ");
  Serial.println(central.address());
}

void onCharacteristicWritten(BLEDevice central, BLECharacteristic characteristic) {
  // Read the data sent from web app
  if (characteristic.valueLength() == 1) {
    uint8_t pattern = characteristic.value()[0];
    Serial.print("📱 BLE: Received pattern: ");
    Serial.println(pattern, BIN);
    
    // Convert byte pattern to dot array
    int dots[6];
    for (int i = 0; i < 6; i++) {
      dots[i] = (pattern >> i) & 1;
    }
    
    displayPattern(dots);
  }
}

void processSerialCommand(String command) {
  if (command.startsWith("char:")) {
    if (command.length() >= 6) {
      char letter = command.charAt(5);
      displayCharacter(letter);
    }
  }
  else if (command.startsWith("word:")) {
    if (command.length() > 5) {
      String word = command.substring(5);
      displayWord(word);
    }
  }
  else if (command.startsWith("dots:")) {
    if (command.length() > 5) {
      String dotString = command.substring(5);
      displayDots(dotString);
    }
  }
  else if (command == "test") {
    testAllSolenoids();
  }
  else if (command.startsWith("pin")) {
    int pinNum = command.substring(3).toInt();
    if (pinNum >= 1 && pinNum <= 6) {
      testIndividualPin(pinNum - 1);
    }
  }
  else if (command == "help") {
    showHelp();
  }
  else if (command.length() > 0) {
    Serial.print("❌ Unknown command: ");
    Serial.println(command);
    Serial.println("💡 Type 'help' for available commands");
  }
}

void displayCharacter(char letter) {
  // Convert to lowercase
  if (letter >= 'A' && letter <= 'Z') {
    letter = letter + 32;
  }
  
  // Find index in alphabet
  int index = -1;
  for (int j = 0; j < 26; j++) {
    if (letter == alphabet[j]) {
      index = j;
      break;
    }
  }
  
  if (index >= 0) {
    Serial.print("📝 Displaying letter: ");
    Serial.print(letter);
    Serial.print(" (dots: ");
    
    // Display the pattern
    displayPattern(braille[index]);
    
    // Print which dots are active
    for (int k = 0; k < 6; k++) {
      if (braille[index][k] == 1) {
        Serial.print(k + 1);
        Serial.print(" ");
      }
    }
    Serial.println(")");
  } else {
    Serial.print("❌ Unknown character: ");
    Serial.println(letter);
  }
}

void displayWord(String word) {
  Serial.print("📖 Displaying word: ");
  Serial.println(word);
  
  for (int i = 0; i < word.length(); i++) {
    char letter = word[i];
    if (letter >= 'a' && letter <= 'z') {
      displayCharacter(letter);
      delay(1000);  // Pause between letters
    } else if (letter >= 'A' && letter <= 'Z') {
      displayCharacter(letter);
      delay(1000);
    } else if (letter == ' ') {
      Serial.println("   (space - pausing)");
      delay(1500);
    }
  }
  Serial.println("📖 Word complete");
}

void displayDots(String dotString) {
  // Parse dots like "1,3,5" from web app
  int pattern[6] = {0, 0, 0, 0, 0, 0};
  
  Serial.print("🔴 Displaying dots: ");
  Serial.println(dotString);
  
  // Remove brackets and spaces
  dotString.replace("[", "");
  dotString.replace("]", "");
  dotString.replace(" ", "");
  
  if (dotString.length() > 0) {
    int startIndex = 0;
    int commaIndex = dotString.indexOf(',');
    
    while (startIndex < dotString.length()) {
      String dotStr;
      if (commaIndex == -1) {
        dotStr = dotString.substring(startIndex);
        startIndex = dotString.length();
      } else {
        dotStr = dotString.substring(startIndex, commaIndex);
        startIndex = commaIndex + 1;
        commaIndex = dotString.indexOf(',', startIndex);
      }
      
      int dotNumber = dotStr.toInt();
      if (dotNumber >= 1 && dotNumber <= 6) {
        pattern[dotNumber - 1] = 1;  // Convert 1-6 to 0-5 array index
      }
    }
  }
  
  displayPattern(pattern);
}

void displayPattern(int pattern[6]) {
  // Turn off all solenoids first
  for (int i = 0; i < 6; i++) {
    digitalWrite(controlPins[i], LOW);
  }
  delay(50);  // Brief pause for clean switching
  
  // Activate pattern
  for (int k = 0; k < 6; k++) {
    digitalWrite(controlPins[k], pattern[k]);
  }
  
  delay(800);  // Hold pattern for tactile feedback
  
  // Turn off all solenoids
  for (int i = 0; i < 6; i++) {
    digitalWrite(controlPins[i], LOW);
  }
}

void testAllSolenoids() {
  Serial.println("🧪 Testing all solenoids...");
  
  // Test each solenoid individually
  for (int i = 0; i < 6; i++) {
    Serial.print("   Testing Solenoid #");
    Serial.print(i + 1);
    Serial.print(" (Pin ");
    Serial.print(controlPins[i]);
    Serial.println(")");
    
    digitalWrite(controlPins[i], HIGH);
    delay(500);
    digitalWrite(controlPins[i], LOW);
    delay(300);
  }
  
  Serial.println("   Testing all together...");
  // Test all together
  for (int i = 0; i < 6; i++) {
    digitalWrite(controlPins[i], HIGH);
  }
  delay(1000);
  for (int i = 0; i < 6; i++) {
    digitalWrite(controlPins[i], LOW);
  }
  
  Serial.println("✅ Solenoid test complete");
}

void testIndividualPin(int pinIndex) {
  Serial.print("🔴 Testing Pin ");
  Serial.print(controlPins[pinIndex]);
  Serial.print(" (Solenoid #");
  Serial.print(pinIndex + 1);
  Serial.println(")");
  
  digitalWrite(controlPins[pinIndex], HIGH);
  Serial.println("   → Should activate NOW");
  delay(2000);
  digitalWrite(controlPins[pinIndex], LOW);
  Serial.println("   → Should turn off NOW");
  Serial.println("   → Did it work? (Y/N)");
}

void showHelp() {
  Serial.println("");
  Serial.println("🔧 Available Commands:");
  Serial.println("  char:a     - Display letter 'a'");
  Serial.println("  word:hello - Display word 'hello'");
  Serial.println("  dots:1,3,5 - Display specific dots");
  Serial.println("  test       - Test all solenoids");
  Serial.println("  pin1       - Test Pin 2 (Solenoid #1)");
  Serial.println("  pin2       - Test Pin 3 (Solenoid #2)");
  Serial.println("  pin3       - Test Pin 4 (Solenoid #3)");
  Serial.println("  pin4       - Test Pin 5 (Solenoid #4)");
  Serial.println("  pin5       - Test Pin 6 (Solenoid #5)");
  Serial.println("  pin6       - Test Pin 7 (Solenoid #6)");
  Serial.println("  help       - Show this help");
  Serial.println("");
}