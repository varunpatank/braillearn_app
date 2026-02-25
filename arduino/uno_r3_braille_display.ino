

const int solenoidPins[6] = {2, 3, 4, 5, 6, 7};  
const int buttonPin = 8;                          
const int statusLED = 13;                         


int braille[26][6] = {
  {1,0,0,0,0,0},  
  {1,1,0,0,0,0},  
  {1,0,0,1,0,0},  
  {1,0,0,1,1,0},  
  {1,0,0,0,1,0},  
  {1,1,0,1,0,0},  
  {1,1,0,1,1,0},  
  {1,1,0,0,1,0},  
  {0,1,0,1,0,0},  
  {0,1,0,1,1,0},  
  {1,0,1,0,0,0},  
  {1,1,1,0,0,0},  
  {1,0,1,1,0,0},  
  {1,0,1,1,1,0},  
  {1,0,1,0,1,0},  
  {1,1,1,1,0,0},  
  {1,1,1,1,1,0},  
  {1,1,1,0,1,0},  
  {0,1,1,1,0,0},  
  {0,1,1,1,1,0},  
  {1,0,1,0,0,1},  
  {1,1,1,0,0,1},  
  {0,1,0,1,1,1},  
  {1,0,1,1,0,1},  
  {1,0,1,1,1,1},  
  {1,0,1,0,1,1},  
};


char alphabet[] = "abcdefghijklmnopqrstuvwxyz";


String currentWord = "hello";
int currentLetterIndex = 0;
bool buttonPressed = false;
unsigned long lastButtonPress = 0;
const unsigned long debounceDelay = 200;
bool demoMode = true;


void setStatusLED(bool state) {
  digitalWrite(statusLED, state);
}


void blinkStatusLED(int times, int delayMs = 200) {
  for (int i = 0; i < times; i++) {
    setStatusLED(true);
    delay(delayMs);
    setStatusLED(false);
    delay(delayMs);
  }
}


void updateSolenoids(int pattern[6]) {
  Serial.print(">> Displaying pattern: ");
  
  
  for (int i = 0; i < 6; i++) {
    digitalWrite(solenoidPins[i], LOW);
  }
  delay(50); 
  
  
  for (int i = 0; i < 6; i++) {
    if (pattern[i] == 1) {
      digitalWrite(solenoidPins[i], HIGH);  
      Serial.print("●");
    } else {
      Serial.print("○");
    }
  }
  Serial.println();
  
  
  delay(800);  
  
  
  for (int i = 0; i < 6; i++) {
    digitalWrite(solenoidPins[i], LOW);
  }
  
  Serial.println(">> All solenoids retracted");
}


void displayCharacter(char letter) {
  
  if (letter >= 'A' && letter <= 'Z') {
    letter = letter + 32;
  }
  
  
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
  
  
  updateSolenoids(braille[index]);
}


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
      delay(500); 
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
  
  
  int pattern[6];
  for (int i = 0; i < 6; i++) {
    pattern[i] = (patternNumber >> i) & 1;
  }
  
  updateSolenoids(pattern);
}


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


void processSerialCommand(String command) {
  command.trim(); 
  command.toLowerCase(); 
  
  if (command.startsWith("char:")) {
  
    if (command.length() >= 6) {
      char letter = command.charAt(5);
      displayCharacter(letter);
      demoMode = false; 
    } else {
      Serial.println("Usage: char:a (where 'a' is the letter)");
    }
  }
  else if (command.startsWith("word:")) {
    
    if (command.length() > 5) {
      String word = command.substring(5);
      displayWord(word);
      demoMode = false; 
    } else {
      Serial.println("Usage: word:hello (where 'hello' is the word)");
    }
  }
  else if (command.startsWith("pattern:")) {
    
    if (command.length() > 8) {
      int pattern = command.substring(8).toInt();
      displayPattern(pattern);
      demoMode = false; 
    } else {
      Serial.println("Usage: pattern:3 (where 3 is 0-63)");
    }
  }
  else if (command == "test") {
    
    testAllSolenoids();
    Serial.println("Testing alphabet...");
    displayWord("abcdef");
    demoMode = false;
  }
  else if (command == "demo") {
    
    demoMode = true;
    currentLetterIndex = 0;
    Serial.println("Demo mode enabled - press button to cycle through letters");
  }
  else if (command == "help") {
    
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
  
  
  for (int i = 0; i < 6; i++) {
    pinMode(solenoidPins[i], OUTPUT);
    digitalWrite(solenoidPins[i], LOW);  
  }
  
  
  pinMode(buttonPin, INPUT_PULLUP);  
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
  
  
  Serial.println("🚀 Starting up...");
  blinkStatusLED(5, 150);
  
  
  testAllSolenoids();
  
  
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
  
  
  if (currentWord.length() > 0) {
    displayCharacter(currentWord[0]);
  }
  
  setStatusLED(true); 
}

void loop() {
  
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    processSerialCommand(command);
  }
  
  
  if (demoMode) {
    bool currentButtonState = digitalRead(buttonPin) == LOW; 
    
    if (currentButtonState && !buttonPressed && 
        (millis() - lastButtonPress > debounceDelay)) {
      
      buttonPressed = true;
      lastButtonPress = millis();
      
      
      currentLetterIndex++;
      if (currentLetterIndex >= currentWord.length()) {
        currentLetterIndex = 0; 
        Serial.println("=== DEMO WORD COMPLETE - RESTARTING ===");
      }
      
      
      char currentChar = currentWord[currentLetterIndex];
      Serial.print("🔘 Button pressed! Next letter: ");
      displayCharacter(currentChar);
      
      
      setStatusLED(false);
      delay(100);
      setStatusLED(true);
    }
    
    
    if (!currentButtonState && buttonPressed) {
      buttonPressed = false;
    }
  }
  
  
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
  
  delay(50); 
}