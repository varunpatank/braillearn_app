# Power Connection Guide

## What You Need:
Since your solenoid works with direct 5V, now we need to let Arduino control it with external power.

## Connection Setup:

### Step 1: Keep USB Connected
- **USB cable** → **Computer** (for programming and Serial Monitor)
- This provides power to the Arduino logic

### Step 2: Add External 5V Power
- **External 5V supply +** → **Arduino VIN pin**
- **External 5V supply -** → **Arduino GND pin**

### Step 3: Connect Solenoid to Arduino
- **Solenoid + wire** → **Arduino GPIO 2**
- **Solenoid - wire** → **Arduino GND pin**

## Wiring Diagram:
```
External 5V Power Supply
    +5V ────────────────→ Arduino VIN
    GND ────────────────→ Arduino GND
                              │
USB Cable                     │
Computer ←──→ Arduino         │
                              │
Solenoid                      │
    + wire ─────────────→ GPIO 2
    - wire ─────────────→ GND ←┘
```

## Why This Works:
- **USB power**: Runs Arduino logic (3.3V)
- **External 5V**: Powers the solenoid (5V, high current)
- **Arduino GPIO 2**: Controls when solenoid gets power
- **Shared GND**: Completes the circuit

## Test Procedure:
1. **Upload** `external_power_test.ino`
2. **Connect external 5V** to VIN and GND
3. **Connect solenoid** to GPIO 2 and GND
4. **Watch Serial Monitor** for instructions
5. **Look for solenoid movement** every few seconds

## Expected Result:
- Solenoid should **PUSH DOWN** when GPIO 2 goes HIGH
- Solenoid should **RETRACT UP** when GPIO 2 goes LOW
- Movement should be **strong and definite**
- Serial Monitor should show test messages

## If It Still Doesn't Work:
1. **Check connections** - all wires secure?
2. **Measure voltage** at VIN pin (should be ~5V)
3. **Try reversing** solenoid wires
4. **Check GND connection** between power supply and Arduino