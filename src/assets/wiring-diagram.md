# Braille Display Wiring Layout (Horizontal)

Power Rails:
+ ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━● (Row A)
- ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━● (Row J)

Component Placement (Columns shown):
                                    
   ESP32 (Col 1-10)    ULN2803 (Col 20-25)    Solenoids (Col 35-50)
   ┌──────────┐        ┌──────────┐            S1  S2  S3
   │          │        │1      18 │            ↓   ↓   ↓  ← PUSH DOWN when active
   │    ▢     │        │2      17 │            ║   ║   ║
   │          │        │3      16 │            S4  S5  S6
   └──────────┘        │4      15 │            ↓   ↓   ↓  ← PUSH DOWN when active
                       │5      14 │            ║   ║   ║
                       │6      13 │            
                       │7      12 │            Note: Solenoids arranged in 2 rows
                       │8      11 │                  Push DOWN when HIGH signal
                       │9      10 │                  Retract UP when LOW signal
                       └──────────┘            

Connections:
1. ESP32 GPIO pins (2-7) → ULN2803 inputs (1-6)
   - GPIO2 → Pin 1 (Col 20) [Controls Dot 1 - PUSH DOWN when HIGH]
   - GPIO3 → Pin 2 (Col 21) [Controls Dot 2 - PUSH DOWN when HIGH]
   - GPIO4 → Pin 3 (Col 22) [Controls Dot 3 - PUSH DOWN when HIGH]
   - GPIO5 → Pin 4 (Col 23) [Controls Dot 4 - PUSH DOWN when HIGH]
   - GPIO6 → Pin 5 (Col 24) [Controls Dot 5 - PUSH DOWN when HIGH]
   - GPIO7 → Pin 6 (Col 25) [Controls Dot 6 - PUSH DOWN when HIGH]

2. ULN2803 outputs (13-18) → Solenoids (PUSH-DOWN TYPE)
   - Pin 18 → Solenoid 1 positive (Col 35) [Dot 1 - Top Left]
   - Pin 17 → Solenoid 2 positive (Col 40) [Dot 2 - Middle Left]
   - Pin 16 → Solenoid 3 positive (Col 45) [Dot 3 - Bottom Left]
   - Pin 15 → Solenoid 4 positive (Col 50) [Dot 4 - Top Right]
   - Pin 14 → Solenoid 5 positive (Col 45) [Dot 5 - Middle Right]
   - Pin 13 → Solenoid 6 positive (Col 40) [Dot 6 - Bottom Right]

3. Power Connections
   - ULN2803 Pin 9 → Ground rail (Row J)
   - ULN2803 Pin 10 → 5V rail (Row A) [CRITICAL: Adequate current supply needed]
   - All solenoids negative → Ground rail (Row J)
   - ESP32 GND → Ground rail (Row J)
   - ESP32 VIN → 5V rail (Row A)

4. Solenoid Behavior (IMPORTANT):
   - HIGH signal (5V) → Solenoid EXTENDS/PUSHES DOWN (creates raised braille dot)
   - LOW signal (0V) → Solenoid RETRACTS/PULLS UP (creates flat surface)

Legend:
● Power Rails    ║ Solenoid    ─ Wire Connection    ↓ Push Down Direction
▢ ESP32 Module   └┐ Component Outline

Notes:
1. Use PUSH-TYPE solenoids that extend downward when powered
2. Ensure 5V power supply can handle 6 × 300-500mA = 1.8-3A total current
3. Add 1000μF+ capacitor between power rails for current spike handling
4. Test individual solenoids: 5V should make them push DOWN
5. If solenoid pushes UP instead of DOWN, reverse the connections
6. ULN2803 inverts signals: ESP32 HIGH → ULN2803 output LOW → Solenoid gets 5V
7. Keep wires neat and grouped by function
8. Verify each solenoid pushes down ~2-3mm when activated

Power Requirements:
- Voltage: 5V DC (regulated)
- Current: 2-3A minimum (for 6 solenoids)
- Recommended: 5V/5A switching power supply
- Add large capacitor (1000-2200μF) for current spikes