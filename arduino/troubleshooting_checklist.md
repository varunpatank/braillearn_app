# Solenoid Troubleshooting Checklist

## ✅ Arduino Working (LED Blinks)
Your Arduino Nano ESP32 is confirmed working!

## Next Steps:

### 1. **Power Supply Check**
- [ ] External 5V power supply connected
- [ ] Voltage measured: 5.0V ±0.2V
- [ ] Current rating: 1A or higher
- [ ] +5V connected to VIN pin
- [ ] GND connected to GND pin

### 2. **Solenoid Direct Test**
- [ ] Disconnect solenoid from Arduino
- [ ] Connect solenoid + to +5V directly
- [ ] Connect solenoid - to GND directly
- [ ] Solenoid should activate immediately
- [ ] If not, power supply or solenoid is bad

### 3. **Arduino Solenoid Test**
- [ ] Reconnect solenoid to GPIO 2
- [ ] Upload working_arduino_solenoid_test.ino
- [ ] Watch Serial Monitor for instructions
- [ ] Look for solenoid movement

### 4. **Common Issues**

#### **Solenoid doesn't move at all:**
- Insufficient power (need 1A+ at 5V)
- Wrong solenoid type (pull vs push)
- Bad connections
- Broken solenoid

#### **Solenoid moves wrong direction:**
- Reverse the solenoid wires
- You might have pull-type instead of push-type

#### **Weak movement:**
- Power supply voltage too low
- Power supply current too low
- Voltage drop in wires

### 5. **Success Indicators**
- [ ] Solenoid pushes DOWN when GPIO 2 is HIGH
- [ ] Solenoid retracts UP when GPIO 2 is LOW
- [ ] Movement is strong and definite
- [ ] Serial Monitor shows test messages

### 6. **If Still Not Working**

Try this sequence:
1. **Measure power supply voltage** (must be 5V)
2. **Test solenoid directly** with 5V
3. **Check all wire connections**
4. **Try different solenoid** if available
5. **Use multimeter** to trace voltage

## What to Try Next:
Since your Arduino is working, the issue is almost certainly:
1. **Power supply** (most common)
2. **Solenoid type/connections**
3. **Wiring errors**

Upload the `working_arduino_solenoid_test.ino` and follow the instructions!