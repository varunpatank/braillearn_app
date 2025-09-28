import React, { useState, useEffect } from 'react';
import { 
  Usb, RefreshCw, AlertCircle, CheckCircle, 
  HardDrive, X, HelpCircle, Bluetooth, Play, Square, ArrowDown, ArrowUp 
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const HardwareSetupPage: React.FC = () => {
  const { isArduinoConnected, connectArduino, disconnectArduino, sendBraillePattern } = useAppContext();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'setup' | 'test' | 'troubleshoot'>('setup');
  const [testRunning, setTestRunning] = useState(false);
  const [currentTestDot, setCurrentTestDot] = useState<number | null>(null);

  useEffect(() => {
    document.title = 'Hardware Setup - BrailleLearn';
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const success = await connectArduino();
      
      if (success) {
        setSuccessMessage('Successfully connected to Arduino Braille Display');
      } else {
        setError('Failed to connect to Arduino. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during connection. Please ensure Bluetooth is enabled.');
      console.error('Connection error:', err);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectArduino();
    setSuccessMessage('Device disconnected successfully');
    setTestRunning(false);
    setCurrentTestDot(null);
  };

  // Test individual dots - sends correct format to Arduino
  const testSingleDot = async (dotNumber: number) => {
    if (!isArduinoConnected) return;
    
    setCurrentTestDot(dotNumber);
    try {
      // Send array of dot numbers - Arduino expects this format
      console.log(`Testing dot ${dotNumber} - sending pattern:`, [dotNumber]);
      await sendBraillePattern([dotNumber]);
      
      // Clear the dot after 1.2 seconds
      setTimeout(async () => {
        try {
          console.log('Clearing all dots - sending empty pattern');
          await sendBraillePattern([]);
          setCurrentTestDot(null);
        } catch (error) {
          console.error('Error clearing dot:', error);
        }
      }, 1200);
    } catch (error) {
      console.error(`Error testing dot ${dotNumber}:`, error);
      setError(`Failed to test dot ${dotNumber}`);
    }
  };

  // Run sequential test of all dots
  const runSequentialTest = async () => {
    if (!isArduinoConnected || testRunning) return;
    
    setTestRunning(true);
    setError(null);
    
    try {
      // Test each dot sequentially
      for (let dot = 1; dot <= 6; dot++) {
        setCurrentTestDot(dot);
        console.log(`Sequential test: Testing dot ${dot}`);
        await sendBraillePattern([dot]);
        
        // Wait 1 second before next dot
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Clear the dot
        await sendBraillePattern([]);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Test all dots together
      setCurrentTestDot(0); // Special indicator for "all dots"
      console.log('Sequential test: Testing all dots together');
      await sendBraillePattern([1, 2, 3, 4, 5, 6]);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Clear all
      await sendBraillePattern([]);
      setSuccessMessage('Sequential test completed successfully!');
      
    } catch (error) {
      console.error('Sequential test error:', error);
      setError('Sequential test failed. Check your connections.');
    } finally {
      setTestRunning(false);
      setCurrentTestDot(null);
    }
  };

  // Stop any running test
  const stopTest = async () => {
    setTestRunning(false);
    setCurrentTestDot(null);
    if (isArduinoConnected) {
      try {
        await sendBraillePattern([]);
      } catch (error) {
        console.error('Error stopping test:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 braille-bg">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-700 to-primary-800 text-white py-12 relative">
        <div className="absolute inset-0 braille-bg opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-3xl font-bold leading-tight mb-4">
            Hardware Setup & Testing
          </h1>
          <p className="text-lg text-primary-100">
            Connect and test your Arduino Braille Display device
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 mt-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isArduinoConnected ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <HardDrive size={32} className={
                  isArduinoConnected ? 'text-green-600' : 'text-gray-500'
                } />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Arduino Braille Display
                </h2>
                <div className="flex items-center mt-1">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    isArduinoConnected ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className={isArduinoConnected ? 'text-green-700' : 'text-red-600'}>
                    {isArduinoConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              {isArduinoConnected ? (
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <X size={16} className="mr-2" />
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={connecting}
                  className={`px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 flex items-center ${
                    connecting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {connecting ? (
                    <>
                      <RefreshCw size={16} className="mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Bluetooth size={16} className="mr-2" />
                      Connect Device
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          
          {/* Status Messages */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
              <AlertCircle size={18} className="mt-0.5 mr-2 flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}
          
          {successMessage && (
            <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-start">
              <CheckCircle size={18} className="mt-0.5 mr-2 flex-shrink-0" />
              <div>{successMessage}</div>
            </div>
          )}
        </div>
        
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('setup')}
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'setup' 
                    ? 'border-b-2 border-blue-600 text-blue-600' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Setup Guide
              </button>
              <button
                onClick={() => setActiveTab('test')}
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'test' 
                    ? 'border-b-2 border-blue-600 text-blue-600' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Test Device
              </button>
              <button
                onClick={() => setActiveTab('troubleshoot')}
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'troubleshoot' 
                    ? 'border-b-2 border-blue-600 text-blue-600' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Troubleshooting
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'setup' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Setting up your Arduino Braille Display
                </h3>
                
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                    <ArrowDown className="mr-2" size={20} />
                    Important: Solenoid Direction
                  </h4>
                  <p className="text-sm text-blue-700">
                    When activated, solenoids should <strong>push DOWN</strong> (extend) to create raised braille dots. 
                    When deactivated, they should <strong>retract UP</strong> to create a flat surface.
                  </p>
                </div>
                
                <div className="space-y-6">
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                      1
                    </div>
                    <div className="ml-4">
                      <h4 className="text-base font-medium text-gray-900">Prepare your Arduino</h4>
                      <p className="mt-1 text-sm text-gray-600">
                        Ensure your Arduino ESP32 is powered on and the firmware is correctly installed.
                        The status LED should blink once per second when ready to connect.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                      2
                    </div>
                    <div className="ml-4">
                      <h4 className="text-base font-medium text-gray-900">Connect Push-Down Solenoids</h4>
                      <p className="mt-1 text-sm text-gray-600">
                        Connect your push-type solenoids to GPIO pins 2-7. When HIGH signal is sent, 
                        solenoids should extend downward. When LOW, they should retract upward.
                      </p>
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-800">
                          <strong>Single Solenoid Testing:</strong> Connect one solenoid to GPIO 2 (Dot 1). 
                          Verify it pushes DOWN when activated and retracts UP when deactivated.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                      3
                    </div>
                    <div className="ml-4">
                      <h4 className="text-base font-medium text-gray-900">Test Solenoid Direction</h4>
                      <p className="mt-1 text-sm text-gray-600">
                        Before connecting to the app, manually test that your solenoids push down when 5V is applied 
                        and retract when power is removed. This is critical for proper braille dot formation.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                      4
                    </div>
                    <div className="ml-4">
                      <h4 className="text-base font-medium text-gray-900">Connect via Bluetooth</h4>
                      <p className="mt-1 text-sm text-gray-600">
                        Click "Connect Device" and select "Braille_Display" from the Bluetooth list. 
                        The status LED should stay solid when connected.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h4 className="text-base font-medium text-gray-900 mb-2">Expected Solenoid Behavior</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <ArrowDown className="text-green-600 mr-2" size={20} />
                        <span className="text-sm text-gray-700">
                          <strong>Active (HIGH):</strong> Solenoid pushes DOWN
                        </span>
                      </div>
                      <div className="flex items-center">
                        <ArrowUp className="text-red-600 mr-2" size={20} />
                        <span className="text-sm text-gray-700">
                          <strong>Inactive (LOW):</strong> Solenoid retracts UP
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'test' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Test Your Braille Display
                </h3>
                
                {isArduinoConnected ? (
                  <div>
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Testing Instructions</h4>
                      <p className="text-sm text-blue-700">
                        {currentTestDot ? (
                          currentTestDot === 0 ? 
                            'Testing all dots simultaneously - all solenoids should push DOWN...' :
                            `Testing Dot ${currentTestDot}. ${currentTestDot === 1 ? 'Your solenoid should push DOWN and create a raised dot' : 'This dot is not physically connected - no movement expected'}.`
                        ) : (
                          'Click individual dot buttons to test specific positions. Connected solenoids will push DOWN when activated.'
                        )}
                      </p>
                    </div>

                    {/* Individual Dot Testing */}
                    <div className="mb-8">
                      <h4 className="text-base font-medium text-gray-900 mb-4">Individual Dot Testing</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Click each button to test individual braille dots. 
                        {' '}
                        <span className="font-medium text-blue-600">
                          Dot 1 will physically push DOWN if connected to GPIO 2.
                        </span>
                      </p>
                      
                      <div className="flex justify-center mb-6">
                        <div className="grid grid-cols-2 grid-rows-3 gap-3 w-40 h-60 p-4 border-2 border-gray-300 rounded-lg bg-gray-50">
                          {[1, 4, 2, 5, 3, 6].map((dotNumber, index) => (
                            <button
                              key={dotNumber}
                              className={`rounded-full font-medium flex items-center justify-center text-white transition-all relative ${
                                currentTestDot === dotNumber
                                  ? 'bg-red-500 animate-pulse scale-110'
                                  : dotNumber === 1
                                  ? 'bg-blue-600 hover:bg-blue-700'
                                  : 'bg-gray-400 hover:bg-gray-500'
                              }`}
                              onClick={() => testSingleDot(dotNumber)}
                              disabled={testRunning}
                              title={dotNumber === 1 ? 'Connected solenoid - will push DOWN' : 'Not physically connected'}
                            >
                              {dotNumber}
                              {dotNumber === 1 && (
                                <ArrowDown className="absolute -bottom-1 -right-1 w-3 h-3" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-center text-sm text-gray-500 mb-4">
                        <span className="inline-flex items-center">
                          <span className="w-3 h-3 bg-blue-600 rounded-full mr-2"></span>
                          <ArrowDown size={12} className="mr-1" />
                          Physical solenoid (pushes DOWN)
                        </span>
                        <span className="inline-flex items-center ml-4">
                          <span className="w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
                          Software simulation only
                        </span>
                      </div>
                    </div>

                    {/* Sequential Testing */}
                    <div className="mb-6">
                      <h4 className="text-base font-medium text-gray-900 mb-4">Sequential Testing</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Run an automated test that activates each dot in sequence. Watch for the DOWN movement on Dot 1.
                      </p>
                      
                      <div className="flex justify-center space-x-3">
                        {!testRunning ? (
                          <button
                            onClick={runSequentialTest}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                          >
                            <Play size={20} className="mr-2" />
                            Start Sequential Test
                          </button>
                        ) : (
                          <button
                            onClick={stopTest}
                            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                          >
                            <Square size={20} className="mr-2" />
                            Stop Test
                          </button>
                        )}
                        
                        <button
                          onClick={() => sendBraillePattern([])}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
                          disabled={testRunning}
                        >
                          <ArrowUp size={16} className="mr-2" />
                          Retract All
                        </button>
                      </div>
                    </div>

                    {/* Test Status */}
                    {testRunning && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <RefreshCw size={20} className="text-yellow-600 animate-spin mr-2" />
                          <span className="text-yellow-800">
                            Sequential test in progress... 
                            {currentTestDot && currentTestDot !== 0 && ` Testing Dot ${currentTestDot} (should push DOWN)`}
                            {currentTestDot === 0 && ' Testing all dots (all should push DOWN)'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Usb size={28} className="text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-4">
                      Please connect your Arduino device to test its functionality
                    </p>
                    <button
                      onClick={handleConnect}
                      className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700"
                    >
                      Connect Now
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'troubleshoot' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Troubleshooting Guide
                </h3>
                
                <div className="space-y-6">
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <h4 className="font-medium text-gray-900 flex items-center">
                        <ArrowDown className="mr-2 text-red-600" size={20} />
                        Solenoid pushes UP instead of DOWN
                      </h4>
                    </div>
                    <div className="p-4">
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                        <li><strong>Reverse the solenoid connections:</strong> Swap the positive and negative wires</li>
                        <li><strong>Check solenoid type:</strong> Ensure you're using push-type solenoids, not pull-type</li>
                        <li><strong>Verify ULN2803 wiring:</strong> Make sure the solenoid is connected to the OUTPUT side (pins 11-18)</li>
                        <li><strong>Test with multimeter:</strong> Verify that HIGH signal from ESP32 creates 5V at solenoid</li>
                        <li><strong>Check power supply polarity:</strong> Ensure 5V and GND are correctly connected</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <h4 className="font-medium text-gray-900">
                        Solenoid not moving at all
                      </h4>
                    </div>
                    <div className="p-4">
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                        <li>Verify the solenoid is connected to GPIO 2 (corresponds to Dot 1)</li>
                        <li>Check that the ULN2803 is properly powered (5V to pin 10, GND to pin 9)</li>
                        <li>Ensure the solenoid power supply can provide enough current (typically 200-500mA per solenoid)</li>
                        <li>Test the solenoid directly with 5V to verify it's working</li>
                        <li>Check all wiring connections are secure</li>
                        <li>Use a multimeter to verify voltage at the solenoid terminals when activated</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <h4 className="font-medium text-gray-900">
                        Solenoid moves weakly or slowly
                      </h4>
                    </div>
                    <div className="p-4">
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                        <li><strong>Insufficient power:</strong> Use a dedicated 5V power supply with adequate current rating</li>
                        <li><strong>Voltage drop:</strong> Check that voltage at solenoid is close to 5V when activated</li>
                        <li><strong>Add capacitors:</strong> Place a large capacitor (1000μF+) across power rails for current spikes</li>
                        <li><strong>Check connections:</strong> Ensure all connections are tight and low-resistance</li>
                        <li><strong>Solenoid specifications:</strong> Verify solenoid is rated for 5V operation</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <h4 className="font-medium text-gray-900">
                        Device not appearing in Bluetooth list
                      </h4>
                    </div>
                    <div className="p-4">
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                        <li>Ensure the Arduino is powered on and the firmware is installed correctly</li>
                        <li>Check that the status LED is blinking (indicating it's in discovery mode)</li>
                        <li>Restart the Arduino device by pressing the reset button</li>
                        <li>Make sure you're using a compatible browser (Chrome recommended)</li>
                        <li>Try moving closer to the device, as Bluetooth has a limited range</li>
                        <li>Clear your browser's Bluetooth cache and try again</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4 flex">
                  <HelpCircle size={20} className="text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-800 mb-1">Need more help?</h4>
                    <p className="text-sm text-blue-700">
                      Remember: Solenoids should <strong>push DOWN</strong> when activated and <strong>retract UP</strong> when deactivated. 
                      This creates the raised dots needed for braille reading. Check the complete wiring diagram in the About page 
                      for detailed connection instructions.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HardwareSetupPage;