# Arduino Uno R3 Braille Display - Connection Guide

## Arduino Uno R3 Pinout:
```
     USB
   ┌─────────┐
   │  POWER  │
   │ ┌─────┐ │
   │ │ USB │ │
   │ └─────┘ │
   │         │
   │ DIGITAL │
13 │ ●       │ ← Built-in LED
12 │ ●       │
11 │ ●       │
10 │ ●       │
 9 │ ●       │
 8 │ ●       │
 7 │ ●       │
 6 │ ●       │
 5 │ ●       │
 4 │ ●       │
 3 │ ●       │
 2 │ ●       │ ← Solenoid control
 1 │ ●       │
 0 │ ●       │
   │         │
   │ POWER   │
VIN│ ●       │ ← External 5V input
GND│ ●       │ ← Ground
5V │ ●       │
3V3│ ●       │
   │ ANALOG  │
A0 │ ●       │
A1 │ ●       │
A2 │ ●       │
A3 │ ●       │
A4 │ ●       │
A5 │ ●       │
   └─────────┘
```

## Required Connections:

### 1. External 5V Power Supply:
```
Power Supply → Arduino Uno R3
Red (+5V)    → VIN pin (power section)
Black (GND)  → GND pin (power section)
```

### 2. Solenoid Connection:
```
Solenoid → Arduino Uno R3
+ wire   → Digital pin 2
- wire   → GND pin (power section)
```

### 3. USB Connection (keep connected):
```
Computer → Arduino Uno R3
USB cable for programming and Serial Monitor
```

## Complete Wiring Diagram:
```
External 5V Power Supply
    +5V ────────────────→ VIN pin
    GND ────────────────→ GND pin
                              │
USB Cable (keep connected)    │
Computer ←──→ Arduino         │
                              │
Solenoid                      │
    + wire ─────────────→ Pin 2 (Digital)
    - wire ─────────────→ GND pin ←┘
```

## Key Differences from ESP32:
- ❌ **No Bluetooth** - Uses USB Serial communication
- ✅ **5V Logic** - Stronger signal for solenoids
- ✅ **Built-in LED** - Pin 13 for status indication
- ✅ **Standard pins** - Easier to connect

## Power Requirements:
- **External 5V supply**: 1A minimum (2A recommended)
- **Voltage**: 5.0V ±0.2V (measure with multimeter)
- **USB power**: NOT sufficient for solenoid

## Communication Method:
Since Arduino Uno R3 doesn't have Bluetooth, you'll control it via Serial Monitor:

### Commands:
- `char:a` - Display letter 'a'
- `word:hello` - Display word 'hello'
- `test` - Run test sequence
- `help` - Show all commands

## Expected Behavior:
- **Pin 2 HIGH**: Solenoid pushes DOWN (creates raised braille dot)
- **Pin 2 LOW**: Solenoid retracts UP (flat surface)
- **Pin 13 LED**: Shows status and activity

## Safety Notes:
- ⚠️ **Use external 5V power** - USB alone won't work
- ⚠️ **Check polarity** before connecting
- ⚠️ **Measure voltage** with multimeter first
- ✅ **Start simple** - test with one solenoid first