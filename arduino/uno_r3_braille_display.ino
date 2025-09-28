/*
Arduino UNO R3 Braille Display - Web App Integration
Compatible with BrailleLearn web application

Hardware Setup (Science Buddies Style):
- Arduino UNO R3
- 6x N-channel MOSFETs (2N7000, IRLZ44N, or similar)
- 6x 12V push-type solenoids
- 6x 1N4001 diodes (flyback protection)
- 12V power supply (2A minimum)
- Push button for manual control
- Breadboard and jumper wires

Pin Assignments:
- Digital pins 2-7: MOSFET gate control (solenoids 1-6)
- Digital pin 8: Push button input
- Built-in LED (pin 13): Status indicator

Solenoid Layout (Standard Braille Cell):
  1  4
  2  5  
  3  6

Serial Commands (for web app integration):
- char:a        → Display letter 'a'
- word:hello    → Display word 'hello'
- pattern:3     → Display raw pattern (0-63)
- test          → Run test sequence
- help          → Show all commands
*/

// Pin definitions
const int solenoidPins[6] = {2, 3, 4, 5, 6, 7};  // MOSFET gate control pins
const int buttonPin = 8;                          // Push button pin
const int statusLED = 13;                         // Built-in LED

// Braille alphabet patterns (dots 1-6, same as web app)
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

// Variables for button control and demo mode
String currentWord = "hello";
int currentLetterIndex = 0;
bool buttonPressed = false;
unsigned long lastButtonPress = 0;
const unsigned long debounceDelay = 200;
bool demoMode = true;

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
  Serial.print(">> Displaying pattern: ");
  
  // Turn off all solenoids first (clean switching)
  for (int i = 0; i < 6; i++) {
    digitalWrite(solenoidPins[i], LOW);
  }
  delay(50); // Brief pause for clean switching
  
  // Activate solenoids based on pattern
  for (int i = 0; i < 6; i++) {
    if (pattern[i] == 1) {
      digitalWrite(solenoidPins[i], HIGH);  // HIGH = MOSFET on = solenoid extends DOWN
      Serial.print("●");
    } else {
      Serial.print("○");
    }
  }
  Serial.println();
  
  // Keep solenoids active for tactile feedback
  delay(800);  // Hold for 800ms (same as web app timing)
  
  // Turn off all solenoids (return to retracted position)
  for (int i = 0; i < 6; i++) {
    digitalWrite(solenoidPins[i], LOW);
  }
  
  Serial.println(">> All solenoids retracted");
}

// Display character by finding its index in alphabet
void displayCharacter(char letter) {
  // Convert to lowercase
  if (letter >= 'A' && letter <= 'Z') {
    letter = letter + 32;
  }
  
  // Find index of this letter in the alphabet
  int index = -1;
  for (int j = 0; j < 26; j++) {
    if (letter == alphabet[j]) {
      index = j;
      break;
    }
  }
  
  if (index == -1) {
    Serial.print("Character '");
    Serial.print(letter);
    Serial.println("' not found in braille alphabet");
    return;
  }
  
  // Print the letter and display it
  Serial.print(">> Displaying letter: ");
  Serial.print(letter);
  Serial.print(" (dots: ");
  for (int i = 0; i < 6; i++) {
    if (braille[index][i] == 1) {
      Serial.print(i + 1);
      Serial.print(" ");
    }
  }
  Serial.println(")");
  
  // Get the corresponding row from the braille array and display it
  updateSolenoids(braille[index]);
}

// Display word letter by letter
void displayWord(String word) {
  Serial.print(">> Displaying word: ");
  Serial.println(word);
  
  for (int i = 0; i < word.length(); i++) {
    char letter = word[i];
    if (letter == ' ') {
      Serial.println(">> Space - pausing");
      delay(1000);
    } else if (letter >= 'a' && letter <= 'z') {
      displayCharacter(letter);
      delay(500); // Brief pause between letters
    } else if (letter >= 'A' && letter <= 'Z') {
      displayCharacter(letter);
      delay(500);
    } else {
      Serial.print(">> Skipping non-alphabetic character: ");
      Serial.println(letter);
    }
  }
  Serial.println(">> Word complete");
}

// Display raw pattern (0-63 represents 6-bit pattern)
void displayPattern(int patternNumber) {
  if (patternNumber < 0 || patternNumber > 63) {
    Serial.println("Pattern must be 0-63");
    return;
  }
  
  Serial.print(">> Displaying raw pattern: ");
  Serial.print(patternNumber);
  Serial.print(" (binary: ");
  Serial.print(patternNumber, BIN);
  Serial.println(")");
  
  // Convert number to 6-bit pattern
  int pattern[6];
  for (int i = 0; i < 6; i++) {
    pattern[i] = (patternNumber >> i) & 1;
  }
  
  updateSolenoids(pattern);
}

// Test all solenoids individually
void testAllSolenoids() {
  Serial.println("=== TESTING ALL SOLENOIDS ===");
  Serial.println("Each solenoid will PUSH DOWN for 1 second");
  
  for (int i = 0; i < 6; i++) {
    Serial.print("Testing Solenoid ");
    Serial.print(i + 1);
    Serial.print(" (Dot ");
    Serial.print(i + 1);
    Serial.println(") - should PUSH DOWN");
    
    digitalWrite(solenoidPins[i], HIGH);
    blinkStatusLED(1, 100);
    delay(1000);
    
    digitalWrite(solenoidPins[i], LOW);
    Serial.println("Solenoid retracted UP");
    delay(300);
  }
  
  Serial.println("=== TESTING ALL SOLENOIDS TOGETHER ===");
  Serial.println("All solenoids pushing DOWN simultaneously");
  for (int i = 0; i < 6; i++) {
    digitalWrite(solenoidPins[i], HIGH);
  }
  blinkStatusLED(3, 200);
  delay(2000);
  
  for (int i = 0; i < 6; i++) {
    digitalWrite(solenoidPins[i], LOW);
  }
  Serial.println("All solenoids retracted UP");
  Serial.println("=== SOLENOID TEST COMPLETE ===");
}

// Process serial commands from web app or user
void processSerialCommand(String command) {
  command.trim(); // Remove whitespace
  command.toLowerCase(); // Convert to lowercase
  
  if (command.startsWith("char:")) {
    // Display single character: char:a
    if (command.length() >= 6) {
      char letter = command.charAt(5);
      displayCharacter(letter);
      demoMode = false; // Stop demo mode when receiving commands
    } else {
      Serial.println("Usage: char:a (where 'a' is the letter)");
    }
  }
  else if (command.startsWith("word:")) {
    // Display word: word:hello
    if (command.length() > 5) {
      String word = command.substring(5);
      displayWord(word);
      demoMode = false; // Stop demo mode when receiving commands
    } else {
      Serial.println("Usage: word:hello (where 'hello' is the word)");
    }
  }
  else if (command.startsWith("pattern:")) {
    // Display raw pattern: pattern:3
    if (command.length() > 8) {
      int pattern = command.substring(8).toInt();
      displayPattern(pattern);
      demoMode = false; // Stop demo mode when receiving commands
    } else {
      Serial.println("Usage: pattern:3 (where 3 is 0-63)");
    }
  }
  else if (command == "test") {
    // Run test sequence
    testAllSolenoids();
    Serial.println("Testing alphabet...");
    displayWord("abcdef");
    demoMode = false;
  }
  else if (command == "demo") {
    // Enable demo mode
    demoMode = true;
    currentLetterIndex = 0;
    Serial.println("Demo mode enabled - press button to cycle through letters");
  }
  else if (command == "help") {
    // Show help
    Serial.println("=== BRAILLE DISPLAY COMMANDS ===");
    Serial.println("char:a        → Display letter 'a'");
    Serial.println("word:hello    → Display word 'hello'");
    Serial.println("pattern:3     → Display pattern 3 (0-63)");
    Serial.println("test          → Run test sequence");
    Serial.println("demo          → Enable button demo mode");
    Serial.println("help          → Show this help");
    Serial.println("");
    Serial.println("Examples:");
    Serial.println("  char:h      → Shows letter 'h'");
    Serial.println("  word:cat    → Shows word 'cat'");
    Serial.println("  pattern:7   → Shows dots 1,2,3 (binary 111)");
  }
  else if (command.length() > 0) {
    Serial.print("Unknown command: ");
    Serial.println(command);
    Serial.println("Type 'help' for available commands");
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("╔══════════════════════════════════════╗");
  Serial.println("║    ARDUINO UNO R3 BRAILLE DISPLAY   ║");
  Serial.println("║       Web App Integration            ║");
  Serial.println("╚══════════════════════════════════════╝");
  Serial.println("");
  
  // Initialize solenoid control pins (MOSFET gates)
  for (int i = 0; i < 6; i++) {
    pinMode(solenoidPins[i], OUTPUT);
    digitalWrite(solenoidPins[i], LOW);  // Start with all solenoids OFF (retracted UP)
  }
  
  // Initialize button and LED
  pinMode(buttonPin, INPUT_PULLUP);  // Use internal pullup resistor
  pinMode(statusLED, OUTPUT);
  setStatusLED(false);
  
  Serial.println("🔧 Hardware Configuration:");
  Serial.println("   - Pins 2-7: MOSFET gate control (solenoids 1-6)");
  Serial.println("   - Pin 8: Push button (with internal pullup)");
  Serial.println("   - Pin 13: Status LED (built-in)");
  Serial.println("   - 12V external power for solenoids");
  Serial.println("   - MOSFETs drive solenoids via 12V supply");
  Serial.println("");
  
  Serial.println("🎯 Expected Solenoid Behavior:");
  Serial.println("   - HIGH signal: MOSFET on → Solenoid PUSHES DOWN");
  Serial.println("   - LOW signal: MOSFET off → Solenoid RETRACTS UP");
  Serial.println("");
  
  // Startup LED sequence
  Serial.println("🚀 Starting up...");
  blinkStatusLED(5, 150);
  
  // Test all solenoids on startup
  testAllSolenoids();
  
  // Ready status
  Serial.println("🎉 READY FOR BRAILLE DISPLAY!");
  Serial.println("");
  Serial.println("💻 Web App Integration:");
  Serial.println("   - Send commands via Serial Monitor");
  Serial.println("   - Compatible with BrailleLearn web app");
  Serial.println("   - Type 'help' for available commands");
  Serial.println("");
  Serial.println("🔘 Demo Mode:");
  Serial.println("   - Press button to cycle through letters in 'hello'");
  Serial.println("   - Send any command to exit demo mode");
  Serial.println("");
  
  // Display first character in demo mode
  if (currentWord.length() > 0) {
    displayCharacter(currentWord[0]);
  }
  
  setStatusLED(true); // Solid LED when ready
}

void loop() {
  // Check for serial commands (from web app or Serial Monitor)
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    processSerialCommand(command);
  }
  
  // Handle button press in demo mode
  if (demoMode) {
    bool currentButtonState = digitalRead(buttonPin) == LOW; // LOW = pressed (pullup)
    
    if (currentButtonState && !buttonPressed && 
        (millis() - lastButtonPress > debounceDelay)) {
      
      buttonPressed = true;
      lastButtonPress = millis();
      
      // Move to next character in demo word
      currentLetterIndex++;
      if (currentLetterIndex >= currentWord.length()) {
        currentLetterIndex = 0; // Loop back to start
        Serial.println("=== DEMO WORD COMPLETE - RESTARTING ===");
      }
      
      // Display current character
      char currentChar = currentWord[currentLetterIndex];
      Serial.print("🔘 Button pressed! Next letter: ");
      displayCharacter(currentChar);
      
      // Quick LED flash to acknowledge button press
      setStatusLED(false);
      delay(100);
      setStatusLED(true);
    }
    
    // Reset button state when released
    if (!currentButtonState && buttonPressed) {
      buttonPressed = false;
    }
  }
  
  // Heartbeat blink when idle (shows Arduino is alive)
  static unsigned long lastHeartbeat = 0;
  if (millis() - lastHeartbeat > 5000) {
    blinkStatusLED(1, 50);
    lastHeartbeat = millis();
    
    if (demoMode) {
      Serial.println("💡 Demo mode active - press button or send command");
    } else {
      Serial.println("💡 Ready for commands - type 'help' for options");
    }
  }
  
  delay(50); // Small delay for stability
}