# Power Supply Setup for Solenoid

## Why External Power is Required:
- **USB provides**: ~500mA maximum
- **Solenoid needs**: 300-500mA
- **Result**: USB can't power solenoid

## What You Need:
### Option 1: Wall Adapter (Easiest)
- **5V DC wall adapter**
- **1A (1000mA) or higher**
- **Barrel jack or bare wires**

### Option 2: Bench Power Supply
- Set to **5V DC**
- Current limit: **1A or higher**

## Connection Steps:

### Step 1: Identify Wires
- **Red wire** = Positive (+5V)
- **Black wire** = Negative (GND)
- Use multimeter to verify if unsure

### Step 2: Connect to Arduino
```
Power Supply → Arduino
Red (+5V)   → VIN pin
Black (GND) → GND pin
```

### Step 3: Connect Solenoid
```
Solenoid → Connection
+ wire   → GPIO 2 (through ULN2803 if using)
- wire   → GND (same as power supply GND)
```

## Safety Check:
1. **Measure voltage** with multimeter: should be 5.0V ±0.2V
2. **Check polarity**: + to +, - to -
3. **Start with Arduino disconnected**, verify voltage first

## Test Procedure:
1. **Connect external power** (Arduino off)
2. **Measure voltage** at VIN pin (should be ~5V)
3. **Connect USB** for programming/serial
4. **Upload solenoid test program**
5. **Watch for solenoid movement**

## If Solenoid Still Doesn't Move:

### Check These:
1. **Voltage**: Must be exactly 5V
2. **Current**: Power supply must provide 500mA+
3. **Connections**: All wires secure
4. **Solenoid type**: Must be push-type, not pull-type
5. **Polarity**: Try reversing solenoid wires

### Direct Test:
1. **Disconnect solenoid** from Arduino
2. **Connect directly** to 5V power supply
3. **Should activate immediately**
4. **If not, solenoid or power supply is bad**