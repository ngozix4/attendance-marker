import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Timestamp } from 'firebase/firestore';


interface QRGeneratorProps {
  session: {
    ip: string;
    subject: string;
    expiresAt: Timestamp;
  };
}

const QRGenerator: React.FC<QRGeneratorProps> = ({ session }) => {
  const qrValue = `${session.ip}|${session.subject}`;

  return (
    <View style={styles.container}>
      <QRCode value={qrValue} size={250} />
      <Text style={styles.text}>Scan this QR code to mark attendance for:</Text>
      <Text style={styles.subject}>{session.subject}</Text>
    </View>
  );
};

export default QRGenerator;

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
