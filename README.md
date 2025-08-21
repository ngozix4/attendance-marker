# 📚 Smart Attendance Marker System

A cross-platform attendance tracking app built with **Expo (React Native)** and **Firebase**, enabling teachers to generate QR codes and students to mark attendance — only if connected to the same local Wi-Fi network.

## 🚀 Features

- Teacher QR Code generation
- Student QR Code scanning
- Local Wi-Fi IP address matching for validation
- Attendance storage in Firebase Firestore
- Daily attendance summaries (Firebase functions)
- Multi-platform: Android, iOS, and Web (via Expo)

## 📁 Project Structure

```
src/
├── components/         # QR Generator & Scanner
├── navigation/         # App Navigation Setup
├── screens/            # Role-based interfaces (Login, Teacher, Student)
├── services/           # Firebase setup and utilities
├── App.tsx             # App root
├── index.tsx           # Web entry point
```
Other folders include `.expo`, `android`, `app`, `assets`, and `node_modules`.

## 🧰 Tech Stack

- **React Native** (Expo)
- **Firebase** (Firestore + Functions)
- **expo-camera** for QR scanning
- **expo-network** for IP verification
- **react-native-qrcode-svg** for QR code rendering

## 🛠 Installation

```bash
git clone https://github.com/yourusername/attendance-system.git
cd attendance-system
npm install
npx expo start
```



## 🧪 Running the App

- **Android/iOS**: Use Expo Go or `expo run`
- **Web**: `npx expo start --web`

## 🔮 Future Features

- Admin dashboard for visual analytics
- Offline attendance sync
- SMS/email reminders for absentees



