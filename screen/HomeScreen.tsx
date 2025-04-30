import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Modal, FlatList, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useNavigation, useFocusEffect, NavigationProp } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Linking } from 'react-native'

// Define types for your emergency data
type EmergencyData = {
  id: string;
  timestamp: number;
  location: string;
  type: 'Medical' | 'Accident' | 'Fire' | 'Police';
  additionalInfo?: string;
  status?: 'In Progress' | 'Completed' | 'Cancelled';
}

// Define emergency contact type
interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  relation: string;
}

// Define your root stack param list
type RootStackParamList = {
  Emergency: undefined;
  Track: { emergencyData: EmergencyData };
  Home: undefined;
  Profile: undefined;
};

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const [recentActivities, setRecentActivities] = useState<EmergencyData[]>([])
  const [currentEmergency, setCurrentEmergency] = useState<EmergencyData | null>(null)
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([])
  const [contactsModalVisible, setContactsModalVisible] = useState(false)

  // Format timestamp to readable time
  const formatTime = (timestamp: number): string => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  // Format date for activity display
  const formatActivityDate = (timestamp: number): string => {
    if (!timestamp) return ''
    
    const now = new Date()
    const activityDate = new Date(timestamp)
    
    // Check if it's today
    if (now.toDateString() === activityDate.toDateString()) {
      return `Today, ${formatTime(timestamp)}`
    }
    
    // Check if it's yesterday
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    if (yesterday.toDateString() === activityDate.toDateString()) {
      return `Yesterday, ${formatTime(timestamp)}`
    }
    
    // Otherwise return the date
    return `${activityDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${formatTime(timestamp)}`
  }

  // Navigate to emergency screen
  const navigateToEmergency = () => {
    navigation.navigate('Emergency')
  }

  // Navigate to track screen for current emergency
  const navigateToTrack = () => {
    if (currentEmergency) {
      navigation.navigate('Track', { emergencyData: currentEmergency })
    }
  }

  // Navigate to profile screen
  const navigateToProfile = () => {
    navigation.navigate('Profile')
  }

  // Load emergency contacts
  const loadEmergencyContacts = async () => {
    try {
      const storedContacts = await AsyncStorage.getItem('emergencyContacts')
      if (storedContacts) {
        setEmergencyContacts(JSON.parse(storedContacts))
      }
    } catch (error) {
      console.log('Error loading emergency contacts:', error)
    }
  }

  // Make a phone call
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

  // Show emergency contacts modal
  const showEmergencyContacts = () => {
    loadEmergencyContacts()
    setContactsModalVisible(true)
  }

  // Load recent activities and current emergency
  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        try {
          // Load recent activities
          const storedActivities = await AsyncStorage.getItem('recentActivities')
          if (storedActivities) {
            setRecentActivities(JSON.parse(storedActivities))
          }
          
          // Load current emergency
          const storedEmergency = await AsyncStorage.getItem('currentEmergency')
          if (storedEmergency) {
            setCurrentEmergency(JSON.parse(storedEmergency))
          } else {
            setCurrentEmergency(null)
          }

          // Load emergency contacts
          loadEmergencyContacts()
        } catch (error) {
          console.log('Error loading data:', error)
        }
      }
      
      loadData()
    }, [])
  )

  // Render emergency contact item
  const renderContactItem = ({ item }: { item: EmergencyContact }) => (
    <TouchableOpacity 
      style={styles.modalContactItem}
      onPress={() => makePhoneCall(item.number)}
    >
      <View style={styles.contactIconContainer}>
        <Icon name="person" size={20} color="#fff" />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactRelation}>
          {item.relation} • {item.number}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.callButton}
        onPress={() => makePhoneCall(item.number)}
      >
        <Icon name="call" size={20} color="#e74c3c" />
      </TouchableOpacity>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Emergency Service</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Icon name="notifications" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Emergency Services Section */}
        <View style={styles.emergencyBanner}>
          <Text style={styles.bannerText}>Emergency Services</Text>
          <TouchableOpacity 
            style={styles.sosButton}
            onPress={navigateToEmergency}
          >
            <Icon name="warning" size={24} color="#fff" />
            <Text style={styles.sosButtonText}>SOS</Text>
          </TouchableOpacity>
        </View>

        {/* Current Emergency Alert (if any) */}
        {currentEmergency && (
          <TouchableOpacity 
            style={styles.currentEmergencyContainer}
            onPress={navigateToTrack}
          >
            <View style={styles.currentEmergencyContent}>
              <Icon name="local-hospital" size={24} color="#fff" />
              <View style={styles.currentEmergencyTextContainer}>
                <Text style={styles.currentEmergencyTitle}>Active Emergency</Text>
                <Text style={styles.currentEmergencySubtitle}>
                  {currentEmergency.type} • Tap to view status
                </Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={navigateToEmergency}
          >
            <View style={styles.actionIconContainer}>
              <Icon name="local-hospital" size={24} color="#e74c3c" />
            </View>
            <Text style={styles.actionText}>Call Ambulance</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIconContainer}>
              <Icon name="medical-services" size={24} color="#e74c3c" />
            </View>
            <Text style={styles.actionText}>First Aid</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={showEmergencyContacts}
          >
            <View style={styles.actionIconContainer}>
              <Icon name="people" size={24} color="#e74c3c" />
            </View>
            <Text style={styles.actionText}>Emergency Contacts</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={navigateToEmergency}
          >
            <View style={styles.actionIconContainer}>
              <Icon name="warning" size={24} color="#e74c3c" />
            </View>
            <Text style={styles.actionText}>Emergency Help</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityContainer}>
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <TouchableOpacity 
                key={activity.id || index} 
                style={styles.activityItem}
                onPress={() => {
                  if (activity.status === 'In Progress') {
                    navigation.navigate('Track', { emergencyData: activity })
                  }
                }}
              >
                <View style={styles.activityIconContainer}>
                  <Icon 
                    name={
                      activity.type === 'Medical' ? 'medical-services' : 
                      activity.type === 'Accident' ? 'car-crash' :
                      activity.type === 'Fire' ? 'local-fire-department' :
                      activity.type === 'Police' ? 'local-police' : 'history'
                    } 
                    size={20} 
                    color="#e74c3c" 
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>
                    {activity.type || 'Ambulance'} Request
                  </Text>
                  <Text style={styles.activityTime}>
                    {formatActivityDate(activity.timestamp)}
                  </Text>
                  <Text style={[
                    styles.activityStatus,
                    activity.status === 'Completed' ? styles.statusCompleted :
                    activity.status === 'Cancelled' ? styles.statusCancelled :
                    styles.statusInProgress
                  ]}>
                    {activity.status || 'Completed'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyStateContainer}>
              <Icon name="history" size={40} color="#e0e0e0" />
              <Text style={styles.emptyStateText}>No recent activity</Text>
              <Text style={styles.emptyStateSubtext}>Your ambulance request history will appear here</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Emergency Contacts Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={contactsModalVisible}
        onRequestClose={() => setContactsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Emergency Contacts</Text>
              <TouchableOpacity onPress={() => setContactsModalVisible(false)}>
                <Icon name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              {emergencyContacts.length > 0 ? (
                <FlatList
                  data={emergencyContacts}
                  renderItem={renderContactItem}
                  keyExtractor={item => item.id}
                  contentContainerStyle={styles.contactsList}
                />
              ) : (
                <View style={styles.emptyContactsContainer}>
                  <Icon name="people" size={40} color="#e0e0e0" />
                  <Text style={styles.emptyStateText}>No emergency contacts</Text>
                  <Text style={styles.emptyStateSubtext}>Add emergency contacts in your profile</Text>
                  <TouchableOpacity 
                    style={styles.addContactsButton}
                    onPress={() => {
                      setContactsModalVisible(false)
                      navigateToProfile()
                    }}
                  >
                    <Text style={styles.addContactsButtonText}>Go to Profile</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  notificationButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  emergencyBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  bannerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sosButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  currentEmergencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  currentEmergencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentEmergencyTextContainer: {
    marginLeft: 10,
  },
  currentEmergencyTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  currentEmergencySubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10,
    color: '#2c3e50',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2,
  },
  actionIconContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionText: {
    textAlign: 'center',
    fontWeight: '500',
  },
  activityContainer: {
    marginBottom: 20,
  },
  activityItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  activityIconContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  activityTime: {
    color: '#7f8c8d',
    fontSize: 12,
    marginBottom: 5,
  },
  activityStatus: {
    fontWeight: '500',
  },
  statusCompleted: {
    color: '#27ae60',
  },
  statusCancelled: {
    color: '#e74c3c',
  },
  statusInProgress: {
    color: '#f39c12',
  },
  emptyStateContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 10,
    color: '#2c3e50',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 5,
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
    maxHeight: '80%',
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
    maxHeight: '80%',
  },
  contactsList: {
    paddingBottom: 20,
  },
  modalContactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  contactIconContainer: {
    backgroundColor: '#e74c3c',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    marginLeft: 15,
    flex: 1,
  },
  contactName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  contactRelation: {
    color: '#7f8c8d',
    fontSize: 12,
  },
  callButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContactsContainer: {
    alignItems: 'center',
    padding: 20,
  },
  addContactsButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 5,
    padding: 12,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  addContactsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
})