# Solenoid Troubleshooting Flowchart

## Start Here: "Nothing Happened"

### Step 1: Is Arduino Working?
**Test**: Upload `step_by_step_debug.ino` and check Serial Monitor

**If NO messages in Serial Monitor**:
- ❌ Arduino not working
- Check USB connection
- Check board selection
- Press RESET button
- Try different USB cable

**If messages appear**:
- ✅ Arduino is working
- Continue to Step 2

### Step 2: Is Power Supply Connected?
**Test**: Measure voltage at VIN pin with multimeter

**If 0V at VIN pin**:
- ❌ Power supply not connected
- Check +5V wire to VIN pin
- Check power supply is plugged in
- Check power supply is turned on

**If ~5V at VIN pin**:
- ✅ Power supply connected
- Continue to Step 3

### Step 3: Does GPIO 2 Work?
**Test**: Measure GPIO 2 voltage while running test program

**If GPIO 2 doesn't change voltage**:
- ❌ Arduino GPIO problem
- Try different GPIO pin
- Check Arduino is not damaged

**If GPIO 2 changes 0V ↔ 3.3V**:
- ✅ GPIO 2 working
- Continue to Step 4

### Step 4: Does Solenoid Work?
**Test**: Connect solenoid DIRECTLY to 5V power supply

**If solenoid doesn't move with direct 5V**:
- ❌ Solenoid or power supply problem
- Check power supply current rating (need 1A+)
- Check solenoid is push-type (not pull-type)
- Try different solenoid

**If solenoid moves with direct 5V**:
- ✅ Solenoid works
- Continue to Step 5

### Step 5: Is Circuit Complete?
**Test**: Reconnect solenoid to Arduino and test

**If solenoid still doesn't move**:
- ❌ Circuit problem
- Check all wire connections
- Verify solenoid + goes to GPIO 2
- Verify solenoid - goes to GND
- Check GND is connected to power supply

**If solenoid moves**:
- ✅ SUCCESS! Everything working

## Common Problems and Solutions:

### Problem: "Arduino not responding"
**Symptoms**: No Serial Monitor output
**Solutions**:
- Check board: "Arduino Nano ESP32"
- Check baud rate: 115200
- Press RESET button
- Wait 5 seconds after upload

### Problem: "No power at VIN"
**Symptoms**: 0V measured at VIN pin
**Solutions**:
- Check power supply is plugged in
- Check +5V wire connected to VIN
- Check power supply polarity
- Test power supply with multimeter

### Problem: "GPIO doesn't work"
**Symptoms**: GPIO 2 stays at 0V or 3.3V
**Solutions**:
- Try different GPIO pin (3, 4, 5)
- Check Arduino not damaged
- Verify program uploaded correctly

### Problem: "Solenoid doesn't work with direct 5V"
**Symptoms**: No movement when connected directly to power
**Solutions**:
- Check power supply current (need 1A+)
- Check solenoid type (push vs pull)
- Try different solenoid
- Check power supply voltage (exactly 5V)

### Problem: "Works with direct 5V but not with Arduino"
**Symptoms**: Solenoid moves with direct power, not with Arduino
**Solutions**:
- Check solenoid + connected to GPIO 2
- Check solenoid - connected to GND
- Check GND connected to power supply GND
- Verify all connections tight

## Quick Diagnostic Questions:

1. **Do you see messages in Serial Monitor?**
   - No → Arduino problem
   - Yes → Continue

2. **Do you have external 5V power connected?**
   - No → Connect external power to VIN
   - Yes → Continue

3. **Does solenoid move when connected directly to 5V?**
   - No → Power supply or solenoid problem
   - Yes → Wiring problem

4. **Are all wires connected securely?**
   - No → Check all connections
   - Yes → May need driver circuit (ULN2803)

## Next Steps:
Based on which test fails, we can identify the exact problem and fix it!