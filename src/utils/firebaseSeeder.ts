// seedTimetable.ts
import { doc, setDoc, collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../services/firebase';

const timetableData = {
  Monday: {
    '08:30-09:30': ['Artificial Intelligence 700', 'Networks 731'],
    '09:30-10:30': ['Networks 730'],
    '10:00-11:30': ['Machine Learning 700', 'Programming 741'],
    '11:30-12:30': ['PROG-JAVA 731'],
    '12:30-13:30': ['Software Engineering 700'],
    '13:30-14:30': ['IT Strategic Management 731'],
    '14:30-15:30': ['Programming 741', 'Cyber Security 700'],
  },
  Tuesday: {
    '08:30-09:30': ['PROG-JAVA 731'],
    '09:30-10:30': ['Software Engineering 700'],
    '10:30-11:30': ['Networks 731', 'Programming 741'],
    '11:30-12:30': ['IT Strategic Management 731'],
    '12:30-13:30': ['Software Engineering 700', 'Machine Learning 700'],
    '13:30-14:30': ['Human Computer Interaction 700'],
    '14:30-15:30': ['Cyber Security 700', 'Artificial Intelligence 700'],
  },
  Wednesday: {
    '08:30-09:30': ['Networks 731', 'Programming 741'],
    '09:30-10:30': ['IT Strategic Management 731'],
    '10:30-11:30': ['Software Engineering 700'],
    '11:30-12:30': ['PROG-JAVA 731'],
    '12:30-13:30': ['Artificial Intelligence 700'],
    '13:30-14:30': ['Human Computer Interaction 700'],
    '14:30-15:30': ['Cyber Security 700'],
  },
  Thursday: {
    '08:30-09:30': ['Programming 741'],
    '09:30-10:30': ['Artificial Intelligence 700'],
    '10:30-11:30': ['Networks 731'],
    '11:30-12:30': ['PROG-JAVA 731'],
    '12:30-13:30': ['Machine Learning 700'],
    '13:30-14:30': ['IT Strategic Management 731', 'Networks 731'],
  },
  Friday: {
    '08:30-09:30': ['Cyber Security 700'],
    '09:30-10:30': ['Machine Learning 700'],
    '10:30-11:30': ['Programming 741'],
    '11:30-12:30': ['PROG-JAVA 731'],
    '12:30-13:30': ['Artificial Intelligence 700'],
    '13:30-14:30': ['Human Computer Interaction 700'],
    '14:30-15:30': ['Software Engineering 700'],
    '15:30-16:30': ['IT Strategic Management 731', 'Networks 731'],
  },
  Saturday: {
    '00:00-22:30': ['Cyber Security 700'],
  },
  Sunday: {
    '00:00-22:30': ['Cyber Security 700'],
  },
};

export const seedTimetable = async () => {
  try {
    const validSubjectsSet = new Set<string>();

    // Loop through days
    for (const [day, slots] of Object.entries(timetableData)) {
      const docRef = doc(FIREBASE_DB, 'timetable', day);
      await setDoc(docRef, slots);

      // Collect unique subjects
      for (const subjectList of Object.values(slots)) {
        for (const subject of subjectList) {
          validSubjectsSet.add(subject);
        }
      }
    }

    // Seed validSubjects (if not already there)
    const validSubjectsRef = collection(FIREBASE_DB, 'validSubjects');
    const existingSubjectsSnapshot = await getDocs(validSubjectsRef);
    const existingSubjects = new Set(
      existingSubjectsSnapshot.docs.map(doc => doc.data().name)
    );

    for (const subject of validSubjectsSet) {
      if (!existingSubjects.has(subject)) {
        await addDoc(validSubjectsRef, { name: subject });
      }
    }

    console.log('✅ Timetable and validSubjects seeded successfully.');
  } catch (error) {
    console.error('❌ Error seeding timetable:', error);
  }
};
