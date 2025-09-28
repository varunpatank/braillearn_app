# Arduino Uno R3 Troubleshooting Guide

## Common Issues and Solutions:

### 1. "No Serial Monitor Output"

**Symptoms**: Nothing appears in Serial Monitor
**Solutions**:
- ✅ **Check baud rate**: Must be 115200
- ✅ **Select correct COM port**: Tools → Port
- ✅ **Press reset button** on Arduino
- ✅ **Try different USB cable**
- ✅ **Check board selection**: "Arduino Uno"

### 2. "Solenoid Doesn't Move"

**Symptoms**: No physical movement from solenoid
**Solutions**:
- ✅ **Check external 5V power**: Measure VIN pin with multimeter
- ✅ **Verify connections**: Pin 2 to solenoid +, GND to solenoid -
- ✅ **Test solenoid directly**: Connect to 5V power supply
- ✅ **Check power supply current**: Need 1A minimum
- ✅ **Try different solenoid**: May be wrong type (pull vs push)

### 3. "Arduino Resets When Solenoid Activates"

**Symptoms**: Arduino restarts when solenoid turns on
**Solutions**:
- ✅ **Increase power supply current**: Use 2A instead of 1A
- ✅ **Add large capacitor**: 1000μF across power rails
- ✅ **Check power supply quality**: Use regulated supply
- ✅ **Shorten power wires**: Reduce voltage drop

### 4. "Commands Don't Work"

**Symptoms**: Typing commands has no effect
**Solutions**:
- ✅ **Check command format**: `char:a` (lowercase, with colon)
- ✅ **Press Enter**: After typing command
- ✅ **Set line ending**: "Newline" in Serial Monitor
- ✅ **Try help command**: Type `help` first

### 5. "Solenoid Moves Wrong Direction"

**Symptoms**: Solenoid pulls UP instead of pushing DOWN
**Solutions**:
- ✅ **Reverse solenoid wires**: Swap + and - connections
- ✅ **Check solenoid type**: Need push-type, not pull-type
- ✅ **Test with direct 5V**: Verify correct direction

## Diagnostic Steps:

### Step 1: Basic Arduino Test
```
Upload: uno_r3_simple_test.ino
Expected: Serial messages every 3 seconds
If fails: Arduino or USB connection problem
```

### Step 2: Power Supply Test
```
Measure: VIN pin voltage with multimeter
Expected: 5.0V ±0.2V
If fails: Power supply not connected or wrong voltage
```

### Step 3: GPIO Test
```
Measure: Pin 2 voltage during operation
Expected: 5V when HIGH, 0V when LOW
If fails: Arduino GPIO problem
```

### Step 4: Solenoid Direct Test
```
Connect: Solenoid directly to 5V power supply
Expected: Immediate activation
If fails: Solenoid or power supply problem
```

### Step 5: Complete Circuit Test
```
Connect: Everything together and run test
Expected: Solenoid follows commands
If fails: Wiring or connection problem
```

## Voltage Measurements:

### Normal Voltages:
- **VIN pin**: 5.0V ±0.2V
- **5V pin**: 5.0V ±0.1V
- **Pin 2 HIGH**: 5.0V
- **Pin 2 LOW**: 0V
- **GND pin**: 0V

### Problem Voltages:
- **VIN = 0V**: Power supply not connected
- **VIN < 4.5V**: Inadequate power supply
- **Pin 2 = 0V always**: Arduino GPIO problem
- **Pin 2 = 5V always**: Arduino GPIO stuck

## Serial Monitor Settings:

### Correct Settings:
- **Baud rate**: 115200
- **Line ending**: "Newline"
- **Port**: Correct COM port
- **Board**: "Arduino Uno"

### Test Commands:
```
help           → Shows all available commands
char:a         → Tests single character
word:test      → Tests word display
pattern:1      → Tests raw pattern
```

## Hardware Checklist:

### Power Connections:
- [ ] External 5V connected to VIN pin
- [ ] GND connected between power supply and Arduino
- [ ] Power supply rated for 1A or higher
- [ ] Voltage measured and verified as 5V

### Solenoid Connections:
- [ ] Solenoid + wire connected to Pin 2
- [ ] Solenoid - wire connected to GND pin
- [ ] Solenoid tested directly with 5V
- [ ] Solenoid is push-type (extends when powered)

### Arduino Connections:
- [ ] USB cable connected for programming
- [ ] Correct board selected in Arduino IDE
- [ ] Correct COM port selected
- [ ] Program uploaded successfully

## Quick Fixes:

### "Nothing works":
1. **Press reset button** on Arduino
2. **Check all connections** with multimeter
3. **Upload simple blink program** first
4. **Try different USB cable**

### "Solenoid weak or slow":
1. **Check power supply current** (need 2A)
2. **Measure voltage under load**
3. **Add large capacitor** (1000μF)
4. **Use shorter, thicker wires**

### "Commands ignored":
1. **Type exactly**: `char:a` (no spaces, lowercase)
2. **Press Enter** after command
3. **Check Serial Monitor** line ending setting
4. **Try `help` command** first

## Success Indicators:
- ✅ Serial Monitor shows startup messages
- ✅ Built-in LED blinks during operation
- ✅ Solenoid pushes DOWN when active
- ✅ Solenoid retracts UP when inactive
- ✅ Commands work reliably
- ✅ No Arduino resets during operation

If you're still having issues, work through the diagnostic steps in order and report which step fails!