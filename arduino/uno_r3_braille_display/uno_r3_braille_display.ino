/*
Arduino UNO R3 Braille Display - Based on Science Buddies Experiment
Uses the same braille alphabet patterns from your original experiment code

Hardware Setup:
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
const int controlPins[6] = {2, 3, 4, 5, 6, 7};  // MOSFET gate control pins (same as your experiment)
const int buttonPin = 8;                         // Push button pin (same as your experiment)
const int statusLED = 13;                        // Built-in LED

// Braille alphabet patterns (EXACTLY from your original experiment code)
int braille[26][6] = {
  {1,0,0,0,0,0},  // a (first bump is raised, others are lowered)
  {1,1,0,0,0,0},  // b (first and second bumps are raised)
  {1,0,0,1,0,0},  // c (and so on...)
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

// Array of the alphabet (same as your experiment)
char alphabet[] = "abcdefghijklmnopqrstuvwxyz";

// String to convert to braille (from your original code)
String text = "hello";

// Variables for button control and demo mode
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

// Update solenoids based on braille pattern (from your original logic)
void updateSolenoids(int pattern[6]) {
  Serial.print(">> Displaying braille pattern: ");
  
  // Turn off all solenoids first (clean switching)
  for (int i = 0; i < 6; i++) {
    digitalWrite(controlPins[i], LOW);
  }
  
  delay(50); // Brief pause for clean switching
  
  // Activate solenoids based on pattern (from your original code)
  for (int k = 0; k < 6; k++) {
    if (pattern[k] == 1) {
      digitalWrite(controlPins[k], HIGH);  // HIGH = MOSFET on = solenoid extends DOWN
      Serial.print("●");
      Serial.print("Dot ");
      Serial.print(k + 1);
      Serial.println(" EXTENDED (pushed down)");
    } else {
      Serial.print("○");
    }
  }
  Serial.println();
  
  // Keep solenoids active for tactile feedback (from your original timing)
  delay(800);  // Hold for 800ms like your original code
  
  // Turn off all solenoids (return to retracted position)
  for (int i = 0; i < 6; i++) {
    digitalWrite(controlPins[i], LOW);
  }
  
  Serial.println(">> All solenoids retracted");
}

// Display character by finding its index (from your original logic)
void displayCharacter(char letter) {
  // Convert to lowercase
  if (letter >= 'A' && letter <= 'Z') {
    letter = letter + 32;
  }
  
  // Find index of this letter in the alphabet (from your original code)
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
  
  // Print the letter and its index (from your original code)
  Serial.print(">> Displaying letter: ");
  Serial.print(letter);
  Serial.print(" (index ");
  Serial.print(index);
  Serial.print(", dots: ");
  for (int i = 0; i < 6; i++) {
    if (braille[index][i] == 1) {
      Serial.print(i + 1);
      Serial.print(" ");
    }
  }
  Serial.println(")");
  
  // Get the corresponding row from the braille array and display it (from your original code)
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

// Parse web app format: receives array of dot numbers like [1,3,5]
void displayWebAppPattern(String dotString) {
  Serial.print(">> Web app pattern: ");
  Serial.println(dotString);
  
  // Initialize pattern array (all dots OFF)
  int pattern[6] = {0, 0, 0, 0, 0, 0};
  
  // Parse dot numbers from string like "1,3,5" or "1 3 5"
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
        Serial.print("Dot ");
        Serial.print(dotNumber);
        Serial.print(" ");
      }
    }
  }
  
  Serial.println("activated");
  updateSolenoids(pattern);
}

// Test all solenoids individually (from your original test logic)
void testAllSolenoids() {
  Serial.println("=== TESTING ALL SOLENOIDS ===");
  Serial.println("Each solenoid will PUSH DOWN for 1 second");
  
  for (int i = 0; i < 6; i++) {
    Serial.print("Testing Solenoid ");
    Serial.print(i + 1);
    Serial.print(" (Dot ");
    Serial.print(i + 1);
    Serial.println(") - should PUSH DOWN");
    
    digitalWrite(controlPins[i], HIGH);
    blinkStatusLED(1, 100);
    delay(1000);
    
    digitalWrite(controlPins[i], LOW);
    Serial.println("Solenoid retracted UP");
    delay(300);
  }
  
  Serial.println("=== TESTING ALL SOLENOIDS TOGETHER ===");
  Serial.println("All solenoids pushing DOWN simultaneously");
  for (int i = 0; i < 6; i++) {
    digitalWrite(controlPins[i], HIGH);
  }
  blinkStatusLED(3, 200);
  delay(2000);
  
  for (int i = 0; i < 6; i++) {
    digitalWrite(controlPins[i], LOW);
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
  else if (command.startsWith("dots:")) {
    // Web app format: dots:1,3,5 or dots:[1,3,5]
    if (command.length() > 5) {
      String dotString = command.substring(5);
      displayWebAppPattern(dotString);
      demoMode = false;
    } else {
      Serial.println("Usage: dots:1,3,5 (where 1,3,5 are dot numbers)");
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
    Serial.println("dots:1,3,5    → Display dots 1,3,5 (web app format)");
    Serial.println("test          → Run test sequence");
    Serial.println("demo          → Enable button demo mode");
    Serial.println("help          → Show this help");
    Serial.println("");
    Serial.println("Examples:");
    Serial.println("  char:h      → Shows letter 'h'");
    Serial.println("  word:cat    → Shows word 'cat'");
    Serial.println("  pattern:7   → Shows dots 1,2,3 (binary 111)");
    Serial.println("  dots:1,4    → Shows dots 1,4 (letter 'c')");
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
  Serial.println("║     Science Buddies Experiment      ║");
  Serial.println("╚══════════════════════════════════════╝");
  Serial.println("");
  
  // Initialize solenoid control pins (MOSFET gates) - same as your experiment
  for (int i = 0; i < 6; i++) {
    pinMode(controlPins[i], OUTPUT);
    digitalWrite(controlPins[i], LOW);  // Start with all solenoids OFF (retracted UP)
  }
  
  // Initialize button and LED - same as your experiment
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
  
  // Display first character in demo mode (from your original loop logic)
  if (text.length() > 0) {
    displayCharacter(text[0]);
  }
  
  setStatusLED(true); // Solid LED when ready
}

void loop() {
  // Check for serial commands (from web app or Serial Monitor)
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    processSerialCommand(command);
  }
  
  // Handle button press in demo mode (from your original button logic)
  if (demoMode) {
    bool currentButtonState = digitalRead(buttonPin) == LOW; // LOW = pressed (pullup)
    
    if (currentButtonState && !buttonPressed && 
        (millis() - lastButtonPress > debounceDelay)) {
      
      buttonPressed = true;
      lastButtonPress = millis();
      
      // Move to next character in demo word (from your original loop logic)
      currentLetterIndex++;
      if (currentLetterIndex >= text.length()) {
        currentLetterIndex = 0; // Loop back to start
        Serial.println("=== DEMO WORD COMPLETE - RESTARTING ===");
      }
      
      // Display current character
      char currentChar = text[currentLetterIndex];
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