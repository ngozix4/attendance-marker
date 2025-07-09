import { collection, doc, getDoc, addDoc, Timestamp } from 'firebase/firestore';
import * as Network from 'expo-network';
import { FIREBASE_DB } from '../services/firebase';

export const createSessionFromTimetable = async (teacherSubject: string) => {
  try {
    
    const normalizedSlot = currentSlot.replace('-', '–');
    const timetableDocRef = doc(FIREBASE_DB, 'timetable', currentDay);
    const timetableSnap = await getDoc(timetableDocRef);

    if (!timetableSnap.exists()) {
      throw new Error(`No timetable found for current day: ${currentDay}`);
    }

    const timetableData = timetableSnap.data();
    const slotSubjects = timetableData[normalizedSlot];

    if (!Array.isArray(slotSubjects)) {
      throw new Error(`Slot "${normalizedSlot}" not found in timetable for ${currentDay}`);
    }

    if (!slotSubjects.includes(teacherSubject)) {
      throw new Error(`Subject "${teacherSubject}" not scheduled in slot "${normalizedSlot}"`);
    }

    const ipInfo = await Network.getIpAddressAsync();
    if (!ipInfo) {
      throw new Error("Could not retrieve IP address");
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 min from now

    const sessionRef = await addDoc(collection(FIREBASE_DB, 'sessions'), {
      subject: teacherSubject,
      ip: ipInfo,
      createdAt: Timestamp.fromDate(now),
      expiresAt: Timestamp.fromDate(expiresAt),
    });

    return sessionRef.id;
  } catch (error) {
    console.error("Error creating session:", error.message);
    throw error;
  }
};
