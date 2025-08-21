/**
 * QRGenerator Component
 * ---------------------
 * This component generates a QR code for a specific attendance session.
 * It takes in a `session` object (containing the IP address, subject name, and expiration time)
 * and displays a QR code encoding the session's IP and subject. Students can scan
 * the QR code to mark their attendance.
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg'; // QR code generator component
import { Timestamp } from 'firebase/firestore'; // Firebase timestamp type for expiry handling

// Define the props structure expected by the QRGenerator component
interface QRGeneratorProps {
  session: {
    ip: string;                // IP address of the teacher or session host
    subject: string;           // Subject name for the attendance session
    expiresAt: Timestamp;      // Expiry time for the session (not used here, but available)
  };
}

// Functional component that takes session info and generates a QR code
const QRGenerator: React.FC<QRGeneratorProps> = ({ session }) => {
  // Construct the value to encode into the QR code
  const qrValue = `${session.ip}|${session.subject}`;

  return (
    <View style={styles.container}>
      {/* Render the QR code with the encoded value */}
      <QRCode value={qrValue} size={250} />

      {/* Display subject information below the QR code */}
      <Text style={styles.text}>Scan this QR code to mark attendance for:</Text>
      <Text style={styles.subject}>{session.subject}</Text>
    </View>
  );
};

export default QRGenerator;

// Styles for the component layout and text
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  subject: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 4,
  },
});
