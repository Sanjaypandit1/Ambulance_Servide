# 🚑 Ambulance_Servide

A mobile app for emergency ambulance requests built using **React Native**. It allows users to request, track, and manage emergency services in real-time.

## 📌 Features

- 📍 Capture and store user location for emergencies  
- 🆘 Select type of emergency with additional info  
- 💾 Save emergency data using AsyncStorage  
- 📡 View uncompleted and uncancelled emergency requests  
- 📞 Make direct phone calls to emergency numbers  
- 🌙 Dark mode support  
- 🌐 Language selection support

## 🛠️ Tech Stack

- **Frontend**: React Native, TypeScript  
- **Storage**: AsyncStorage  
- **Native APIs**: Linking, Alert, Modal, Permissions  

## 🚀 Installation & Setup

### 1️⃣ Clone the Repository
```sh
git https://github.com/Sanjaypandit1/Ambulance_Servide.git
cd Ambulance_Service
```

### 2️⃣ Install Dependencies
```sh
npm install
```
### 2️⃣ Run the code

```sh
npx react-nativr run-android

⚡ Usage
Open App.tsx and start modifying your code

Save to auto-reload using Fast Refresh

🔄 Force Reload
Android: Press <kbd>R</kbd> twice or use <kbd>Ctrl/Cmd</kbd> + <kbd>M</kbd>

iOS: Press <kbd>Cmd</kbd> + <kbd>R</kbd>

🐞 Troubleshooting
❗ Metro stuck? → Run: npx react-native start --reset-cache

📵 Call not working? → Ensure permissions + Linking.canOpenURL()

🌓 Dark mode not applied? → Make sure a global theme provider is set

📱 Android build error? → Confirm emulator/device is connected

🍏 iOS issues? → Ensure CocoaPods and Xcode are properly configured

