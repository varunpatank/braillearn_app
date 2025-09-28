# Arduino UNO R4 WiFi Braille Display Setup Guide

## ✅ **Your Hardware**: Arduino UNO R4 WiFi
- **Built-in Bluetooth** ✅ (No external module needed!)
- **Built-in WiFi** ✅
- **More powerful** than UNO R3
- **Same pin layout** as UNO R3

## 🔧 **Hardware Connections**

### **Solenoid Wiring** (matches your diagram):
```
Solenoid #1 → Pin 2 (Braille Dot 1)
Solenoid #2 → Pin 3 (Braille Dot 2)  
Solenoid #3 → Pin 4 (Braille Dot 3)
Solenoid #4 → Pin 5 (Braille Dot 4)
Solenoid #5 → Pin 6 (Braille Dot 5)
Solenoid #6 → Pin 7 (Braille Dot 6)
```

### **Power Requirements**:
- **External 5V power supply** (2A+ for 6 solenoids)
- **USB connection** for programming/serial monitor
- **Built-in status LED** on Pin 13

## 📱 **Software Setup**

### **1. Install Required Libraries**
In Arduino IDE, go to **Tools → Manage Libraries** and install:
- **WiFiS3** (should be pre-installed)
- **ArduinoBLE** (search and install)

### **2. Board Selection**
- **Board**: Arduino UNO R4 WiFi
- **Port**: Your COM port
- **Upload Speed**: 115200

### **3. Upload Code**
1. Upload `uno_r4_braille_display.ino`
2. Open Serial Monitor (115200 baud)
3. Should see startup messages and solenoid test

## 🔍 **Testing Your Setup**

### **Serial Commands** (type in Serial Monitor):
```
test        → Test all solenoids
pin1        → Test Pin 2 (Solenoid #1)
pin2        → Test Pin 3 (Solenoid #2)
pin3        → Test Pin 4 (Solenoid #3)
pin4        → Test Pin 5 (Solenoid #4)
pin5        → Test Pin 6 (Solenoid #5)
pin6        → Test Pin 7 (Solenoid #6)
char:a      → Display letter 'a'
word:hello  → Display word 'hello'
help        → Show all commands
```

### **Expected Results**:
- ✅ All 6 solenoids should activate during `test`
- ✅ Individual pins should work with `pin1` through `pin6`
- ✅ Status LED blinks when waiting, solid when connected

## 📡 **Bluetooth Connection**

### **Device Name**: `Braille_Display`
- No pairing required (BLE)
- Appears in web app's device list
- Built-in Bluetooth - no external module needed!

### **Web App Integration**:
1. Go to Hardware Setup page
2. Click "Connect Device"
3. Select "Braille_Display"
4. Test individual dots

## 🔧 **Troubleshooting**

### **Problem**: Only pins 2, 3, 4 work
**Solutions**:
1. **Check power supply** - need 2A+ for all 6 solenoids
2. **Test individual pins** with `pin4`, `pin5`, `pin6` commands
3. **Check wiring** on pins 5, 6, 7
4. **Measure voltage** at pins 5, 6, 7 (should be 5V when HIGH)

### **Problem**: Bluetooth not found
**Solutions**:
1. **Check Serial Monitor** - should show "Bluetooth initialized"
2. **Reset Arduino** and try again
3. **Use Chrome browser** (best BLE support)
4. **Check distance** - stay within 10 feet

### **Problem**: Wrong braille patterns
**Solutions**:
- ✅ **Fixed!** Code now uses correct standard braille patterns
- ✅ **Matches your layout** - Pin 2 = Dot 1, Pin 3 = Dot 2, etc.

## 🎯 **Advantages of UNO R4 WiFi**

### **vs UNO R3**:
- ✅ **Built-in Bluetooth** (no HC-05 module needed)
- ✅ **Built-in WiFi** (future expansion)
- ✅ **More memory** (better performance)
- ✅ **Same pins** (drop-in replacement)
- ✅ **Better power handling**

### **vs ESP32**:
- ✅ **Easier to use** (Arduino IDE native)
- ✅ **Better documentation**
- ✅ **Standard Arduino libraries**
- ✅ **More stable** for beginners

## 🚀 **Next Steps**

1. **Upload the code** and test with serial commands
2. **Verify all 6 solenoids work** with individual pin tests
3. **Connect via Bluetooth** from the web app
4. **Test braille patterns** - should now be correct!

Your UNO R4 WiFi is perfect for this project! 🎉