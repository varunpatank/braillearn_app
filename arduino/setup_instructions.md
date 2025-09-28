# Single Solenoid Braille Display - Setup Instructions

## Step 1: Hardware Connections

### Required Components:
- ✅ Arduino Nano ESP32 (working - LED blinks)
- ✅ 1x Push-type solenoid (5V)
- ✅ External 5V power supply (1A minimum)
- ✅ Jumper wires
- ✅ USB-C cable

### Connections:
1. **Keep USB connected** to computer
2. **External 5V power**:
   - Red (+) wire → **VIN pin**
   - Black (-) wire → **GND pin** (next to VIN)
3. **Solenoid**:
   - Positive wire → **D2 pin** (GPIO 2)
   - Negative wire → **GND pin** (bottom of Arduino)

## Step 2: Upload Arduino Code

### Upload Process:
1. **Open Arduino IDE**
2. **Select Board**: "Arduino Nano ESP32"
3. **Select Port**: Your COM port
4. **Upload**: `single_solenoid_braille.ino`
5. **Wait 5 seconds** after upload
6. **Open Serial Monitor** (115200 baud)
7. **Press RESET** button on Arduino

### Expected Serial Output:
```
╔══════════════════════════════════════╗
║   SINGLE SOLENOID BRAILLE DISPLAY   ║
║        Arduino Nano ESP32           ║
╚══════════════════════════════════════╝

🔧 Hardware initialized:
   - GPIO 2: Solenoid control (Dot 1)
   - GPIO 48: Status LED

🧪 Testing solenoid - should PUSH DOWN
🧪 Retracting solenoid - should pull UP
✅ Solenoid test complete

📡 Initializing Bluetooth...
✅ Bluetooth initialized and advertising

🎉 READY FOR BRAILLE APP CONNECTION!
```

## Step 3: Connect to Web App

### In the BrailleLearn Web App:
1. **Navigate** to Hardware Setup page
2. **Click** "Connect Device" button
3. **Select** "Braille_Display" from Bluetooth list
4. **Wait** for "Connected" status
5. **Click** individual dot test buttons
6. **Test** "Dot 1" specifically

### Expected Behavior:
- **Dot 1 button**: Solenoid should PUSH DOWN
- **Other dots**: No physical movement (software only)
- **Status LED**: Solid when connected
- **Serial Monitor**: Shows received patterns

## Step 4: Test with Braille App

### Test Sequence:
1. **Individual Dot Test**: Click "Dot 1" button
2. **Sequential Test**: Run automated test
3. **Lesson Integration**: Try a basic lesson
4. **Speech to Braille**: Convert text and see Dot 1 activate

### Success Indicators:
- ✅ Solenoid pushes DOWN when Dot 1 is active
- ✅ Solenoid retracts UP when Dot 1 is inactive
- ✅ Movement is strong and definite
- ✅ Serial Monitor shows BLE communication
- ✅ Status LED indicates connection state

## Troubleshooting:

### Problem: Solenoid doesn't move
**Solutions**:
1. **Check external 5V power** (measure with multimeter)
2. **Verify connections** (D2 and GND)
3. **Test solenoid directly** with 5V
4. **Check Serial Monitor** for error messages

### Problem: Can't connect via Bluetooth
**Solutions**:
1. **Press RESET** on Arduino
2. **Check Serial Monitor** for "advertising" message
3. **Try different browser** (Chrome recommended)
4. **Clear browser Bluetooth cache**

### Problem: Connects but no movement
**Solutions**:
1. **Check power supply current** (need 1A+)
2. **Verify solenoid type** (push vs pull)
3. **Try reversing solenoid wires**
4. **Check Serial Monitor** for received patterns

## Next Steps:
Once single solenoid works perfectly, you can expand to 6 solenoids for a complete braille cell!