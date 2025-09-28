# Arduino UNO R3 Braille Display - Wiring Diagram

## Complete Circuit Diagram

```
                    12V Power Supply
                         │
                    ┌────┴────┐
                    │ +12V    │ GND
                    │         │
                    │    ┌────┴─────────────────────────────┐
                    │    │                                  │
                    │    │  Breadboard Ground Rail          │
                    │    │  ════════════════════════════    │
                    │    │                                  │
                    │    │                                  │
                    │    │  Breadboard +12V Rail            │
                    │    │  ████████████████████████████    │
                    │    │                                  │
                    └────┤                                  │
                         │                                  │
                         │                                  │
                    Arduino UNO R3                          │
                    ┌─────────────┐                         │
                    │             │                         │
                    │ Digital I/O │                         │
                 13 │ ●           │ ← Built-in LED          │
                 12 │ ●           │                         │
                 11 │ ●           │                         │
                 10 │ ●           │                         │
                  9 │ ●           │                         │
                  8 │ ●───────────┼─── Push Button ────────┤
                  7 │ ●───┐       │                         │
                  6 │ ●───┼───┐   │                         │
                  5 │ ●───┼───┼─┐ │                         │
                  4 │ ●───┼───┼─┼┐│                         │
                  3 │ ●───┼───┼─┼┼│                         │
                  2 │ ●───┼───┼─┼┼┼                         │
                  1 │ ●   │   │ │││                         │
                  0 │ ●   │   │ │││                         │
                    │     │   │ │││                         │
                    │Power│   │ │││                         │
                VIN │ ●   │   │ │││                         │
                GND │ ●───┼───┼─┼┼┼─────────────────────────┤
                 5V │ ●   │   │ │││                         │
                3V3 │ ●   │   │ │││                         │
                    └─────┼───┼─┼┼┼─────────────────────────┘
                          │   │ │││
                          │   │ │││
                    ┌─────┴─┐ │ │││
                    │MOSFET1│ │ │││
                    │ G D S │ │ │││
                    │ │ │ │ │ │ │││
                    │ │ │ └─┼─┼─┼┼┼─── To Ground Rail
                    │ │ │   │ │ │││
                    │ │ └───┼─┼─┼┼┼─── To Solenoid 1 (-)
                    │ │     │ │ │││
                    │ └─────┘ │ │││
                    │         │ │││
                    │ ┌───────┴─┼─┼┼┼─── Diode 1
                    │ │ ┌───────┼─┼┼┼─── (Cathode to +12V)
                    │ │ │       │ │││
                    │ │ │ ┌─────┴─┼┼┼─── Solenoid 1 (+) to +12V Rail
                    │ │ │ │       │││
                    │ │ │ │ ┌─────┴┼┼─── MOSFET 2 (same pattern)
                    │ │ │ │ │      ││
                    │ │ │ │ │ ┌────┴┼─── MOSFET 3 (same pattern)
                    │ │ │ │ │ │     │
                    │ │ │ │ │ │ ┌───┴─── MOSFET 4 (same pattern)
                    │ │ │ │ │ │ │
                    │ │ │ │ │ │ │ ┌───── MOSFET 5 (same pattern)
                    │ │ │ │ │ │ │ │
                    │ │ │ │ │ │ │ │ ┌─── MOSFET 6 (same pattern)
                    │ │ │ │ │ │ │ │ │
                    └─┴─┴─┴─┴─┴─┴─┴─┴─── All connected to ground rail
```

## Individual MOSFET Circuit (Repeat 6 times)

```
Arduino Pin X ────┐
                  │
                  ▼
              ┌───────┐
              │MOSFET │
              │   G   │ ← Gate (from Arduino)
              │   │   │
              │   D   │ ← Drain (to solenoid -)
              │   │   │
              │   S   │ ← Source (to ground)
              └───┼───┘
                  │
                  ▼
            Ground Rail ═══════════════════════════
                  
                  
    +12V Rail ████████████████████████████████████
                  │                    │
                  │                    │
              ┌───▼───┐              ┌─▼─┐
              │ SOL + │              │ D │ ← Flyback Diode
              │       │              │ I │   (Cathode to +12V)
              │ SOL - │◄─────────────┤ O │   (Anode to Drain)
              └───────┘              │ D │
                                     └─▲─┘
                                       │
                              To MOSFET Drain
```

## Pin Assignment Table

| Arduino Pin | MOSFET | Solenoid | Braille Dot | Position |
|-------------|--------|----------|-------------|----------|
| Pin 2       | MOSFET 1 | Solenoid 1 | Dot 1 | Top Left |
| Pin 3       | MOSFET 2 | Solenoid 2 | Dot 2 | Middle Left |
| Pin 4       | MOSFET 3 | Solenoid 3 | Dot 3 | Bottom Left |
| Pin 5       | MOSFET 4 | Solenoid 4 | Dot 4 | Top Right |
| Pin 6       | MOSFET 5 | Solenoid 5 | Dot 5 | Middle Right |
| Pin 7       | MOSFET 6 | Solenoid 6 | Dot 6 | Bottom Right |
| Pin 8       | -        | -          | -     | Push Button |
| Pin 13      | -        | -          | -     | Status LED |

## Physical Layout on Breadboard

```
Breadboard Layout (Top View):

+12V Rail: ████████████████████████████████████████████████████████
           │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │
           a  b  c  d  e  f  g  h  i  j  k  l  m  n  o  p  q  r  s
        ┌──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┐
     1  │                                                        │
     2  │  M1    M2    M3    M4    M5    M6                      │
     3  │  G D S G D S G D S G D S G D S G D S                   │
     4  │  │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │                   │
     5  │  │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │                   │
     6  │  │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │                   │
     7  │  │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │                   │
     8  │  │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │                   │
     9  │  │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │                   │
    10  │  │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │                   │
        └──┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼───────────────────┘
           │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │
GND Rail:  ═══════════════════════════════════════════════════════
           │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │
           2 3 4 5 6 7 │ │ │ │ │ │ │ │ │ │ │ │
                       │ │ │ │ │ │ │ │ │ │ │ │
                       To Solenoids and Diodes

Legend:
M1-M6 = MOSFETs 1-6
G = Gate, D = Drain, S = Source
Numbers 2-7 = Arduino pins
```

## Connection Checklist

### Power Connections:
- [ ] 12V power supply red (+) → Breadboard +12V rail
- [ ] 12V power supply black (-) → Breadboard GND rail
- [ ] Arduino GND pin → Breadboard GND rail
- [ ] Measure 12V between power rails with multimeter

### MOSFET Connections (for each of 6 MOSFETs):
- [ ] MOSFET Gate → Arduino pin (2, 3, 4, 5, 6, or 7)
- [ ] MOSFET Source → Breadboard GND rail
- [ ] MOSFET Drain → Solenoid negative (-) wire

### Solenoid Connections (for each of 6 solenoids):
- [ ] Solenoid positive (+) → Breadboard +12V rail
- [ ] Solenoid negative (-) → MOSFET Drain

### Flyback Diode Connections (for each of 6 solenoids):
- [ ] Diode cathode (stripe end) → Breadboard +12V rail
- [ ] Diode anode (plain end) → MOSFET Drain (same as solenoid -)

### Button Connection:
- [ ] Button terminal 1 → Arduino Pin 8
- [ ] Button terminal 2 → Breadboard GND rail

### Final Checks:
- [ ] No short circuits between +12V and GND
- [ ] All MOSFETs oriented correctly (check datasheet)
- [ ] All diodes oriented correctly (stripe toward +12V)
- [ ] All connections tight and secure
- [ ] Multimeter reads 12V between power rails
- [ ] Arduino powers up and shows startup messages

## Safety Reminders:
- ⚠️ **Double-check all connections** before applying power
- ⚠️ **Verify polarity** of power supply, solenoids, and diodes
- ⚠️ **Use multimeter** to confirm voltages before connecting Arduino
- ⚠️ **Start with one solenoid** to test before connecting all 6