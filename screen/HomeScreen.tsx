import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useNavigation, useFocusEffect, NavigationProp } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Define types for your emergency data
type EmergencyData = {
  id: string;
  timestamp: number;
  location: string;
  type: 'Medical' | 'Accident' | 'Fire' | 'Police';
  additionalInfo?: string;
  status?: 'In Progress' | 'Completed' | 'Cancelled';
}

// Define your root stack param list
type RootStackParamList = {
  Emergency: undefined;
  Track: { emergencyData: EmergencyData };
  Home: undefined;
};

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const [recentActivities, setRecentActivities] = useState<EmergencyData[]>([])
  const [currentEmergency, setCurrentEmergency] = useState<EmergencyData | null>(null)

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
        } catch (error) {
          console.log('Error loading data:', error)
        }
      }
      
      loadData()
    }, [])
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
          
          <TouchableOpacity style={styles.actionButton}>
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
})