// /screens/StudentScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import QRScanner from '../components/QRScanner';
import { FIREBASE_DB } from '../services/firebase';
import {
  Timestamp,
  collection,
  getDocs,
  query,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import tw from '../utils/tailwind';
import * as Network from 'expo-network';

type AttendedSession = {
  subject: string;
  timestamp: Timestamp;
};

const StudentScreen = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [attendedSessions, setAttendedSessions] = useState<AttendedSession[]>([]);

  /** 1) Fetch the student's name from users/{uid} */
  const fetchUserName = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const userDoc = await getDoc(doc(FIREBASE_DB, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setName(userDoc.data().name || '');
      }
    } catch (error) {
      console.error('Failed to fetch user name:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (subject: string) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('Not logged in');
      if (!name) await fetchUserName();
  
      // 1. Get the session document for the subject
      const sessionRef = doc(FIREBASE_DB, 'sessions', subject);
      const sessionSnap = await getDoc(sessionRef);
  
      if (!sessionSnap.exists()) {
        throw new Error('No active session found for this subject.');
      }
  
      const sessionData = sessionSnap.data();
      const now = Timestamp.now();
  
      // 2. Check if session is still active
      if (now > sessionData.expiresAt) {
        throw new Error('Session has expired.');
      }
  
      // 3. Set scan record using student UID as the document ID
      const scanRef = doc(sessionRef, 'scans', user.uid); // 👈 Custom doc ID
      await setDoc(scanRef, {
        name,
        studentId: user.uid,
        timestamp: now,
        ip:await Network.getIpAddressAsync()
      });

  } catch (err) {
    console.error('Failed to mark attendance:', err);
    throw err;
  }
};

  /** 3) After scan: mark attendance, alert, then refresh the list */
  const handleSessionScanned = async (data: string) => {
    setShowScanner(false);
  
    // Split the scanned data on the pipe symbol
    const parts = data.trim().split('|');
    const subject = parts[1]; // Assuming format is "ip|subject"
  
    if (!subject) {
      Alert.alert('Error', 'Invalid QR code format.');
      return;
    }
  
    try {
      await markAttendance(subject); // ✅ pass just the subject
      Alert.alert('Success', 'Attendance marked!');
      fetchAttendedSessions();
    } catch {
      Alert.alert('Error', 'Could not record attendance. Please try again.');
    }
  };
  

  /** 4) Load all sessions where this student has a scan doc */
  const fetchAttendedSessions = async () => {
    if (!name) return;
    const q = query(collection(FIREBASE_DB, 'sessions'));
    const snapshot = await getDocs(q);

    const attended: AttendedSession[] = [];
    for (const sessionDoc of snapshot.docs) {
      const scansRef = collection(FIREBASE_DB, 'sessions', sessionDoc.id, 'scans');
      const scansSnapshot = await getDocs(scansRef);
      const match = scansSnapshot.docs.find(d => d.data().name === name);
      if (match) {
        attended.push({
          subject: sessionDoc.data().subject,
          timestamp: match.data().timestamp,
        });
      }
    }
    setAttendedSessions(attended);
  };

  // initial load of user name → then attended sessions
  useEffect(() => {
    fetchUserName();
  }, []);

  useEffect(() => {
    if (name) {
      fetchAttendedSessions();
    }
  }, [name]);

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (showScanner) {
    return (
      <QRScanner onScan={handleSessionScanned} onBack={() => setShowScanner(false)} />
    );
  }

  return (
    <View style={tw`flex-1 bg-white px-5 pt-12`}>
      <Text style={tw`text-2xl font-bold mb-4 text-center`}>
        🎓 Welcome, {name || 'Student'}
      </Text>

      <TouchableOpacity
        style={tw`bg-blue-500 py-3 rounded-lg mb-6`}
        onPress={() => setShowScanner(true)}
      >
        <Text style={tw`text-white text-center font-semibold`}>Scan QR Code</Text>
      </TouchableOpacity>

      <Text style={tw`text-lg font-semibold mb-2`}>📘 Attended Sessions</Text>
      {attendedSessions.length === 0 ? (
        <Text style={tw`text-gray-500`}>No attendance marked yet.</Text>
      ) : (
        <FlatList
          data={attendedSessions}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={tw`bg-gray-100 rounded-md p-3 mb-2`}>
              <Text style={tw`font-medium`}>{item.subject}</Text>
              <Text style={tw`text-gray-600 text-sm`}>
                {item.timestamp.toDate().toLocaleString()}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default StudentScreen;
