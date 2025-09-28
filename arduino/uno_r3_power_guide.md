# Arduino Uno R3 Power Supply Guide

## Why External Power is Required:
- **USB provides**: ~500mA maximum
- **Solenoid needs**: 300-500mA
- **Arduino logic**: ~50mA
- **Total needed**: 1A minimum

## Power Supply Options:

### Option 1: Wall Adapter (Recommended)
- **Voltage**: 5V DC
- **Current**: 1A minimum (2A recommended)
- **Connector**: Barrel jack (2.1mm) or bare wires
- **Cost**: $8-15

### Option 2: Bench Power Supply
- **Voltage**: Set to 5V DC
- **Current**: Set limit to 2A
- **Advantage**: Precise voltage control

## Connection Methods:

### Method 1: Barrel Jack (Easiest)
1. **Get 5V adapter** with 2.1mm barrel jack
2. **Plug directly** into Arduino power jack
3. **No wiring needed**

### Method 2: VIN Pin Connection
1. **Cut barrel connector** off adapter
2. **Strip wires** (red=+, black=-)
3. **Connect**:
   - Red (+) → VIN pin
   - Black (-) → GND pin

## Arduino Uno R3 Power Pins:
```
Power Section:
VIN ● ← External power input (5-12V)
GND ● ← Ground connection
5V  ● ← Regulated 5V output
3V3 ● ← 3.3V output (not used)
```

## Voltage Requirements:
- **VIN pin**: 5-12V DC (5V recommended)
- **Current**: 1A minimum for single solenoid
- **Regulation**: Arduino has built-in 5V regulator

## Safety Checklist:
- ✅ **Measure voltage** before connecting
- ✅ **Check polarity** (+ to VIN, - to GND)
- ✅ **Start with Arduino off**
- ✅ **Use fused power supply** if available

## Power Supply Test:
1. **Connect power supply** to Arduino
2. **Measure 5V pin** with multimeter
3. **Should read 5.0V ±0.1V**
4. **If wrong voltage**: check power supply

## Common Issues:

### No voltage at 5V pin:
- **Cause**: Power supply not connected or wrong polarity
- **Solution**: Check connections and polarity

### Voltage too low (< 4.8V):
- **Cause**: Inadequate power supply or high resistance connections
- **Solution**: Use higher current power supply

### Arduino resets when solenoid activates:
- **Cause**: Voltage drop due to insufficient current
- **Solution**: Use 2A+ power supply, add large capacitor

## Recommended Power Supplies:

### Budget Option:
- **Search**: "5V 2A wall adapter"
- **Features**: Basic switching adapter
- **Price**: ~$8

### Quality Option:
- **Search**: "5V 3A regulated power supply"
- **Features**: Over-current protection, stable output
- **Price**: ~$15

## Power Connection Diagram:
```
5V Power Supply
    │
    ├─ Red (+) ──→ Arduino VIN pin
    └─ Black (-) ─→ Arduino GND pin
                        │
USB Cable               │
Computer ←──→ Arduino   │
                        │
Solenoid                │
    + wire ────────→ Pin 2
    - wire ────────→ GND ←┘
```

## Testing Power Setup:
1. **Connect external power** (Arduino off)
2. **Measure VIN pin**: Should be ~5V
3. **Measure 5V pin**: Should be ~5V
4. **Connect USB** for programming
5. **Upload test program**
6. **Monitor voltage** during solenoid operation

## Future Expansion:
This power setup will support:
- **6 solenoids**: For complete braille cell
- **Additional sensors**: For enhanced functionality
- **Bluetooth module**: For wireless communication

The key is starting with adequate power from the beginning!