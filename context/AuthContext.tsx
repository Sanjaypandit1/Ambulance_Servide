"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext } from "react"
import auth, { type FirebaseAuthTypes } from "@react-native-firebase/auth"
import firestore from "@react-native-firebase/firestore"

type UserType = "user" | "driver" | null

// Define user profile interface
interface UserProfile {
  name: string
  contactNumber: string
  gender: "male" | "female" | "other"
  age: string
}

interface AuthContextData {
  user: FirebaseAuthTypes.User | null
  userType: UserType
  userProfile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextData>({
  user: null,
  userType: null,
  userProfile: null,
  loading: true,
  signOut: async () => {},
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null)
  const [userType, setUserType] = useState<UserType>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(async (user) => {
      if (user) {
        // Get user data from Firestore
        try {
          const userDoc = await firestore().collection("users").doc(user.uid).get()

          if (userDoc.exists) {
            const userData = userDoc.data()
            setUserType((userData?.userType as UserType) || null)

            // Check if profile exists as a nested object first (for backward compatibility)
            if (userData?.profile) {
              setUserProfile(userData.profile as UserProfile)
            }
            // Otherwise, construct profile from individual fields
            else if (userData?.name) {
              setUserProfile({
                name: userData.name,
                contactNumber: userData.contactNumber || "",
                gender: (userData.gender as "male" | "female" | "other") || "male",
                age: userData.age || "",
              })
            } else {
              setUserProfile(null)
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        }
      } else {
        setUserType(null)
        setUserProfile(null)
      }

      setUser(user)
      setLoading(false)
    })

    return () => subscriber()
  }, [])

  const signOut = async () => {
    try {
      await auth().signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, userType, userProfile, loading, signOut }}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
