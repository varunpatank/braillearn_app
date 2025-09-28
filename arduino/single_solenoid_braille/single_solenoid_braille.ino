#define ARDUINO_NO_PIN_REMAP  // Fix for ESP32 core compatibility

#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// BLE UUIDs - must match the web app
#define SERVICE_UUID        "19b10000-e8f2-537e-4f6c-d104768a1214"
#define CHARACTERISTIC_UUID "19b10001-e8f2-537e-4f6c-d104768a1214"

// Hardware pins for Arduino Nano ESP32
#define SOLENOID_PIN 2    // GPIO 2 - controls Dot 1 solenoid
#define STATUS_LED 48     // GPIO 48 - built-in LED on ESP32-S3

BLEServer* pServer = nullptr;
BLECharacteristic* pCharacteristic = nullptr;
bool deviceConnected = false;

// Status LED control
void setStatusLED(bool state) {
  digitalWrite(STATUS_LED, state);
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

// BLE connection callbacks
class ServerCallbacks: public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) override {
    deviceConnected = true;
    Serial.println("🔗 BLE: Device connected to braille app");
    
    // Connected: Solid LED + 3 quick blinks
    setStatusLED(true);
    delay(500);
    blinkStatusLED(3, 100);
    setStatusLED(true); // Stay on when connected
  }
  
  void onDisconnect(BLEServer* pServer) override {
    deviceConnected = false;
    setStatusLED(false);
    pServer->getAdvertising()->start();
    Serial.println("📱 BLE: Device disconnected; advertising restarted");
  }
};

// Control solenoid based on braille pattern
void updateSolenoid(uint8_t pattern) {
  Serial.print("📍 Received braille pattern: ");
  Serial.println(pattern, BIN);
  
  // Check if Dot 1 should be active (bit 0)
  bool dot1Active = pattern & (1 << 0);
  
  if (dot1Active) {
    digitalWrite(SOLENOID_PIN, HIGH);  // PUSH DOWN
    Serial.println("🔴 Dot 1 ACTIVE - Solenoid pushing DOWN");
    
    // Quick LED flash to show activity
    setStatusLED(false);
    delay(50);
    setStatusLED(true);
  } else {
    digitalWrite(SOLENOID_PIN, LOW);   // RETRACT UP
    Serial.println("⚪ Dot 1 INACTIVE - Solenoid retracted UP");
  }
  
  // Keep solenoid active for tactile feedback duration
  if (dot1Active) {
    delay(800);  // Hold for 800ms
    digitalWrite(SOLENOID_PIN, LOW);  // Then retract
    Serial.println("🔵 Solenoid retracted after feedback period");
  }
}

// BLE characteristic callbacks
class CharacteristicCallbacks: public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* pCharacteristic) override {
    std::string rxValue = pCharacteristic->getValue();
    
    if (rxValue.length() == 1) {
      uint8_t pattern = (uint8_t)rxValue[0];
      Serial.print("📱 BLE: Received from braille app: ");
      Serial.println(pattern, BIN);
      
      updateSolenoid(pattern);
    } else {
      Serial.print("⚠️  BLE: Received ");
      Serial.print(rxValue.length());
      Serial.println(" bytes; expected 1 byte");
    }
  }
};

void setup() {
  Serial.begin(115200);
  delay(3000);  // ESP32 needs startup time
  
  Serial.println("╔══════════════════════════════════════╗");
  Serial.println("║   SINGLE SOLENOID BRAILLE DISPLAY   ║");
  Serial.println("║        Arduino Nano ESP32           ║");
  Serial.println("╚══════════════════════════════════════╝");
  Serial.println("");
  
  // Initialize hardware pins
  pinMode(SOLENOID_PIN, OUTPUT);
  pinMode(STATUS_LED, OUTPUT);
  
  // Start with everything OFF
  digitalWrite(SOLENOID_PIN, LOW);  // Solenoid retracted
  setStatusLED(false);              // LED off
  
  Serial.println("🔧 Hardware initialized:");
  Serial.println("   - GPIO 2: Solenoid control (Dot 1)");
  Serial.println("   - GPIO 48: Status LED");
  Serial.println("");
  
  // LED startup sequence
  Serial.println("🚀 Starting up...");
  blinkStatusLED(5, 150);
  
  // Test solenoid on startup
  Serial.println("🧪 Testing solenoid - should PUSH DOWN");
  digitalWrite(SOLENOID_PIN, HIGH);
  blinkStatusLED(2, 200);
  delay(1000);
  
  Serial.println("🧪 Retracting solenoid - should pull UP");
  digitalWrite(SOLENOID_PIN, LOW);
  delay(500);
  
  Serial.println("✅ Solenoid test complete");
  Serial.println("");
  
  // Initialize BLE
  Serial.println("📡 Initializing Bluetooth...");
  BLEDevice::init("Braille_Display");
  
  // Create BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new ServerCallbacks());
  
  // Create BLE Service
  BLEService* pService = pServer->createService(SERVICE_UUID);
  
  // Create BLE Characteristic (WRITE only)
  pCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_WRITE
  );
  pCharacteristic->setCallbacks(new CharacteristicCallbacks());
  
  // Start the service
  pService->start();
  
  // Configure and start advertising
  BLEAdvertising* pAdvertising = pServer->getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMinPreferred(0x12);
  pAdvertising->setMinInterval(0x20);
  pAdvertising->setMaxInterval(0x40);
  pAdvertising->start();
  
  Serial.println("✅ Bluetooth initialized and advertising");
  Serial.println("");
  
  // Final status
  blinkStatusLED(3, 300);
  
  Serial.println("🎉 READY FOR BRAILLE APP CONNECTION!");
  Serial.println("");
  Serial.println("📱 In the web app:");
  Serial.println("   1. Go to Hardware Setup page");
  Serial.println("   2. Click 'Connect Device'");
  Serial.println("   3. Select 'Braille_Display'");
  Serial.println("   4. Test Dot 1 button");
  Serial.println("");
  Serial.println("🔍 Expected behavior:");
  Serial.println("   - Dot 1 active: Solenoid PUSHES DOWN");
  Serial.println("   - Dot 1 inactive: Solenoid RETRACTS UP");
  Serial.println("");
}

void loop() {
  if (!deviceConnected) {
    // Slow blink when waiting for connection
    setStatusLED(true);
    delay(1000);
    setStatusLED(false);
    delay(1000);
    
    Serial.println("⏳ Waiting for braille app connection...");
  } else {
    // Connected - LED stays solid, just wait
    delay(100);
  }
}