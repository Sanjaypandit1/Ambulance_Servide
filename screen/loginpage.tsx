"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import auth from "@react-native-firebase/auth"
import firestore from "@react-native-firebase/firestore"
import Icon from "react-native-vector-icons/MaterialIcons"

export type RootStackParamList = {
  Login: undefined
  MainApp: undefined
}

export type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, "Login">

// Define user profile interface
interface UserProfile {
  name: string
  contactNumber: string
  gender: "male" | "female" | "other"
  age: string
}

const LoginSelectionScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [userType, setUserType] = useState<"user" | "driver">("user")
  const [isSignUp, setIsSignUp] = useState(false)

  // User profile states
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    contactNumber: "",
    gender: "male",
    age: "",
  })

  useEffect(() => {
    // Check if user is already logged in
    const subscriber = auth().onAuthStateChanged((user) => {
      if (user) {
        // Get user type from Firestore
        firestore()
          .collection("users")
          .doc(user.uid)
          .get()
          .then((documentSnapshot) => {
            if (documentSnapshot.exists) {
              // User exists, navigate to main app
              navigation.navigate("MainApp")
            }
          })
          .catch((error) => {
            console.error("Error fetching user data:", error)
          })
      }
    })

    return () => subscriber()
  }, [navigation])

  const handleSignUp = async () => {
    // Validate profile data
    if (!profile.name.trim()) {
      Alert.alert("Error", "Please enter your name")
      return false
    }

    if (!profile.contactNumber.trim()) {
      Alert.alert("Error", "Please enter your contact number")
      return false
    }

    if (!profile.age.trim() || isNaN(Number(profile.age))) {
      Alert.alert("Error", "Please enter a valid age")
      return false
    }

    return true
  }

  const handleAuthentication = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password")
      return
    }

    try {
      setLoading(true)

      let userCredential

      if (isSignUp) {
        // For signup, first show profile modal to collect additional info
        if (showProfileModal) {
          // Validate and create user
          const isValid = await handleSignUp()
          if (!isValid) {
            setLoading(false)
            return
          }

          // Create new user
          userCredential = await auth().createUserWithEmailAndPassword(email, password)

          // Save user type and profile to Firestore
          await firestore().collection("users").doc(userCredential.user.uid).set({
            email: email,
            userType: userType,
            name: profile.name,
            contactNumber: profile.contactNumber,
            gender: profile.gender,
            age: profile.age,
            createdAt: firestore.FieldValue.serverTimestamp(),
          })

          setShowProfileModal(false)
        } else {
          // Show profile modal first
          setShowProfileModal(true)
          setLoading(false)
          return
        }
      } else {
        // Sign in existing user
        userCredential = await auth().signInWithEmailAndPassword(email, password)

        // Get user type from Firestore
        const userDoc = await firestore().collection("users").doc(userCredential.user.uid).get()

        if (userDoc.exists) {
          const userData = userDoc.data()
          // Check if user is trying to log in with correct role
          if (userData?.userType !== userType) {
            await auth().signOut()
            Alert.alert(
              "Wrong Account Type",
              `This account is registered as a ${userData?.userType}. Please use the correct login option.`,
            )
            setLoading(false)
            return
          }
        }
      }

      setLoading(false)
      navigation.navigate("MainApp")
    } catch (error) {
      setLoading(false)
      setShowProfileModal(false)

      // Type guard for Firebase Auth errors
      const firebaseError = error as { code?: string; message: string }

      if (firebaseError.code === "auth/email-already-in-use") {
        Alert.alert("Error", "That email address is already in use!")
      } else if (firebaseError.code === "auth/invalid-email") {
        Alert.alert("Error", "That email address is invalid!")
      } else if (firebaseError.code === "auth/user-not-found" || firebaseError.code === "auth/wrong-password") {
        Alert.alert("Error", "Invalid email or password")
      } else {
        Alert.alert("Error", firebaseError.message || "An unknown error occurred")
      }

      console.error(error)
    }
  }

  const showLoginOptions = () => {
    return (
      <>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setUserType("user")
            setShowLoginForm(true)
          }}
        >
          <Text style={styles.buttonText}>Login as a User</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setUserType("driver")
            setShowLoginForm(true)
          }}
        >
          <Text style={styles.buttonText}>Login as a Driver</Text>
        </TouchableOpacity>
      </>
    )
  }

  const showAuthForm = () => {
    return (
      <>
        <Text style={styles.formTitle}>
          {isSignUp ? "Create Account" : "Login"} as {userType === "user" ? "User" : "Driver"}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleAuthentication} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isSignUp ? "Sign Up" : "Login"}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.switchButton} onPress={() => setIsSignUp(!isSignUp)}>
          <Text style={styles.switchButtonText}>
            {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => setShowLoginForm(false)}>
          <Text style={styles.backButtonText}>Back to Selection</Text>
        </TouchableOpacity>
      </>
    )
  }

  const renderProfileModal = () => {
    return (
      <Modal
        visible={showProfileModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowProfileModal(false)
          setLoading(false)
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complete Your Profile</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowProfileModal(false)
                  setLoading(false)
                }}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#e74c3c" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={profile.name}
                onChangeText={(text) => setProfile({ ...profile, name: text })}
              />

              <Text style={styles.inputLabel}>Contact Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your contact number"
                value={profile.contactNumber}
                onChangeText={(text) => setProfile({ ...profile, contactNumber: text })}
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[styles.genderOption, profile.gender === "male" && styles.genderSelected]}
                  onPress={() => setProfile({ ...profile, gender: "male" })}
                >
                  <Text style={[styles.genderText, profile.gender === "male" && styles.genderTextSelected]}>Male</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.genderOption, profile.gender === "female" && styles.genderSelected]}
                  onPress={() => setProfile({ ...profile, gender: "female" })}
                >
                  <Text style={[styles.genderText, profile.gender === "female" && styles.genderTextSelected]}>
                    Female
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.genderOption, profile.gender === "other" && styles.genderSelected]}
                  onPress={() => setProfile({ ...profile, gender: "other" })}
                >
                  <Text style={[styles.genderText, profile.gender === "other" && styles.genderTextSelected]}>
                    Other
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your age"
                value={profile.age}
                onChangeText={(text) => setProfile({ ...profile, age: text })}
                keyboardType="numeric"
                maxLength={3}
              />
            </ScrollView>

            <TouchableOpacity style={styles.button} onPress={handleAuthentication} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Complete Sign Up</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Ambulance</Text>

          <Image
            source={{
              uri: "https://www.shutterstock.com/image-vector/ambulance-car-medical-vehicle-vector-600nw-1937116336.jpg",
            }}
            style={styles.image}
            resizeMode="contain"
            onError={(error) => console.log("Image loading error:", error)}
          />

          {!showLoginForm ? showLoginOptions() : showAuthForm()}
        </View>
      </ScrollView>

      {renderProfileModal()}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#e74c3c",
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  photoText: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 40,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2c3e50",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: "#f9f9f9",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
    color: "#2c3e50",
  },
  button: {
    width: "100%",
    padding: 15,
    backgroundColor: "#3498db",
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  switchButton: {
    marginBottom: 20,
  },
  switchButtonText: {
    color: "#3498db",
    fontSize: 16,
  },
  backButton: {
    marginTop: 10,
  },
  backButtonText: {
    color: "#7f8c8d",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    marginBottom: 20,
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  genderOption: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 5,
    borderRadius: 8,
  },
  genderSelected: {
    backgroundColor: "#3498db",
    borderColor: "#3498db",
  },
  genderText: {
    color: "#2c3e50",
  },
  genderTextSelected: {
    color: "#fff",
  },
})

export default LoginSelectionScreen
