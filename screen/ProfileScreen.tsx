"use client"

import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Modal, TextInput, Linking, Image, ActivityIndicator } from "react-native"
import { useState, useEffect } from "react"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useAuth } from "../context/AuthContext"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as ImagePicker from 'react-native-image-picker'
import { userApi } from "../services/api"

// Define interface for emergency contact
interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  relation: string;
}

const ProfileScreen = () => {
  const { user, userType, userProfile, signOut } = useAuth()
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [newContactName, setNewContactName] = useState('')
  const [newContactNumber, setNewContactNumber] = useState('')
  const [newContactRelation, setNewContactRelation] = useState('')
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([])
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [contactsLoading, setContactsLoading] = useState(false)

  // Add this console log to debug
  console.log("Profile data:", { userType, userProfile, userEmail: user?.email })

  // Load profile image from storage
  const loadProfileImage = async () => {
    try {
      const storedImage = await AsyncStorage.getItem('profileImage')
      if (storedImage) {
        setProfileImage(storedImage)
      }
    } catch (error) {
      console.log('Error loading profile image:', error)
    }
  }

  // Save profile image to storage
  const saveProfileImage = async (imageUri: string) => {
    try {
      await AsyncStorage.setItem('profileImage', imageUri)
    } catch (error) {
      console.log('Error saving profile image:', error)
    }
  }

  // Load emergency contacts from API or storage
  const loadEmergencyContacts = async () => {
    if (!user?.uid) return
    
    setContactsLoading(true)
    try {
      // Try to get contacts from API first
      try {
        const response = await userApi.getEmergencyContacts(user.uid)
        if (response.data) {
          setEmergencyContacts(response.data)
          // Also update local storage as backup
          await AsyncStorage.setItem('emergencyContacts', JSON.stringify(response.data))
          setContactsLoading(false)
          return
        }
      } catch (apiError) {
        console.log('API get contacts failed, falling back to local storage:', apiError)
      }
      
      // Fallback to local storage
      const storedContacts = await AsyncStorage.getItem('emergencyContacts')
      if (storedContacts) {
        setEmergencyContacts(JSON.parse(storedContacts))
      }
    } catch (error) {
      console.log('Error loading emergency contacts:', error)
    } finally {
      setContactsLoading(false)
    }
  }

  // Save emergency contacts to API and storage
  const saveEmergencyContacts = async (contacts: EmergencyContact[]) => {
    try {
      // Save to local storage first as backup
      await AsyncStorage.setItem('emergencyContacts', JSON.stringify(contacts))
      
      // Then try to save to API if user is logged in
      if (user?.uid) {
        try {
          // We would need to implement proper API calls here
          // This is just a placeholder for the actual API implementation
          // await userApi.updateEmergencyContacts(user.uid, contacts)
        } catch (apiError) {
          console.log('API save contacts failed:', apiError)
        }
      }
    } catch (error) {
      console.log('Error saving emergency contacts:', error)
    }
  }

  // Add a new emergency contact
  const addEmergencyContact = async () => {
    if (!newContactName.trim()) {
      Alert.alert('Error', 'Please enter a contact name')
      return
    }
    
    if (!newContactNumber.trim()) {
      Alert.alert('Error', 'Please enter a contact number')
      return
    }
    
    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      name: newContactName.trim(),
      number: newContactNumber.trim(),
      relation: newContactRelation.trim() || 'Contact'
    }
    
    setLoading(true)
    
    try {
      // Try to add contact via API first
      if (user?.uid) {
        try {
          const response = await userApi.addEmergencyContact(user.uid, newContact)
          if (response.data) {
            // If API call succeeds, update local state with the returned contact
            const updatedContacts = [...emergencyContacts, response.data]
            setEmergencyContacts(updatedContacts)
            await saveEmergencyContacts(updatedContacts)
            
            // Reset form and close modal
            setNewContactName('')
            setNewContactNumber('')
            setNewContactRelation('')
            setModalVisible(false)
            setLoading(false)
            return
          }
        } catch (apiError) {
          console.log('API add contact failed, falling back to local storage:', apiError)
        }
      }
      
      // Fallback to local storage
      const updatedContacts = [...emergencyContacts, newContact]
      setEmergencyContacts(updatedContacts)
      await saveEmergencyContacts(updatedContacts)
      
      // Reset form and close modal
      setNewContactName('')
      setNewContactNumber('')
      setNewContactRelation('')
      setModalVisible(false)
    } catch (error) {
      Alert.alert('Error', 'Failed to add contact. Please try again.')
      console.log('Error adding contact:', error)
    } finally {
      setLoading(false)
    }
  }

  // Delete an emergency contact
  const deleteEmergencyContact = async (id: string) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true)
            
            try {
              // Try to delete via API first
              if (user?.uid) {
                try {
                  await userApi.deleteEmergencyContact(user.uid, id)
                  // If API call succeeds, update local state
                  const updatedContacts = emergencyContacts.filter(contact => contact.id !== id)
                  setEmergencyContacts(updatedContacts)
                  await saveEmergencyContacts(updatedContacts)
                  setLoading(false)
                  return
                } catch (apiError) {
                  console.log('API delete contact failed, falling back to local storage:', apiError)
                }
              }
              
              // Fallback to local storage
              const updatedContacts = emergencyContacts.filter(contact => contact.id !== id)
              setEmergencyContacts(updatedContacts)
              await saveEmergencyContacts(updatedContacts)
            } catch (error) {
              Alert.alert('Error', 'Failed to delete contact. Please try again.')
              console.log('Error deleting contact:', error)
            } finally {
              setLoading(false)
            }
          }
        }
      ]
    )
  }

  // Make a phone call
  const makePhoneCall = (phoneNumber: string) => {
    const cleanedNumber = phoneNumber.replace(/[^\d+]/g, '')
    
    Linking.canOpenURL(`tel:${cleanedNumber}`)
      .then(supported => {
        if (!supported) {
          Alert.alert('Error', 'Phone calls are not supported on this device')
          return
        }
        return Linking.openURL(`tel:${cleanedNumber}`)
      })
      .catch(error => {
        Alert.alert('Error', 'An error occurred while trying to make the call')
        console.log('Error making phone call:', error)
      })
  }

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

  // Format gender text for display
  const formatGender = (gender: string | undefined) => {
    if (!gender) return "Not provided"
    return gender.charAt(0).toUpperCase() + gender.slice(1)
  }

  // Handle selecting image from gallery
  const selectImageFromGallery = () => {
    const options = {
      title: 'Select Profile Photo',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      mediaType: 'photo' as const,
    }

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker')
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage)
        Alert.alert('Error', 'There was an error selecting the image')
      } else if (response.assets && response.assets.length > 0) {
        const source = response.assets[0].uri
        if (source) {
          setProfileImage(source)
          saveProfileImage(source)
        }
      }
    })
  }

  // Handle taking a photo with camera
  const takePhoto = () => {
    const options = {
      title: 'Take Profile Photo',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      mediaType: 'photo' as const,
    }

    ImagePicker.launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera')
      } else if (response.errorCode) {
        console.log('Camera Error: ', response.errorMessage)
        Alert.alert('Error', 'There was an error taking the photo')
      } else if (response.assets && response.assets.length > 0) {
        const source = response.assets[0].uri
        if (source) {
          setProfileImage(source)
          saveProfileImage(source)
        }
      }
    })
  }

  // Show image selection options
  const showImageOptions = () => {
    Alert.alert(
      'Profile Photo',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: selectImageFromGallery },
        ...(profileImage ? [{ text: 'Remove Photo', onPress: () => {
          setProfileImage(null)
          AsyncStorage.removeItem('profileImage')
        }}] : [])
      ]
    )
  }

  // Load emergency contacts and profile image on component mount
  useEffect(() => {
    loadEmergencyContacts()
    loadProfileImage()
  }, [user])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Profile Info */}
        <View style={styles.profileInfoContainer}>
          <TouchableOpacity onPress={showImageOptions}>
            {profileImage ? (
              <View style={styles.avatarContainer}>
                <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                <View style={styles.editIconContainer}>
                  <Icon name="edit" size={16} color="#fff" />
                </View>
              </View>
            ) : (
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{getInitials()}</Text>
                <View style={styles.editIconContainer}>
                  <Icon name="edit" size={16} color="#fff" />
                </View>
              </View>
            )}
          </TouchableOpacity>
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
                <Text style={styles.infoValue}>{formatGender(userProfile?.gender)}</Text>
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
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <Icon name="add" size={20} color="#e74c3c" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoCard}>
            {contactsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#e74c3c" />
                <Text style={styles.loadingText}>Loading contacts...</Text>
              </View>
            ) : emergencyContacts.length > 0 ? (
              emergencyContacts.map(contact => (
                <TouchableOpacity 
                  key={contact.id} 
                  style={styles.contactItem}
                  onPress={() => makePhoneCall(contact.number)}
                >
                  <View style={styles.contactIconContainer}>
                    <Icon name="person" size={20} color="#fff" />
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactRelation}>
                      {contact.relation} • {contact.number}
                    </Text>
                  </View>
                  <View style={styles.contactActions}>
                    <TouchableOpacity 
                      style={styles.callButton}
                      onPress={() => makePhoneCall(contact.number)}
                    >
                      <Icon name="call" size={20} color="#e74c3c" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => deleteEmergencyContact(contact.id)}
                    >
                      <Icon name="delete-outline" size={20} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.contactItem}>
                <View style={styles.contactIconContainer}>
                  <Icon name="person-add" size={20} color="#fff" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>Add Emergency Contact</Text>
                  <Text style={styles.contactRelation}>Add someone who can be contacted in case of emergency</Text>
                </View>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => setModalVisible(true)}
                >
                  <Icon name="add" size={20} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            )}
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

      {/* Add Contact Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Emergency Contact</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Contact Name*</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter name"
                value={newContactName}
                onChangeText={setNewContactName}
              />
              
              <Text style={styles.inputLabel}>Phone Number*</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter phone number"
                value={newContactNumber}
                onChangeText={setNewContactNumber}
                keyboardType="phone-pad"
              />
              
              <Text style={styles.inputLabel}>Relationship</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="E.g. Parent, Spouse, Friend"
                value={newContactRelation}
                onChangeText={setNewContactRelation}
              />
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={addEmergencyContact}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Contact</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    position: "relative",
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#e74c3c",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
    borderBottomWidth: 1,
    borderBottomColor: "#f1f2f6",
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
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: "#f8f9fa",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  callButton: {
    backgroundColor: "#f8f9fa",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
  },
  deleteButton: {
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
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#7f8c8d",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalBody: {
    padding: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 5,
  },
  modalInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 5,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
})