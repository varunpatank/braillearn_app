# Single Solenoid Braille Display - Connection Diagram

## Arduino Nano ESP32 Pinout Reference:
```
     USB-C
   ┌─────────┐
D13│         │VIN  ← External 5V+ (Red wire)
D12│         │GND  ← External 5V- (Black wire)
D11│         │RST
D10│         │5V
D9 │         │A7
D8 │         │A6
D7 │         │A5
D6 │         │A4
D5 │         │A3
D4 │         │A2
D3 │         │A1
D2 │         │A0   ← Solenoid + (Red wire)
GND│         │REF
RST│         │3V3
RX │         │D13
TX │         │D12
   └─────────┘
```

## Required Connections:

### 1. External 5V Power Supply:
```
Power Supply → Arduino Nano ESP32
Red (+5V)    → VIN pin (top right)
Black (GND)  → GND pin (top right, next to VIN)
```

### 2. Solenoid Connection:
```
Solenoid → Arduino Nano ESP32
+ wire   → D2 pin (GPIO 2, bottom left)
- wire   → GND pin (bottom left)
```

### 3. USB Connection (keep connected):
```
Computer → Arduino Nano ESP32
USB-C cable for programming and Serial Monitor
```

## Complete Wiring:
```
External 5V Power Supply
    +5V ────────────────→ VIN pin
    GND ────────────────→ GND pin (top)
                              │
USB Cable (keep connected)    │
Computer ←──→ Arduino         │
                              │
Solenoid                      │
    + wire ─────────────→ D2 pin (GPIO 2)
    - wire ─────────────→ GND pin (bottom) ←┘
```

## Power Requirements:
- **External 5V supply**: 1A minimum (2A recommended)
- **Voltage**: 5.0V ±0.2V (measure with multimeter)
- **USB power**: NOT sufficient for solenoid

## Expected Behavior:
- **GPIO 2 HIGH**: Solenoid pushes DOWN (creates raised braille dot)
- **GPIO 2 LOW**: Solenoid retracts UP (flat surface)
- **Status LED**: Blinks when waiting, solid when connected

## Safety Notes:
- ⚠️ **Never exceed 6V** on VIN pin
- ⚠️ **Check polarity** before connecting
- ⚠️ **Use external power** - USB alone won't work
- ✅ **Measure voltage** with multimeter first