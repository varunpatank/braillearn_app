# Power Supply Specifications for Single Solenoid

## Minimum Requirements:
- **Voltage**: 5V DC (±0.2V tolerance)
- **Current**: 1A (1000mA) minimum
- **Type**: Switching power supply (wall adapter)
- **Connector**: Barrel jack or bare wires

## Recommended Power Supplies:

### Budget Option (~$8):
- **Search**: "5V 2A wall adapter"
- **Specs**: 5V DC, 2A output
- **Connector**: 2.1mm barrel jack or bare wires
- **Example**: Generic 5V 2A switching adapter

### Quality Option (~$15):
- **Search**: "5V 3A power supply"
- **Specs**: 5V DC, 3A output, regulated
- **Features**: Over-current protection
- **Future**: Can power up to 6 solenoids

## Connection Methods:

### Method 1: Bare Wires (Recommended)
1. **Cut off** the barrel connector
2. **Strip** the wires (usually red=+, black=-)
3. **Test with multimeter** to verify polarity
4. **Connect directly** to Arduino VIN and GND

### Method 2: Barrel Jack Adapter
1. **Use barrel jack to screw terminals**
2. **Connect wires** to screw terminals
3. **Plug into** power supply

## Safety Checklist:
- ✅ **Measure voltage** before connecting (5.0V ±0.2V)
- ✅ **Check polarity** with multimeter
- ✅ **Start with Arduino off** when connecting power
- ✅ **Never exceed 6V** on VIN pin
- ✅ **Use fuse** if available (1A fast-blow)

## Power Supply Test:
```arduino
// Test if power supply is adequate
void testPowerSupply() {
  // Measure voltage at VIN pin
  // Should be 5.0V ±0.2V
  
  // Activate solenoid
  digitalWrite(2, HIGH);
  // Voltage should not drop below 4.8V
  
  // If voltage drops significantly:
  // - Power supply is inadequate
  // - Connections have high resistance
  // - Solenoid draws too much current
}
```

## Common Issues:

### Voltage Too Low (< 4.8V):
- **Cause**: Inadequate power supply
- **Solution**: Use higher current rating (2A+)

### Voltage Too High (> 5.2V):
- **Cause**: Unregulated power supply
- **Solution**: Use regulated switching supply

### Voltage Drops Under Load:
- **Cause**: Insufficient current capacity
- **Solution**: Upgrade to 2A+ power supply

### No Voltage at VIN:
- **Cause**: Wrong polarity or bad connection
- **Solution**: Check wiring with multimeter

## Where to Buy:
- **Amazon**: Search "5V 2A power supply"
- **Electronics stores**: Regulated DC adapters
- **Arduino suppliers**: Compatible power supplies
- **Local**: Electronics/computer stores

## Future Expansion:
This power supply setup will work for expanding to 6 solenoids later. Just connect additional solenoids to GPIO pins 3-7.