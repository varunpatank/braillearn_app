# Arduino UNO R4 WiFi Troubleshooting Guide

## 🎯 **Your Specific Issue**: Only pins 2, 3, 4 work

### **Quick Test Commands**:
Upload the code and try these in Serial Monitor:
```
pin1    → Should activate Solenoid #1 (Pin 2)
pin2    → Should activate Solenoid #2 (Pin 3)  
pin3    → Should activate Solenoid #3 (Pin 4)
pin4    → Should activate Solenoid #4 (Pin 5) ← Test this!
pin5    → Should activate Solenoid #5 (Pin 6) ← Test this!
pin6    → Should activate Solenoid #6 (Pin 7) ← Test this!
```

## 🔍 **Diagnostic Steps**

### **Step 1: Power Supply Check**
**Most Common Cause**: Insufficient power for pins 5, 6, 7

**Test**:
1. Measure voltage at Pin 5 when running `pin4` command
2. Should read 5V when HIGH, 0V when LOW
3. If voltage drops below 4.5V → Power supply problem

**Solution**: Use 2A+ external 5V power supply

### **Step 2: Individual Pin Voltage Test**
**Test each pin with multimeter**:
```
Run: pin4    → Measure Pin 5 voltage (should be 5V)
Run: pin5    → Measure Pin 6 voltage (should be 5V)  
Run: pin6    → Measure Pin 7 voltage (should be 5V)
```

**If voltage is correct but solenoid doesn't move**:
- Solenoid is faulty
- Wiring issue
- Driver circuit problem

### **Step 3: Solenoid Direct Test**
**Bypass Arduino completely**:
1. Disconnect solenoids 4, 5, 6 from Arduino
2. Connect directly to 5V power supply
3. Should activate immediately
4. If not → Solenoids are faulty

### **Step 4: Wiring Verification**
**Check connections**:
- Pin 5 → Solenoid #4 positive
- Pin 6 → Solenoid #5 positive  
- Pin 7 → Solenoid #6 positive
- All solenoid negatives → GND

## ⚡ **Power Supply Solutions**

### **Current Requirements**:
- **Each solenoid**: ~300-500mA
- **6 solenoids**: 1.8-3A total
- **Arduino**: ~50mA
- **Total needed**: 2-3A minimum

### **Recommended Power Supplies**:
1. **5V 3A switching adapter** (~$10-15)
2. **5V 5A power supply** (~$15-20) 
3. **Bench power supply** set to 5V, 3A limit

### **Connection**:
```
Power Supply +5V → Arduino VIN pin
Power Supply GND → Arduino GND pin
Keep USB connected for programming/serial
```

## 🔧 **UNO R4 WiFi Specific Issues**

### **Library Problems**:
**Error**: "WiFiS3.h not found"
**Solution**: Update Arduino IDE to latest version (2.0+)

**Error**: "ArduinoBLE.h not found"  
**Solution**: Install ArduinoBLE library via Library Manager

### **Bluetooth Issues**:
**Problem**: Device not found
**Solutions**:
1. Check Serial Monitor shows "Bluetooth initialized"
2. Reset Arduino and try again
3. Use Chrome browser (best BLE support)
4. Stay within 10 feet of Arduino

### **Upload Issues**:
**Problem**: Upload fails
**Solutions**:
1. Press reset button before upload
2. Select correct board: "Arduino UNO R4 WiFi"
3. Try different USB cable
4. Check COM port selection

## 📊 **Expected Test Results**

### **Working System**:
```
pin1 → ✅ Solenoid #1 activates (Pin 2)
pin2 → ✅ Solenoid #2 activates (Pin 3)
pin3 → ✅ Solenoid #3 activates (Pin 4)
pin4 → ✅ Solenoid #4 activates (Pin 5)
pin5 → ✅ Solenoid #5 activates (Pin 6)
pin6 → ✅ Solenoid #6 activates (Pin 7)
```

### **Your Current Issue**:
```
pin1 → ✅ Works (Pin 2)
pin2 → ✅ Works (Pin 3)
pin3 → ✅ Works (Pin 4)
pin4 → ❌ Doesn't work (Pin 5)
pin5 → ❌ Doesn't work (Pin 6)
pin6 → ❌ Doesn't work (Pin 7)
```

## 🎯 **Most Likely Solutions**

### **1. Power Supply Upgrade** (90% chance this fixes it)
- Current supply can't handle 6 solenoids
- Pins 5, 6, 7 don't get enough power
- **Fix**: Use 2A+ external 5V supply

### **2. Wiring Check** (5% chance)
- Loose connections on pins 5, 6, 7
- **Fix**: Re-check all connections

### **3. Faulty Solenoids** (5% chance)
- Solenoids 4, 5, 6 are broken
- **Fix**: Test with direct 5V, replace if needed

## 🚀 **Quick Fix Test**

**Try this right now**:
1. Upload the UNO R4 code
2. Open Serial Monitor (115200 baud)
3. Type: `pin4` and press Enter
4. **If Pin 5 shows 5V but solenoid doesn't move** → Solenoid problem
5. **If Pin 5 shows 0V or low voltage** → Power supply problem

**Report back which pins work with the new code!**