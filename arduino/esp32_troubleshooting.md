# ESP32 Nano Troubleshooting Guide

## Common ESP32 Nano Issues:

### 1. **Program Uploads but Doesn't Run**
**Symptoms**: Blinks during upload, then nothing
**Causes**: 
- Boot mode issues
- Power supply problems
- Serial monitor not connected properly

**Solutions**:
1. **Hold BOOT button** while pressing RESET, then release RESET, then release BOOT
2. **Check Serial Monitor baud rate**: Must be 115200
3. **Wait longer**: ESP32 takes 3-5 seconds to start
4. **Try different USB cable**

### 2. **Serial Monitor Shows Nothing**
**Solutions**:
1. Set baud rate to **115200**
2. Select correct COM port
3. Close and reopen Serial Monitor
4. Press RESET button on Arduino
5. Try different USB port

### 3. **Power Issues with ESP32**
**ESP32 Power Requirements**:
- **3.3V logic** (not 5V like Arduino Uno)
- **Higher current draw** than regular Arduino
- **Needs stable power** during WiFi/Bluetooth operations

**Power Solutions**:
- Use **external 5V supply** connected to VIN
- **Never exceed 6V** on VIN pin
- Add **large capacitor** (1000μF) for power stability

### 4. **GPIO Pin Issues**
**ESP32 Nano GPIO Notes**:
- **GPIO 2**: Safe for solenoid control
- **GPIO 48**: Built-in LED (ESP32-S3)
- **Some pins are input-only**
- **Some pins used for flash memory**

**Safe GPIO pins for solenoids**: 2, 4, 5, 12, 13, 14, 15, 16, 17

### 5. **Upload Problems**
**If upload fails**:
1. **Hold BOOT button** during upload
2. **Press RESET** after upload completes
3. **Check board selection**: "Arduino Nano ESP32"
4. **Try slower upload speed**: 115200 instead of 921600

## Step-by-Step Fix:

### Step 1: Verify Board Selection
- Board: **"Arduino Nano ESP32"**
- Port: **Correct COM port**
- Upload Speed: **115200** (slower is more reliable)

### Step 2: Test Basic Function
1. Upload `esp32_nano_test.ino`
2. **Wait 5 seconds** after upload
3. Open Serial Monitor (115200 baud)
4. Press **RESET button** on Arduino
5. Should see messages and LED blinking

### Step 3: Check Power
1. **Disconnect USB** after upload
2. **Connect external 5V** to VIN and GND
3. **Reconnect USB** (for serial only)
4. Program should still run

### Step 4: Test Solenoid
1. Upload `solenoid_test.ino`
2. **Connect solenoid** to GPIO 2 and GND
3. **Use external 5V power**
4. Should see solenoid activate every few seconds

## ESP32 Nano Pinout:
```
     USB
   ┌─────┐
D13│     │VIN (5V input)
D12│     │GND
D11│     │RST
D10│     │5V (output)
D9 │     │A7
D8 │     │A6
D7 │     │A5
D6 │     │A4
D5 │     │A3
D4 │     │A2
D3 │     │A1
D2 │     │A0  ← Use GPIO 2 for solenoid
GND│     │REF
RST│     │3V3
RX │     │D13
TX │     │D12
   └─────┘
```

## If Still Not Working:

### Check These:
1. **Correct board selected**: Arduino Nano ESP32
2. **Serial Monitor baud**: 115200
3. **Wait time**: 5+ seconds after upload
4. **Power supply**: External 5V to VIN
5. **Reset button**: Press after upload

### Try This Sequence:
1. Upload program
2. **Disconnect USB**
3. **Connect external 5V power**
4. **Reconnect USB**
5. **Open Serial Monitor** (115200)
6. **Press RESET button**
7. **Wait 5 seconds**

### Last Resort:
1. **Hold BOOT button**
2. **Press and release RESET**
3. **Release BOOT button**
4. **Upload program again**
5. **Press RESET when done**