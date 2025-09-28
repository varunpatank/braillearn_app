# Solenoid Troubleshooting Guide

## Step 1: Basic Arduino Test
First, let's verify your Arduino is working:

### Upload and run: `arduino/basic_test/basic_test.ino`
- Should print messages to Serial Monitor
- Should blink an LED (if visible)
- If this doesn't work, Arduino setup is the problem

## Step 2: Power Supply Check
Most solenoid issues are power-related:

### Check Your Power Supply:
1. **Voltage**: Must be exactly 5V (measure with multimeter)
2. **Current**: Must provide at least 500mA (1A+ recommended)
3. **Connection**: 
   - **Positive (+)** → **VIN or 5V pin** on Arduino
   - **Negative (-)** → **GND pin** on Arduino

### Common Power Issues:
- USB power alone is NOT enough for solenoids
- Wall adapter must be 5V DC (not AC)
- Check polarity: + goes to +, - goes to -

## Step 3: Solenoid Direct Test
Test solenoid WITHOUT Arduino:

### Direct Connection Test:
1. Disconnect solenoid from Arduino
2. Connect solenoid directly to 5V power supply
3. **Positive wire** → **+5V**
4. **Negative wire** → **GND**
5. Solenoid should activate (push/pull)

### If solenoid doesn't move:
- Wrong voltage (needs exactly 5V)
- Insufficient current (needs 200-500mA)
- Broken solenoid
- Wrong solenoid type (needs push-type)

## Step 4: Arduino GPIO Test
Test if Arduino pins work:

### Upload and run: `arduino/voltage_test/voltage_test.ino`
- Measures if GPIO pins output voltage
- Use multimeter to check GPIO 2 voltage
- Should read ~3.3V when HIGH, 0V when LOW

## Step 5: ULN2803 Driver Test
If using ULN2803 driver chip:

### Check ULN2803 Wiring:
1. **Pin 9** → **GND** (Arduino GND)
2. **Pin 10** → **+5V** (External power supply)
3. **Pin 1** → **GPIO 2** (Arduino)
4. **Pin 18** → **Solenoid positive**
5. **Solenoid negative** → **GND**

### ULN2803 Test:
- Input HIGH (3.3V) should give output LOW (connects to GND)
- This allows 5V to flow through solenoid

## Step 6: Wiring Verification

### Correct Wiring Order:
```
Arduino GPIO 2 → ULN2803 Pin 1
ULN2803 Pin 18 → Solenoid Positive
Solenoid Negative → Power Supply GND
ULN2803 Pin 9 → Arduino GND
ULN2803 Pin 10 → Power Supply +5V
Arduino GND → Power Supply GND
```

## Step 7: Solenoid Type Check

### Push vs Pull Solenoids:
- **PUSH type**: Extends when powered (what we need)
- **PULL type**: Retracts when powered (wrong type)

### Test Direction:
1. Power solenoid directly with 5V
2. Should push DOWN/OUT when powered
3. Should retract UP/IN when unpowered

## Common Problems and Solutions:

### Problem: Nothing happens
- **Solution**: Check power supply voltage and current
- **Solution**: Verify all ground connections
- **Solution**: Test solenoid directly with 5V

### Problem: Solenoid moves wrong direction
- **Solution**: Reverse solenoid connections
- **Solution**: Check if you have pull-type instead of push-type

### Problem: Weak movement
- **Solution**: Increase power supply current rating
- **Solution**: Check voltage drop across connections
- **Solution**: Add large capacitor (1000μF) across power rails

### Problem: Works once then stops
- **Solution**: Power supply overloading
- **Solution**: Add heat sink to ULN2803
- **Solution**: Check for loose connections

## Multimeter Measurements:

### What to measure:
1. **Power supply output**: Should be 5.0V ±0.1V
2. **Arduino 5V pin**: Should be ~5V when external power connected
3. **GPIO 2 when HIGH**: Should be ~3.3V
4. **ULN2803 Pin 18 when active**: Should be ~0V (connects to ground)
5. **Solenoid voltage when active**: Should be ~5V

## Next Steps:
1. Start with basic Arduino test
2. Test power supply with multimeter
3. Test solenoid directly with 5V
4. Check all wiring connections
5. Upload solenoid test program
6. Measure voltages at each point

If solenoid still doesn't work after these tests, the issue is likely:
- Wrong solenoid type (pull instead of push)
- Insufficient power supply
- Wiring error
- Broken component