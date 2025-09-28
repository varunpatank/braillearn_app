# Arduino Nano ESP32 - Quick Start Guide

## Upload Instructions:

### 1. **Board Settings** (Very Important!)
- **Board**: "Arduino Nano ESP32" (not regular Nano!)
- **Port**: Select your COM port
- **Upload Speed**: 115200 (slower = more reliable)

### 2. **Upload Process**
1. **Connect USB cable**
2. **Select correct board and port**
3. **Click Upload**
4. **Wait for "Done uploading"**
5. **IMPORTANT**: Wait 5 seconds after upload
6. **Open Serial Monitor** (115200 baud)
7. **Press RESET button** on Arduino

### 3. **If Upload Fails**
Try this sequence:
1. **Hold BOOT button** on Arduino
2. **Click Upload** in Arduino IDE
3. **Keep holding BOOT** until upload starts
4. **Release BOOT button**
5. **Wait for upload to complete**
6. **Press RESET button**

## Test Programs (Start Here):

### **Test 1: super_simple_blink.ino**
- Simplest possible test
- Just blinks GPIO 2
- Should see "LED ON/OFF" in Serial Monitor

### **Test 2: heartbeat_test.ino**
- Heartbeat blinking pattern
- Tests multiple pins
- Easy to see if working

### **Test 3: pin_finder.ino**
- Finds which pin has the LED
- Tests pins one by one
- Tells you which pin lights up

### **Test 4: esp32_alive_test.ino**
- Maximum compatibility
- Works on any ESP32 board
- Shows Arduino is running

## Troubleshooting:

### **Problem: Nothing in Serial Monitor**
**Solutions**:
1. Check baud rate is **115200**
2. Select correct **COM port**
3. **Press RESET button** on Arduino
4. **Wait 5 seconds** after upload
5. Try different **USB cable**

### **Problem: Upload Fails**
**Solutions**:
1. Check board is **"Arduino Nano ESP32"**
2. **Hold BOOT button** during upload
3. Try slower upload speed: **115200**
4. **Press RESET** after upload

### **Problem: Program Uploads but Doesn't Run**
**Solutions**:
1. **Press RESET button** after upload
2. **Wait longer** (ESP32 takes time to start)
3. **Check power** - try different USB port
4. **Disconnect and reconnect** USB

## ESP32 Nano Specific Notes:

### **Power Requirements**:
- **USB power**: OK for basic tests
- **External 5V**: Required for solenoids
- **Current draw**: Higher than regular Arduino

### **GPIO Pins**:
- **GPIO 2**: Safe for general use
- **GPIO 48**: Built-in LED (on some boards)
- **GPIO 13**: Often has LED
- **Avoid**: GPIO 0, 1 (used for programming)

### **Boot Process**:
- Takes **3-5 seconds** to start
- **BOOT button**: Forces programming mode
- **RESET button**: Restarts program

## Success Indicators:

### **You'll know it's working when**:
1. **Serial Monitor** shows messages
2. **LED blinks** (if visible)
3. **Messages repeat** every second
4. **No error messages** in upload

### **If still not working**:
1. Try **different USB cable**
2. Try **different USB port**
3. Check **board selection** again
4. **Hold BOOT** during upload
5. **Press RESET** after upload

## Next Steps:
Once basic blink works, you can test solenoids with external 5V power supply.