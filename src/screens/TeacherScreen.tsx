// /screens/TeacherScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, FlatList, Alert, ActivityIndicator
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Timestamp, collection, query, where, onSnapshot, getDocs, deleteDoc, doc, getDoc, addDoc, startAfter, setDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../services/firebase';
import QRGenerator from '../components/QRGenerator';
import { seedTimetable } from '../utils/firebaseSeeder';
import tw from '../utils/tailwind';
import * as Network from 'expo-network';


type SessionType = {
  id: string;
  ip: string;
  subject: string;
  startsAt: Timestamp;
  expiresAt: Timestamp;
};

async function lookupSlotTimes(subject: string): Promise<{ startsAt: Timestamp; expiresAt: Timestamp } | null> {
  // 1) figure out today's weekday key
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const now = new Date();
  const today = days[now.getDay()];

  // 2) fetch the timetable doc
  const ttSnap = await getDoc(doc(FIREBASE_DB, 'timetable', today));
  if (!ttSnap.exists()) return null;
  const timetable = ttSnap.data();

  // 3) scan each slot for our subject
  for (const slotKey of Object.keys(timetable)) {
    const subjects: string[] = timetable[slotKey];
    if (!subjects.includes(subject)) continue;

    // parse "HH:MM-HH:MM"
    const [startStr, endStr] = slotKey.split('-');
    const [sh, sm] = startStr.split(':').map(Number);
    const [eh, em] = endStr.split(':').map(Number);

    const startDate = new Date(now);
    startDate.setHours(sh, sm, 0, 0);
    const endDate = new Date(now);
    endDate.setHours(eh, em, 0, 0);

    return {
      startsAt: Timestamp.fromDate(startDate),
      expiresAt: Timestamp.fromDate(endDate),
    };
  }

  return null;
}

const createNewSession = async (subject: string): Promise<SessionType | null> => {
  try {
    if (!subject) throw new Error('Missing subject');

    const ipAddress = await Network.getIpAddressAsync();
    if (!ipAddress) throw new Error('Missing IP address');

    const times = await lookupSlotTimes(subject);
    if (!times) throw new Error(`No active timetable slot for "${subject}"`);

    // Create a reference with the subject as the ID
    const sessionRef = doc(FIREBASE_DB, 'sessions', subject);

    // Write the document
    await setDoc(sessionRef, {
      ip: ipAddress,
      subject,
      startsAt: times.startsAt,
      expiresAt: times.expiresAt,
    });

    return {
      id: subject,
      ip: ipAddress,
      subject,
      startsAt: times.startsAt,
      expiresAt: times.expiresAt,
    };
  } catch (err) {
    console.error('Failed to create session:', err);
    return null;
  }
};




const TeacherScreen = () => {
  const [sessions, setSessions] = useState<SessionType[]>([]);
  const [studentList, setStudentList] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentSubjects, setCurrentSubjects] = useState<string[]>([]);

  const getCurrentSubjects = async () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const now = new Date();
    const today = days[now.getDay()];
    const timetableDoc = doc(FIREBASE_DB, 'timetable', today);
    const docSnap = await getDoc(timetableDoc);

    if (docSnap.exists()) {
      const timetable = docSnap.data();
      const currentTime = now.getHours() + now.getMinutes() / 60;
      const ongoingSubjects: string[] = [];

      Object.entries(timetable).forEach(([slot, subjects]: [string, any]) => {
        const [startStr, endStr] = slot.split('-');
        const [startH, startM] = startStr.split(':').map(Number);
        const [endH, endM] = endStr.split(':').map(Number);
        const startTime = startH + startM / 60;
        const endTime = endH + endM / 60;
        if (currentTime >= startTime && currentTime <= endTime) {
          ongoingSubjects.push(...subjects);
        }
      });

      setCurrentSubjects(ongoingSubjects);
    }
  };

  useEffect(() => {
    getCurrentSubjects();
  }, []);

  useEffect(() => {
    if (!selectedSubject) return;
  
    const q = query(
      collection(FIREBASE_DB, 'sessions'),
      where('subject', '==', selectedSubject)
    );
  
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const now = Timestamp.now();
      const sessionDocs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SessionType[];
  
      let validSessions = sessionDocs.filter(
        (session) => session.expiresAt.toDate() > now.toDate()
      );
  
      // If no valid sessions exist, create one
      if (validSessions.length === 0) {
        const newSession = await createNewSession(selectedSubject);
        if (newSession) validSessions = [newSession];
      }
  
      setSessions(validSessions);
  
      if (validSessions.length > 0) {
        const firstSession = validSessions[0];
        const scansRef = collection(FIREBASE_DB, 'sessions', firstSession.id, 'scans');
        const studentSnapshot = await getDocs(scansRef);
        const names = studentSnapshot.docs.map(doc => doc.data().name);
        setStudentList(names);
      } else {
        setStudentList([]);
      }
    });
  
    return () => unsubscribe();
  }, [selectedSubject]);
  

  const handleSeed = async () => {
    await seedTimetable();
    Alert.alert('Success', 'Timetable seeded successfully!');
    getCurrentSubjects();
  };

  const handleCleanup = async () => {
    const snapshot = await getDocs(collection(FIREBASE_DB, 'sessions'));
    const deletions = snapshot.docs.filter(doc => !doc.data().expiresAt);
    for (const docRef of deletions) {
      await deleteDoc(doc(FIREBASE_DB, 'sessions', docRef.id));
    }
    Alert.alert('Cleanup', `${deletions.length} invalid sessions deleted.`);
  };

  return (
    <Animatable.View animation="fadeInUp" style={tw`flex-1 bg-white px-5 pt-12`}>
      <Text style={tw`text-2xl font-bold mb-4 text-center`}>📚 Teacher Dashboard</Text>

      <TouchableOpacity onPress={handleSeed} style={tw`bg-green-500 p-3 rounded-lg mb-3`}>
        <Text style={tw`text-white text-center font-semibold`}>Seed Timetable</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleCleanup} style={tw`bg-red-500 p-3 rounded-lg mb-5`}>
        <Text style={tw`text-white text-center font-semibold`}>Clean Invalid Sessions</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setModalVisible(true)} style={tw`bg-gray-100 p-3 rounded-lg mb-4`}>
        <Text style={tw`text-center text-base`}>{selectedSubject || 'Select Current Session'}</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity style={tw`flex-1 bg-black bg-opacity-50 justify-center items-center`} onPress={() => setModalVisible(false)}>
          <View style={tw`bg-white p-5 w-3/4 rounded-lg`}>
            <FlatList
              data={currentSubjects}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedSubject(item);
                    setModalVisible(false);
                  }}
                  style={tw`py-2 border-b border-gray-200`}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {selectedSubject ? (
        sessions.length > 0 ? (
          <Animatable.View animation="zoomIn" duration={600}>
            <QRGenerator session={sessions[0]} />
          </Animatable.View>
  ) : (
    <View style={tw`flex items-center justify-center h-40 border border-dashed border-gray-400 rounded-lg mt-4`}>
      <Text style={tw`text-gray-500`}>Waiting for session to be created...</Text>
    </View>
  )
) : null}


      <Text style={tw`text-lg font-semibold mt-5 mb-2`}>🧑‍🎓 Students:</Text>
      <FlatList
        data={studentList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <Text style={tw`py-1 px-2 bg-gray-100 rounded-md mb-2`}>{item}</Text>}
      />
    </Animatable.View>
  );
};

export default TeacherScreen;
