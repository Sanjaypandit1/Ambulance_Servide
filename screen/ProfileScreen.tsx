"use client"

import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from "react-native"
import { useState } from "react"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useAuth } from "../context/AuthContext"

const ProfileScreen = () => {
  const { user, userType, userProfile, signOut } = useAuth()
  const [loading, setLoading] = useState(false)

  // Add this console log to debug
  console.log("Profile data:", { userType, userProfile, userEmail: user?.email })

  const handleSignOut = async () => {
    try {
      setLoading(true)
      await signOut()
    } catch (error) {
      Alert.alert("Error", "Failed to sign out. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (userProfile?.name) {
      const names = userProfile.name.split(" ")
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase()
      }
      return userProfile.name.substring(0, 2).toUpperCase()
    }
    return "U"
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Profile Info */}
        <View style={styles.profileInfoContainer}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
          <Text style={styles.profileName}>{userProfile?.name || "User"}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          <View style={styles.accountTypeContainer}>
            <Icon name={userType === "driver" ? "drive-eta" : "person"} size={16} color="#fff" />
            <Text style={styles.accountTypeText}>{userType === "driver" ? "Driver" : "User"}</Text>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Icon name="person" size={20} color="#e74c3c" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{userProfile?.name || "Not provided"}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Icon name="phone" size={20} color="#e74c3c" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Contact Number</Text>
                <Text style={styles.infoValue}>{userProfile?.contactNumber || "Not provided"}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Icon name="wc" size={20} color="#e74c3c" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Gender</Text>
                <Text style={styles.infoValue}>
                  {userProfile?.gender
                    ? userProfile.gender.charAt(0).toUpperCase() + userProfile.gender.slice(1)
                    : "Not provided"}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Icon name="cake" size={20} color="#e74c3c" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Age</Text>
                <Text style={styles.infoValue}>{userProfile?.age || "Not provided"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Emergency Contacts */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          <View style={styles.infoCard}>
            <View style={styles.contactItem}>
              <View style={styles.contactIconContainer}>
                <Icon name="person" size={20} color="#fff" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>Add Emergency Contact</Text>
                <Text style={styles.contactRelation}>Add someone who can be contacted in case of emergency</Text>
              </View>
              <TouchableOpacity style={styles.addButton}>
                <Icon name="add" size={20} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.infoCard}>
            <View style={styles.emptyStateContainer}>
              <Icon name="history" size={40} color="#e0e0e0" />
              <Text style={styles.emptyStateText}>No recent activity</Text>
              <Text style={styles.emptyStateSubtext}>Your ambulance request history will appear here</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut} disabled={loading}>
          <Icon name="logout" size={20} color="#fff" />
          <Text style={styles.logoutText}>{loading ? "Signing Out..." : "Logout"}</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  )
}

export default ProfileScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: "#fff",
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#e74c3c",
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  profileInfoContainer: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e74c3c",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  avatarText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  profileEmail: {
    color: "#7f8c8d",
    marginBottom: 15,
  },
  accountTypeContainer: {
    flexDirection: "row",
    backgroundColor: "#e74c3c",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    alignItems: "center",
  },
  accountTypeText: {
    color: "#fff",
    fontWeight: "500",
    marginLeft: 5,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2c3e50",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    elevation: 2,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f2f6",
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    color: "#7f8c8d",
    fontSize: 12,
  },
  infoValue: {
    fontWeight: "500",
    fontSize: 14,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  contactIconContainer: {
    backgroundColor: "#e74c3c",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  contactInfo: {
    marginLeft: 15,
    flex: 1,
  },
  contactName: {
    fontWeight: "bold",
    fontSize: 14,
  },
  contactRelation: {
    color: "#7f8c8d",
    fontSize: 12,
  },
  addButton: {
    backgroundColor: "#f8f9fa",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateContainer: {
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 10,
    color: "#2c3e50",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    marginTop: 5,
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#e74c3c",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 10,
  },
  versionContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  versionText: {
    color: "#95a5a6",
    fontSize: 12,
  },
})
