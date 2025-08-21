// /screens/TeacherScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, FlatList, Alert
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Timestamp, collection, query, where, onSnapshot, getDocs, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
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
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const now = new Date();
  const today = days[now.getDay()];

  const ttSnap = await getDoc(doc(FIREBASE_DB, 'timetable', today));
  if (!ttSnap.exists()) return null;
  const timetable = ttSnap.data();

  for (const slotKey of Object.keys(timetable)) {
    const subjects: string[] = timetable[slotKey];
    if (!subjects.includes(subject)) continue;

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

    const sessionRef = doc(FIREBASE_DB, 'sessions', subject);

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
  const [sessionCreated, setSessionCreated] = useState(false);

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

  // Listen for sessions and students, but DON'T create sessions here
  useEffect(() => {
    if (!selectedSubject) return;

    setSessionCreated(false); // reset flag when subject changes

    const q = query(
      collection(FIREBASE_DB, 'sessions'),
      where('subject', '==', selectedSubject)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = Timestamp.now();
      const sessionDocs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SessionType[];

      const validSessions = sessionDocs.filter(
        (session) => session.expiresAt.toDate() > now.toDate()
      );

      setSessions(validSessions);

      if (validSessions.length > 0) {
        const firstSession = validSessions[0];
        getDocs(collection(FIREBASE_DB, 'sessions', firstSession.id, 'scans'))
          .then((studentSnapshot) => {
            const names = studentSnapshot.docs.map(doc => doc.data().name);
            setStudentList(names);
          })
          .catch(() => setStudentList([]));
      } else {
        setStudentList([]);
      }
    });

    return () => unsubscribe();
  }, [selectedSubject]);

  // Create a new session only once if none exists
  useEffect(() => {
    if (!selectedSubject) return;
    if (sessions.length > 0) return;
    if (sessionCreated) return;

    const createSession = async () => {
      const newSession = await createNewSession(selectedSubject);
      if (newSession) {
        setSessionCreated(true);
        setSessions([newSession]);
      }
    };

    createSession();
  }, [selectedSubject, sessions, sessionCreated]);

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
    <Animatable.View animation="fadeInUp" style={tw`flex-1 bg-[#F1F0E4] px-5 pt-12`}>
      <Text style={tw`text-2xl font-bold mb-6 text-center text-[#3E3F29]`}>📚 Teacher Dashboard</Text>

      <TouchableOpacity onPress={handleSeed} style={tw`bg-[#7D8D86] p-4 rounded-lg mb-3 shadow-md`}>
        <Text style={tw`text-white text-center font-semibold text-base`}>Seed Timetable</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleCleanup} style={tw`bg-[#BCA88D] p-4 rounded-lg mb-6 shadow-md`}>
        <Text style={tw`text-white text-center font-semibold text-base`}>Clean Invalid Sessions</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setModalVisible(true)} style={tw`bg-white p-4 rounded-lg mb-6 border border-[#BCA88D] shadow-sm`}>
        <Text style={tw`text-center text-base text-[#3E3F29]`}>{selectedSubject || 'Select Current Session'}</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity style={tw`flex-1 bg-black bg-opacity-50 justify-center items-center`} onPress={() => setModalVisible(false)}>
          <View style={tw`bg-white p-5 w-3/4 rounded-lg shadow-lg`}>
            <Text style={tw`text-lg font-bold mb-3 text-[#3E3F29]`}>Select Subject</Text>
            <FlatList
              data={currentSubjects}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedSubject(item);
                    setModalVisible(false);
                  }}
                  style={tw`py-3 border-b border-gray-200`}
                >
                  <Text style={tw`text-[#3E3F29]`}>{item}</Text>
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
          <View style={tw`flex items-center justify-center h-40 border-2 border-dashed border-[#BCA88D] rounded-lg mt-4 bg-white`}>
            <Text style={tw`text-[#7D8D86]`}>Waiting for session to be created...</Text>
          </View>
        )
      ) : null}

      <Text style={tw`text-lg font-semibold mt-6 mb-3 text-[#3E3F29]`}>🧑‍🎓 Students:</Text>
      <FlatList
        data={studentList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={tw`py-2 px-3 bg-white rounded-md mb-2 border border-[#BCA88D]`}>
            <Text style={tw`text-[#3E3F29]`}>{item}</Text>
          </View>
        )}
      />
    </Animatable.View>
  );
};

export default TeacherScreen;