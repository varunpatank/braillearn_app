# Power Requirements for Braille Display

## Why USB Power Doesn't Work:
- **USB provides**: ~500mA maximum
- **Single solenoid needs**: 300-500mA
- **Result**: Not enough power, Arduino resets or stops

## What You Need:
### Minimum for 1 Solenoid:
- **5V DC wall adapter**
- **1A (1000mA) current rating**
- **Barrel jack or wire connections**

### For Full 6-Solenoid Setup:
- **5V DC power supply**
- **3A (3000mA) current rating**
- **Switching power supply recommended**

## Recommended Power Supplies:

### Budget Option (1 solenoid):
- 5V 1A wall adapter
- ~$5-10 on Amazon
- Search: "5V 1A DC adapter"

### Full Setup (6 solenoids):
- 5V 5A switching power supply
- ~$15-25 on Amazon
- Search: "5V 5A power supply"

## Connection Method:
1. **Cut the connector** off the power adapter
2. **Strip the wires** (usually red=+, black=-)
3. **Connect to Arduino**:
   - **Red (+) wire** → **VIN pin**
   - **Black (-) wire** → **GND pin**

## Safety Check:
- Use multimeter to verify 5V output
- Check polarity before connecting
- Start with 1A adapter for single solenoid

## Test Procedure:
1. Connect external 5V power
2. Upload continuous blink test
3. Should blink forever without stopping
4. If it stops, power supply is inadequate