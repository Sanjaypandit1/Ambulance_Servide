import React, { createContext, useState, useContext, useEffect } from "react"
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth"
import firestore from "@react-native-firebase/firestore"
import { authApi, userApi } from "../services/api"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Define user profile interface
interface UserProfile {
  name: string
  contactNumber: string
  gender: string
  age: string
  // Add any other fields that might be in the profile
}

interface AuthContextData {
  user: FirebaseAuthTypes.User | null
  userType: "user" | "driver" | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userType: "user" | "driver", profile: UserProfile) => Promise<void>
  signOut: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null)
  const [userType, setUserType] = useState<"user" | "driver" | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Function to fetch user profile data from API
  const fetchUserData = async (uid: string) => {
    try {
      // First try to get from API
      const response = await userApi.getUserProfile(uid)
      
      if (response.data) {
        const userData = response.data
        console.log("Fetched user data from API:", userData)
        
        // Set user type
        setUserType(userData?.userType as "user" | "driver")
        
        // Set user profile
        setUserProfile({
          name: userData?.name || "",
          contactNumber: userData?.contactNumber || "",
          gender: userData?.gender || "",
          age: userData?.age || "",
        })
      } else {
        // Fallback to Firestore if API fails
        const userDoc = await firestore().collection("users").doc(uid).get()
        
        if (userDoc.exists) {
          const userData = userDoc.data()
          console.log("Fetched user data from Firestore:", userData)
          
          // Set user type
          setUserType(userData?.userType as "user" | "driver")
          
          // Set user profile
          setUserProfile({
            name: userData?.name || "",
            contactNumber: userData?.contactNumber || "",
            gender: userData?.gender || "",
            age: userData?.age || "",
          })
        } else {
          console.log("No user data found")
          setUserType(null)
          setUserProfile(null)
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      
      // Fallback to Firestore if API fails
      try {
        const userDoc = await firestore().collection("users").doc(uid).get()
        
        if (userDoc.exists) {
          const userData = userDoc.data()
          console.log("Fetched user data from Firestore:", userData)
          
          // Set user type
          setUserType(userData?.userType as "user" | "driver")
          
          // Set user profile
          setUserProfile({
            name: userData?.name || "",
            contactNumber: userData?.contactNumber || "",
            gender: userData?.gender || "",
            age: userData?.age || "",
          })
        }
      } catch (firestoreError) {
        console.error("Error fetching user data from Firestore:", firestoreError)
      }
    }
  }

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = auth().onAuthStateChanged(async (authUser) => {
      if (authUser) {
        setUser(authUser)
        
        // Get token for API calls
        const token = await authUser.getIdToken()
        await AsyncStorage.setItem('authToken', token)
        
        await fetchUserData(authUser.uid)
      } else {
        setUser(null)
        setUserType(null)
        setUserProfile(null)
        await AsyncStorage.removeItem('authToken')
      }
      setLoading(false)
    })

    // Cleanup subscription
    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      // Try API login first
      try {
        const response = await authApi.login(email, password)
        if (response.data && response.data.token) {
          await AsyncStorage.setItem('authToken', response.data.token)
          
          // Firebase login for backward compatibility
          const userCredential = await auth().signInWithEmailAndPassword(email, password)
          if (userCredential.user) {
            await fetchUserData(userCredential.user.uid)
          }
          return
        }
      } catch (apiError) {
        console.log("API login failed, falling back to Firebase:", apiError)
      }
      
      // Fallback to Firebase
      const userCredential = await auth().signInWithEmailAndPassword(email, password)
      if (userCredential.user) {
        await fetchUserData(userCredential.user.uid)
      }
    } catch (error) {
      console.error("Sign in error:", error)
      throw error
    }
  }

  const signUp = async (
    email: string, 
    password: string, 
    userType: "user" | "driver", 
    profile: UserProfile
  ) => {
    try {
      // Try API registration first
      try {
        const userData = {
          email,
          password,
          userType,
          ...profile,
        }
        
        const response = await authApi.register(userData)
        if (response.data && response.data.token) {
          await AsyncStorage.setItem('authToken', response.data.token)
          
          // Firebase signup for backward compatibility
          const userCredential = await auth().createUserWithEmailAndPassword(email, password)
          
          // Save user data to Firestore
          await firestore().collection("users").doc(userCredential.user.uid).set({
            email,
            userType,
            name: profile.name,
            contactNumber: profile.contactNumber,
            gender: profile.gender,
            age: profile.age,
            createdAt: firestore.FieldValue.serverTimestamp(),
          })
          
          // Update local state
          setUserType(userType)
          setUserProfile(profile)
          return
        }
      } catch (apiError) {
        console.log("API registration failed, falling back to Firebase:", apiError)
      }
      
      // Fallback to Firebase
      const userCredential = await auth().createUserWithEmailAndPassword(email, password)
      
      // Save user data to Firestore
      await firestore().collection("users").doc(userCredential.user.uid).set({
        email,
        userType,
        name: profile.name,
        contactNumber: profile.contactNumber,
        gender: profile.gender,
        age: profile.age,
        createdAt: firestore.FieldValue.serverTimestamp(),
      })
      
      // Update local state
      setUserType(userType)
      setUserProfile(profile)
    } catch (error) {
      console.error("Sign up error:", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      // Try API logout first
      try {
        await authApi.logout()
      } catch (apiError) {
        console.log("API logout failed:", apiError)
      }
      
      // Always do Firebase logout
      await auth().signOut()
      await AsyncStorage.removeItem('authToken')
    } catch (error) {
      console.error("Sign out error:", error)
      throw error
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      // Try API forgot password first
      try {
        await authApi.forgotPassword(email)
        return
      } catch (apiError) {
        console.log("API forgot password failed, falling back to Firebase:", apiError)
      }
      
      // Fallback to Firebase
      await auth().sendPasswordResetEmail(email)
    } catch (error) {
      console.error("Forgot password error:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userType,
        userProfile,
        loading,
        signIn,
        signUp,
        signOut,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}