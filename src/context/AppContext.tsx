
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback
} from 'react';
import { User, LessonProgress } from '../types/types';

interface AppContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoggedIn: boolean;
  lessonProgress: LessonProgress[];
  updateLessonProgress: (lessonId: string, completed: boolean, score?: number) => void;
  isArduinoConnected: boolean;
  connectArduino: () => Promise<boolean>;
  disconnectArduino: () => void;
  sendBraillePattern: (dots: number[]) => Promise<boolean>;
}

const AppContext = createContext<AppContextProps>({
  lessonProgress: [],
  updateLessonProgress: () => {},
  isArduinoConnected: false,
  connectArduino: async () => false,
  disconnectArduino: () => {},
  sendBraillePattern: async () => false,
});

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [isArduinoConnected, setIsArduinoConnected] = useState(false);

  const [bluetoothDevice, setBluetoothDevice] = useState<BluetoothDevice | null>(null);
  const [characteristic, setCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | null>(null);
  
  const [sendQueue, setSendQueue] = useState<Array<{ dots: number[]; resolve: (value: boolean) => void; reject: (reason?: any) => void }>>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  useEffect(() => {
    const savedProgress = localStorage.getItem('brailleApp_progress');
    if (savedProgress) {
      setLessonProgress(JSON.parse(savedProgress) as LessonProgress[]);
    }
  }, []);

useEffect(() => {
    localStorage.setItem('brailleApp_progress', JSON.stringify(lessonProgress));
  }, [lessonProgress]);

  const isCharacteristicValid = (char: BluetoothRemoteGATTCharacteristic | null): boolean => {
    if (!char) return false;
    if (!char.service) return false;
    if (!char.service.device) return false;
    if (!char.service.device.gatt) return false;
    return char.service.device.gatt.connected;
  };

  useEffect(() => {
    const processQueue = async () => {
      if (isProcessingQueue || sendQueue.length === 0) {
        return;
      }

      if (!bluetoothDevice?.gatt?.connected || !isArduinoConnected) {
        setSendQueue(prev => {
          prev.forEach(({ reject }) => reject(new Error('Device not connected')));
          return [];
        });
        return;
      }

      setIsProcessingQueue(true);
      
      while (sendQueue.length > 0) {
        const { dots, resolve, reject } = sendQueue[0];
        
        try {
          if (!isCharacteristicValid(characteristic)) {
            throw new Error('Characteristic is no longer valid. Device may have disconnected.');
          }

          if (!bluetoothDevice?.gatt?.connected) {
            throw new Error('Device disconnected');
          }
          
          const byte = dots.reduce((acc, dot) => acc | (1 << (dot - 1)), 0);
          console.log('Sending pattern:', byte.toString(2).padStart(8, '0'));
          
          await characteristic!.writeValue(new Uint8Array([byte]));
          console.log('Pattern sent successfully');
          resolve(true);
          
        } catch (error) {
          console.error('Error sending pattern:', error);
          
          if (error instanceof Error && (
            error.message.includes('disconnected') ||
            error.message.includes('no longer valid') ||
            error.message.includes('GATT server is disconnected')
          )) {
            setIsArduinoConnected(false);
            setCharacteristic(null);
            
            reject(error);
            
            setSendQueue(prev => {
              prev.slice(1).forEach(({ reject: rejectOther }) => 
                rejectOther(new Error('Device disconnected during operation'))
              );
              return [];
            });
            
            setIsProcessingQueue(false);
            return;
          }
          
          reject(error);
        }
        
        setSendQueue(prev => prev.slice(1));
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setIsProcessingQueue(false);
    };

    processQueue();
  }, [sendQueue, isProcessingQueue, characteristic, isArduinoConnected, bluetoothDevice]);

  const handleDisconnected = () => {
    console.log('BLE: Device disconnected');
    setIsArduinoConnected(false);
    setCharacteristic(null);
    setBluetoothDevice(null);
    setSendQueue(prev => {
      prev.forEach(({ reject }) => reject(new Error('Device disconnected')));
      return [];
    });
    setIsProcessingQueue(false);
  };

  const connectArduino = useCallback(async (): Promise<boolean> => {
    const SERVICE_UUID        = '19b10000-e8f2-537e-4f6c-d104768a1214';
    const CHARACTERISTIC_UUID = '19b10001-e8f2-537e-4f6c-d104768a1214';

    try {
      if (!navigator.bluetooth) {
        console.error('Web Bluetooth API is not available');
        return false;
      }

      if (bluetoothDevice?.gatt?.connected) {
        bluetoothDevice.gatt.disconnect();
      }
      setIsArduinoConnected(false);
      setCharacteristic(null);
      setBluetoothDevice(null);
      setSendQueue([]);
      setIsProcessingQueue(false);

      const device = await navigator.bluetooth.requestDevice({
        filters: [{ name: 'Braille_Display' }],
        optionalServices: [SERVICE_UUID]
      });

      device.addEventListener('gattserverdisconnected', handleDisconnected);

      console.log('Connecting to GATT server…');
      const server = await device.gatt!.connect();
      console.log('✔︎ GATT server connected');

      console.log(`Getting service ${SERVICE_UUID}…`);
      const service = await server.getPrimaryService(SERVICE_UUID);
      console.log('✔︎ Service found:', service.uuid);

      console.log(`Getting characteristic ${CHARACTERISTIC_UUID}…`);
      const char = await service.getCharacteristic(CHARACTERISTIC_UUID);
      console.log('✔︎ Characteristic found:', char.uuid);

      setBluetoothDevice(device);
      setCharacteristic(char);
      setIsArduinoConnected(true);
      
      setSendQueue([]);
      setIsProcessingQueue(false);
      
      return true;
    } catch (error) {
      console.error('Error connecting to Arduino:', error);
      setIsArduinoConnected(false);
      setCharacteristic(null);
      setBluetoothDevice(null);
      setSendQueue([]);
      setIsProcessingQueue(false);
      return false;
    }
  }, []);

  const disconnectArduino = () => {
    if (bluetoothDevice?.gatt?.connected) {
      bluetoothDevice.gatt.disconnect();
    }
    setIsArduinoConnected(false);
    setCharacteristic(null);
    setBluetoothDevice(null);
    setSendQueue(prev => {
      prev.forEach(({ reject }) => reject(new Error('Device manually disconnected')));
      return [];
    });
    setIsProcessingQueue(false);
  };

  const sendBraillePattern = async (dots: number[]): Promise<boolean> => {
    if (!isArduinoConnected || !bluetoothDevice?.gatt?.connected) {
      console.error('Device not connected');
      return false;
    }

    if (!isCharacteristicValid(characteristic)) {
      console.error('Characteristic is not valid');
      return false;
    }

    return new Promise((resolve, reject) => {
      setSendQueue(prev => [...prev, { dots, resolve, reject }]);
    });
  };

  const updateLessonProgress = (lessonId: string, completed: boolean, score?: number) => {
    setLessonProgress(prev => {
      const existing = prev.find(p => p.lessonId === lessonId);
      if (existing) {
        return prev.map(p =>
          p.lessonId === lessonId
            ? {
                ...p,
                completed,
                score: score !== undefined ? score : p.score,
                lastUpdated: new Date().toISOString()
              }
            : p
        );
      } else {
        return [
          ...prev,
          {
            lessonId,
            completed,
            score: score || 0,
            dateStarted: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          }
        ];
      }
    });
  };

return (
    <AppContext.Provider
      value={{
        lessonProgress,
        updateLessonProgress,
        isArduinoConnected,
        connectArduino,
        disconnectArduino,
        sendBraillePattern,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { AppContext };