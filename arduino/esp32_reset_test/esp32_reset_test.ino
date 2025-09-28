// ESP32 Reset and Boot Test
// Helps diagnose boot issues

#include "esp_system.h"

void setup() {
  Serial.begin(115200);
  delay(5000);  // ESP32 needs time
  
  Serial.println("=== ESP32 BOOT DIAGNOSTIC ===");
  
  // Print reset reason
  esp_reset_reason_t reset_reason = esp_reset_reason();
  Serial.print("Reset reason: ");
  switch(reset_reason) {
    case ESP_RST_POWERON: Serial.println("Power on reset"); break;
    case ESP_RST_EXT: Serial.println("External reset"); break;
    case ESP_RST_SW: Serial.println("Software reset"); break;
    case ESP_RST_PANIC: Serial.println("Exception/panic reset"); break;
    case ESP_RST_INT_WDT: Serial.println("Interrupt watchdog reset"); break;
    case ESP_RST_TASK_WDT: Serial.println("Task watchdog reset"); break;
    case ESP_RST_WDT: Serial.println("Other watchdog reset"); break;
    case ESP_RST_DEEPSLEEP: Serial.println("Deep sleep reset"); break;
    case ESP_RST_BROWNOUT: Serial.println("Brownout reset"); break;
    case ESP_RST_SDIO: Serial.println("SDIO reset"); break;
    default: Serial.println("Unknown reset"); break;
  }
  
  Serial.println("ESP32 is booting normally");
  
  // Test GPIO
  pinMode(2, OUTPUT);
  pinMode(48, OUTPUT);
  
  Serial.println("GPIO pins initialized");
}

void loop() {
  static int count = 0;
  count++;
  
  Serial.print("Loop count: ");
  Serial.println(count);
  
  digitalWrite(2, HIGH);
  digitalWrite(48, HIGH);
  delay(500);
  
  digitalWrite(2, LOW);
  digitalWrite(48, LOW);
  delay(500);
}