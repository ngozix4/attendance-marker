import React, { useEffect, useState } from 'react';
import { View, Text, SectionList, ActivityIndicator } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { FIREBASE_DB } from '../services/firebase';
import { getAuth } from 'firebase/auth';
import tw from '../utils/tailwind';

const StudentStatsScreen = () => {
  const [groupedAttendance, setGroupedAttendance] = useState([]);
  const [studentEmail, setStudentEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          setError('User not logged in.');
          return;
        }

        setStudentEmail(user.email ?? '');

        const sessionSnap = await getDocs(collection(FIREBASE_DB, 'sessions'));
        const grouped = {};

        for (const session of sessionSnap.docs) {
          const sessionData = session.data();
          const scanSnap = await getDocs(collection(FIREBASE_DB, `sessions/${session.id}/scans`));

          const hasAttended = scanSnap.docs.some(scan => scan.data().studentId === user.uid);

          const timestamp = sessionData.startsAt?.toDate?.() ?? new Date();
          const dateStr = timestamp.toDateString(); // e.g., "Fri Apr 04 2025"
          const endTime = sessionData.expiresAt?.toDate?.() ?? new Date();
          const timeRange = `${timestamp.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}`;


          if (!grouped[dateStr]) {
            grouped[dateStr] = [];
          }

          grouped[dateStr].push({
            id: session.id,
            subject: sessionData.subject,
            time: timeRange,
            attended: hasAttended,
          });
        }

        // Convert to SectionList format
        const sectionData = Object.keys(grouped).map(date => ({
          title: date,
          data: grouped[date],
        }));

        setGroupedAttendance(sectionData);
      } catch (err) {
        console.error('Error fetching attendance:', err);
        setError('Failed to load attendance records.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-[#F1F0E4]`}>
        <ActivityIndicator size="large" color="#3E3F29" />
        <Text style={tw`mt-4 text-[#7D8D86]`}>Loading your attendance...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-[#F1F0E4] p-4`}>
        <Text style={tw`text-red-500 text-center`}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-[#F1F0E4] p-4`}>
      <Text style={tw`text-xl font-bold mb-2 text-[#3E3F29]`}>Your Attendance</Text>
      <Text style={tw`text-sm text-[#7D8D86] mb-6`}>Logged in as: {studentEmail}</Text>

      {groupedAttendance.length === 0 ? (
        <Text style={tw`text-[#7D8D86] text-center mt-8`}>No attendance records found.</Text>
      ) : (
        <SectionList
          sections={groupedAttendance}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section: { title } }) => (
            <View style={tw`bg-[#BCA88D] rounded-lg p-2 mb-2`}>
              <Text style={tw`text-lg font-bold text-white`}>{title}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={tw`bg-white rounded-lg p-3 mb-3 border border-[#BCA88D]`}>
              <Text style={tw`text-base font-semibold text-[#3E3F29]`}>Subject: {item.subject}</Text>
              <Text style={tw`text-sm text-[#7D8D86] mt-1`}>Time: {item.time}</Text>
              <Text style={tw`text-sm mt-1 ${item.attended ? 'text-green-600' : 'text-red-600'}`}>
                {item.attended ? '✅ Attended' : '❌ Not Attended'}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default StudentStatsScreen;