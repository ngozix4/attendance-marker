import React, { useEffect, useRef, useState } from 'react';
import {
  AppState,
  SafeAreaView,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { Overlay } from './Overlay';
import { Ionicons } from '@expo/vector-icons';

interface QRScannerProps {
  onScan: (data: string) => void;
  onBack: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onBack }) => {
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const getPermission = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getPermission();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        qrLock.current = false;
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

  if (hasPermission === null) {
    return <View><Text>Requesting camera permission...</Text></View>;
  }

  if (hasPermission === false) {
    return <View><Text>No access to camera</Text></View>;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        onBarcodeScanned={({ data }) => {
          if (!qrLock.current) {
            qrLock.current = true;
            onScan(data);
          }
        }}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <Overlay />
        <TouchableOpacity
          onPress={onBack}
          style={{ position: 'absolute', top: 40, left: 20 }}
        >
          <Ionicons name="arrow-back" size={32} color="white" />
        </TouchableOpacity>
      </CameraView>
    </SafeAreaView>
  );
};

export default QRScanner;
