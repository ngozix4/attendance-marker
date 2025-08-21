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
      <View style={tw`flex-1 justify-center items-center bg-[#F1F0E4]`}>
        <ActivityIndicator size="large" color="#3E3F29" />
        <Text style={tw`mt-2 text-[#7D8D86]`}>Loading sessions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={tw`flex-1 justify-center items-center px-4 bg-[#F1F0E4]`}>
        <Text style={tw`text-red-600 text-center`}>{error}</Text>
      </View>
    );
  }

  if (sessions.length === 0) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-[#F1F0E4]`}>
        <Text style={tw`text-[#7D8D86]`}>No sessions found yet.</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-[#F1F0E4] p-4`}>
      <Text style={tw`text-xl font-bold mb-6 text-[#3E3F29]`}>Session Attendance Stats</Text>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={tw`mb-4 p-4 bg-white rounded-lg border border-[#BCA88D] shadow-sm`}>
            <Text style={tw`text-lg font-semibold text-[#3E3F29]`}>Subject: {item.subject}</Text>
            <Text style={tw`text-sm text-[#7D8D86] mt-1`}>Total Students: {item.totalAttendees}</Text>
            <Text style={tw`text-xs text-[#7D8D86] mt-2`}>Scan Times:</Text>
            {item.timestamps.map((ts, idx) => (
              <Text key={idx} style={tw`text-xs ml-2 text-[#7D8D86] mt-1`}>
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