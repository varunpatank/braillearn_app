/*
Science Buddies Style Braille Display
Based on the Science Buddies project design with MOSFETs and external 12V power

Hardware Setup:
- Arduino Uno R3 (or compatible)
- 6x N-channel MOSFETs (one per solenoid)
- 6x 12V push-type solenoids
- 6x 1N4001 diodes (flyback protection)
- 12V power supply (2A minimum)
- Breadboard and jumper wires
- Push button for manual control

Pin Assignments:
- Digital pins 2-7: MOSFET gate control (solenoids 1-6)
- Digital pin 8: Push button input
- Built-in LED (pin 13): Status indicator

Solenoid Layout (Standard Braille Cell):
  1  4
  2  5  
  3  6
*/

// Pin definitions
const int solenoidPins[6] = {2, 3, 4, 5, 6, 7};  // MOSFET gate pins
const int buttonPin = 8;                          // Push button pin
const int statusLED = 13;                         // Built-in LED

// Braille alphabet patterns (same as your original code)
int braille[26][6] = {
  {1,0,0,0,0,0},  // a
  {1,1,0,0,0,0},  // b
  {1,0,0,1,0,0},  // c
  {1,0,0,1,1,0},  // d
  {1,0,0,0,1,0},  // e
  {1,1,0,1,0,0},  // f
  {1,1,0,1,1,0},  // g
  {1,1,0,0,1,0},  // h
  {0,1,0,1,0,0},  // i
  {0,1,0,1,1,0},  // j
  {1,0,1,0,0,0},  // k
  {1,1,1,0,0,0},  // l
  {1,0,1,1,0,0},  // m
  {1,0,1,1,1,0},  // n
  {1,0,1,0,1,0},  // o
  {1,1,1,1,0,0},  // p
  {1,1,1,1,1,0},  // q
  {1,1,1,0,1,0},  // r
  {0,1,1,1,0,0},  // s
  {0,1,1,1,1,0},  // t
  {1,0,1,0,0,1},  // u
  {1,1,1,0,0,1},  // v
  {0,1,0,1,1,1},  // w
  {1,0,1,1,0,1},  // x
  {1,0,1,1,1,1},  // y
  {1,0,1,0,1,1},  // z
};

// Alphabet for character lookup
char alphabet[] = "abcdefghijklmnopqrstuvwxyz";

// Test word
String text = "hello";
int currentLetterIndex = 0;
bool buttonPressed = false;
unsigned long lastButtonPress = 0;
const unsigned long debounceDelay = 200;

// Status LED control
void setStatusLED(bool state) {
  digitalWrite(statusLED, state);
}

// Blink status LED
void blinkStatusLED(int times, int delayMs = 200) {
  for (int i = 0; i < times; i++) {
    setStatusLED(true);
    delay(delayMs);
    setStatusLED(false);
    delay(delayMs);
  }
}

// Update solenoids based on braille pattern
void updateSolenoids(int pattern[6]) {
  Serial.print("Displaying pattern: ");
  
  // Turn off all solenoids first (clean switching)
  for (int i = 0; i < 6; i++) {
    digitalWrite(solenoidPins[i], LOW);
  }
  delay(50); // Brief pause for clean switching
  
  // Activate solenoids based on pattern
  for (int i = 0; i < 6; i++) {
    if (pattern[i] == 1) {
      digitalWrite(solenoidPins[i], HIGH);  // HIGH = MOSFET on = solenoid extends
      Serial.print("●");
    } else {
      Serial.print("○");
    }
  }
  Serial.println();
  
  // Keep solenoids active for tactile feedback
  delay(1000);  // Hold for 1 second
  
  // Turn off all solenoids (retract)
  for (int i = 0; i < 6; i++) {
    digitalWrite(solenoidPins[i], LOW);
  }
  
  Serial.println("Solenoids retracted - ready for next character");
}

// Display a character by its index in the alphabet
void displayCharacter(int charIndex) {
  if (charIndex < 0 || charIndex >= 26) {
    Serial.println("Invalid character index");
    return;
  }
  
  char letter = alphabet[charIndex];
  Serial.print("Displaying letter: ");
  Serial.print(letter);
  Serial.print(" (");
  Serial.print(charIndex);
  Serial.println(")");
  
  // Get the braille pattern for this character
  updateSolenoids(braille[charIndex]);
}

// Find character index in alphabet
int findCharacterIndex(char letter) {
  // Convert to lowercase
  if (letter >= 'A' && letter <= 'Z') {
    letter = letter + 32;
  }
  
  // Find in alphabet
  for (int i = 0; i < 26; i++) {
    if (alphabet[i] == letter) {
      return i;
    }
  }
  return -1; // Not found
}

// Test all solenoids individually
void testAllSolenoids() {
  Serial.println("=== TESTING ALL SOLENOIDS ===");
  Serial.println("Each solenoid will activate for 1 second");
  
  for (int i = 0; i < 6; i++) {
    Serial.print("Testing solenoid ");
    Serial.print(i + 1);
    Serial.print(" (Dot ");
    Serial.print(i + 1);
    Serial.println(") - should PUSH DOWN");
    
    digitalWrite(solenoidPins[i], HIGH);
    blinkStatusLED(1, 100);
    delay(1000);
    
    digitalWrite(solenoidPins[i], LOW);
    Serial.println("Solenoid retracted");
    delay(500);
  }
  
  Serial.println("=== TESTING ALL SOLENOIDS TOGETHER ===");
  for (int i = 0; i < 6; i++) {
    digitalWrite(solenoidPins[i], HIGH);
  }
  Serial.println("All solenoids active - should all PUSH DOWN");
  blinkStatusLED(3, 200);
  delay(2000);
  
  for (int i = 0; i < 6; i++) {
    digitalWrite(solenoidPins[i], LOW);
  }
  Serial.println("All solenoids retracted");
  Serial.println("=== SOLENOID TEST COMPLETE ===");
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("╔══════════════════════════════════════╗");
  Serial.println("║    SCIENCE BUDDIES BRAILLE DISPLAY  ║");
  Serial.println("║         Arduino Uno R3              ║");
  Serial.println("╚══════════════════════════════════════╝");
  Serial.println("");
  
  // Initialize solenoid control pins (MOSFET gates)
  for (int i = 0; i < 6; i++) {
    pinMode(solenoidPins[i], OUTPUT);
    digitalWrite(solenoidPins[i], LOW);  // Start with all solenoids OFF
  }
  
  // Initialize button and LED
  pinMode(buttonPin, INPUT_PULLUP);  // Internal pullup resistor
  pinMode(statusLED, OUTPUT);
  setStatusLED(false);
  
  Serial.println("🔧 Hardware Configuration:");
  Serial.println("   - Pins 2-7: MOSFET gate control");
  Serial.println("   - Pin 8: Push button (with pullup)");
  Serial.println("   - Pin 13: Status LED");
  Serial.println("   - 12V external power for solenoids");
  Serial.println("");
  
  // Startup LED sequence
  Serial.println("🚀 Starting up...");
  blinkStatusLED(5, 150);
  
  // Test all solenoids on startup
  testAllSolenoids();
  
  // Ready status
  Serial.println("🎉 READY FOR BRAILLE DISPLAY!");
  Serial.println("");
  Serial.println("📖 Current word: " + text);
  Serial.println("🔘 Press button to cycle through letters");
  Serial.println("🔍 Expected behavior:");
  Serial.println("   - HIGH signal: Solenoid PUSHES DOWN (raised dot)");
  Serial.println("   - LOW signal: Solenoid RETRACTS UP (flat surface)");
  Serial.println("");
  
  // Display first character
  if (text.length() > 0) {
    int charIndex = findCharacterIndex(text[0]);
    if (charIndex >= 0) {
      displayCharacter(charIndex);
    }
  }
  
  setStatusLED(true); // Solid LED when ready
}

void loop() {
  // Check for button press with debouncing
  bool currentButtonState = digitalRead(buttonPin) == LOW; // LOW = pressed (pullup)
  
  if (currentButtonState && !buttonPressed && 
      (millis() - lastButtonPress > debounceDelay)) {
    
    buttonPressed = true;
    lastButtonPress = millis();
    
    // Move to next character
    currentLetterIndex++;
    if (currentLetterIndex >= text.length()) {
      currentLetterIndex = 0; // Loop back to start
      Serial.println("=== WORD COMPLETE - RESTARTING ===");
    }
    
    // Display current character
    char currentChar = text[currentLetterIndex];
    int charIndex = findCharacterIndex(currentChar);
    
    if (charIndex >= 0) {
      Serial.print("Button pressed! Next letter: ");
      displayCharacter(charIndex);
    } else {
      Serial.print("Skipping non-alphabetic character: ");
      Serial.println(currentChar);
    }
    
    // Quick LED flash to acknowledge button press
    setStatusLED(false);
    delay(100);
    setStatusLED(true);
  }
  
  // Reset button state when released
  if (!currentButtonState && buttonPressed) {
    buttonPressed = false;
  }
  
  // Heartbeat blink when idle
  static unsigned long lastHeartbeat = 0;
  if (millis() - lastHeartbeat > 3000) {
    blinkStatusLED(1, 50);
    lastHeartbeat = millis();
  }
  
  delay(50); // Small delay for stability
}