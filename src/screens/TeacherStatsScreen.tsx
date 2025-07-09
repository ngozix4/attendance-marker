import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { FIREBASE_DB } from '../services/firebase';
import tw from '../utils/tailwind';

const TeacherStatsScreen = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const sessionSnapshot = await getDocs(collection(FIREBASE_DB, 'sessions'));

        const data = await Promise.all(
          sessionSnapshot.docs.map(async (docSnap) => {
            const sessionData = docSnap.data();
            const scanSnap = await getDocs(collection(FIREBASE_DB, `sessions/${docSnap.id}/scans`));

            return {
              id: docSnap.id,
              subject: sessionData.subject,
              totalAttendees: scanSnap.size,
              timestamps: scanSnap.docs
                .map((doc) => doc.data()?.timestamp)
                .filter(Boolean), // filter out undefined/null timestamps
            };
          })
        );

        setSessions(data);
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError('Failed to load session stats. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={tw`mt-2 text-gray-500`}>Loading sessions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={tw`flex-1 justify-center items-center px-4`}>
        <Text style={tw`text-red-600 text-center`}>{error}</Text>
      </View>
    );
  }

  if (sessions.length === 0) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <Text style={tw`text-gray-500`}>No sessions found yet.</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-white p-4`}>
      <Text style={tw`text-xl font-bold mb-4`}>Session Attendance Stats</Text>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={tw`mb-4 p-3 border border-gray-300 rounded`}>
            <Text style={tw`text-lg font-semibold`}>Subject: {item.subject}</Text>
            <Text style={tw`text-sm`}>Total Students: {item.totalAttendees}</Text>
            <Text style={tw`text-xs text-gray-500 mt-1`}>Scan Times:</Text>
            {item.timestamps.map((ts, idx) => (
              <Text key={idx} style={tw`text-xs ml-2 text-gray-600`}>
                {ts?.toDate().toLocaleString()}
              </Text>
            ))}
          </View>
        )}
      />
    </View>
  );
};

export default TeacherStatsScreen;
