/**
 * QRScanner Component
 * -------------------
 * This component opens the device's camera and scans for QR codes.
 * - Requests camera permission on mount.
 * - Uses Expo's `CameraView` to scan QR codes.
 * - Calls `onScan(data)` with the scanned QR code data once.
 * - Shows an overlay UI and a back button that calls `onBack()`.
 * - Prevents duplicate scans by locking after the first scan and resetting the lock when the app resumes from background.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  AppState,
  SafeAreaView,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';

import { CameraView, Camera } from 'expo-camera';
import { Overlay } from './Overlay'; // Custom overlay component (e.g., frame/UI)
import { Ionicons } from '@expo/vector-icons'; // For back icon

// Props interface for this component
interface QRScannerProps {
  onScan: (data: string) => void; // Called when a QR code is successfully scanned
  onBack: () => void;             // Called when back button is pressed
}

// QRScanner functional component
const QRScanner: React.FC<QRScannerProps> = ({ onScan, onBack }) => {
  const qrLock = useRef(false); // Prevents multiple scans
  const appState = useRef(AppState.currentState); // Tracks app state
  const [hasPermission, setHasPermission] = useState<boolean | null>(null); // Camera permission state

  // Request camera permission on mount
  useEffect(() => {
    const getPermission = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getPermission();
  }, []);

  // Reset QR scan lock when app returns from background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        qrLock.current = false; // Unlock scan
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove(); // Clean up on unmount
  }, []);

  // Show loading while permission is being resolved
  if (hasPermission === null) {
    return (
      <View>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  // Show message if camera access is denied
  if (hasPermission === false) {
    return (
      <View>
        <Text>No access to camera</Text>
      </View>
    );
  }

  // Render the camera view with QR code scanner
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        onBarcodeScanned={({ data }) => {
          if (!qrLock.current) {
            qrLock.current = true; // Lock after first successful scan
            onScan(data); // Send scanned QR code data back
          }
        }}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'], // Only scan QR codes
        }}
      >
        {/* Custom overlay UI (e.g., scan frame) */}
        <Overlay />

        {/* Back button in top-left corner */}
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
