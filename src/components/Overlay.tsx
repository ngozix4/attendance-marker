// Overlay.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';

export const Overlay = () => {
  return (
    <View style={styles.overlayContainer}>
      <View style={styles.scannerBox} />
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerBox: {
    width: 250,
    height: 250,
    borderColor: '#00FF00',
    borderWidth: 3,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
});
