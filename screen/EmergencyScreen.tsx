import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons'
import Geolocation from 'react-native-geolocation-service'
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { emergencyApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

// Define your root stack param list
type RootStackParamList = {
  Emergency: undefined;
  Track: { emergencyData: EmergencyData };
  Home: undefined;
};

// Define the EmergencyData type
type EmergencyData = {
  id: string;
  type: string;
  location: string;
  coordinates: {
    latitude: number | null;
    longitude: number | null;
  };
  additionalInfo: string;
  timestamp: number;
  status: string;
};

// Create a type for the navigation prop specific to this screen
type EmergencyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Emergency'>;

const EmergencyScreen = () => {
  const navigation = useNavigation<EmergencyScreenNavigationProp>()
  const { user } = useAuth()
  const [location, setLocation] = useState('Current Location')
  const [emergencyType, setEmergencyType] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [coordinates, setCoordinates] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({
    latitude: null,
    longitude: null,
  })
  const [loading, setLoading] = useState(false)

  const emergencyTypes = [
    { id: 1, name: 'Medical', icon: 'medical-services' },
    { id: 2, name: 'Accident', icon: 'car-crash' },
    { id: 3, name: 'Fire', icon: 'local-fire-department' },
    { id: 4, name: 'Police', icon: 'local-police' },
  ]

  // Request location permission
  const requestLocationPermission = async () => {
    try {
      const result = await request(
        Platform.OS === 'ios' 
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE 
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
      )
      
      if (result === RESULTS.GRANTED) {
        getCurrentLocation()
      } else {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to get your current location',
          [{ text: 'OK' }]
        )
      }
    } catch (error) {
      console.log('Error requesting location permission:', error)
    }
  }

  // Get current location using device GPS
  const getCurrentLocation = () => {
    setLoading(true)
    
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords
        setCoordinates({ latitude, longitude })
        
        // Use OpenStreetMap's Nominatim for reverse geocoding
        fetchAddressFromNominatim(latitude, longitude)
      },
      error => {
        setLoading(false)
        Alert.alert('Error', 'Unable to get your location: ' + error.message)
        console.log('Error getting location:', error)
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, 
        maximumAge: 10000 
      }
    )
  }

  // Fetch address from coordinates using OpenStreetMap's Nominatim
  const fetchAddressFromNominatim = async (latitude: number, longitude: number) => {
    try {
      // Add a small delay to avoid rate limiting (Nominatim has a 1 request per second limit)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            // Required by Nominatim's usage policy
            'User-Agent': 'EmergencyApp/1.0'
          }
        }
      )
      
      const data = await response.json()
      
      if (data && data.display_name) {
        setLocation(data.display_name)
      } else {
        // Fallback to coordinates if address lookup fails
        setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
      }
    } catch (error) {
      console.log('Error fetching address:', error)
      // Fallback to coordinates if address lookup fails
      setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
    } finally {
      setLoading(false)
    }
  }

  // Handle ambulance request
  const handleRequestAmbulance = async () => {
    if (!emergencyType) {
      Alert.alert('Error', 'Please select an emergency type')
      return
    }

    if (location === 'Current Location' && !coordinates.latitude) {
      Alert.alert('Error', 'Unable to determine your location. Please try again.')
      return
    }

    // Create emergency request data
    const requestData = {
      userId: user?.uid || 'anonymous',
      type: emergencyType,
      location: location,
      coordinates: coordinates,
      additionalInfo: additionalInfo,
      timestamp: Date.now(),
      status: 'In Progress'
    }

    try {
      setLoading(true)
      
      // Try to use API first
      try {
        const response = await emergencyApi.createEmergency(requestData)
        
        if (response.data) {
          const emergencyData = response.data as EmergencyData
          
          // Save to local storage as backup
          await saveEmergencyToLocalStorage(emergencyData)
          
          // Navigate to track screen with data
          navigation.navigate('Track', { emergencyData })
          return
        }
      } catch (apiError) {
        console.log('API request failed, falling back to local storage:', apiError)
      }
      
      // Fallback to local storage
      const emergencyData: EmergencyData = {
        id: Date.now().toString(),
        ...requestData
      }
      
      await saveEmergencyToLocalStorage(emergencyData)
      
      // Navigate to track screen with data
      navigation.navigate('Track', { emergencyData })
    } catch (error) {
      console.log('Error saving emergency request:', error)
      Alert.alert('Error', 'Failed to process your request. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  // Save emergency to local storage
  const saveEmergencyToLocalStorage = async (emergencyData: EmergencyData) => {
    // Save to recent activities
    const storedActivities = await AsyncStorage.getItem('recentActivities')
    let activities = storedActivities ? JSON.parse(storedActivities) : []
    
    // Add new activity at the beginning
    activities = [emergencyData, ...activities].slice(0, 10) // Keep only 10 most recent
    
    await AsyncStorage.setItem('recentActivities', JSON.stringify(activities))
    
    // Save to active emergencies
    const storedEmergencies = await AsyncStorage.getItem('activeEmergencies')
    let emergencies = storedEmergencies ? JSON.parse(storedEmergencies) : []
    
    // Add new emergency
    emergencies = [emergencyData, ...emergencies]
    
    await AsyncStorage.setItem('activeEmergencies', JSON.stringify(emergencies))
  }

  // Initialize location on component mount
  useEffect(() => {
    requestLocationPermission()
  }, [])
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Emergency</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* SOS Button */}
        <View style={styles.sosContainer}>
          <TouchableOpacity style={styles.sosButton}>
            <Icon name="warning" size={40} color="#fff" />
            <Text style={styles.sosText}>SOS</Text>
          </TouchableOpacity>
          <Text style={styles.sosDescription}>
            Press the SOS button for immediate emergency assistance
          </Text>
        </View>

        {/* Location Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Your Location</Text>
          <View style={styles.locationContainer}>
            <Icon name="location-on" size={24} color="#e74c3c" />
            <TextInput
              style={styles.locationInput}
              value={loading ? "Getting location..." : location}
              onChangeText={setLocation}
            />
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={requestLocationPermission}
              disabled={loading}
            >
              <Icon 
                name={loading ? "sync" : "my-location"} 
                size={20} 
                color="#e74c3c" 
              />
            </TouchableOpacity>
          </View>
          {coordinates.latitude !== null && coordinates.longitude !== null && (
            <Text style={styles.coordinatesText}>
              Coordinates: {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
            </Text>
          )}
        </View>

        {/* Emergency Type */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Emergency Type</Text>
          <View style={styles.emergencyTypesContainer}>
            {emergencyTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.emergencyTypeButton,
                  emergencyType === type.name && styles.selectedEmergencyType,
                ]}
                onPress={() => setEmergencyType(type.name)}
              >
                <Icon
                  name={type.icon}
                  size={24}
                  color={emergencyType === type.name ? '#fff' : '#e74c3c'}
                />
                <Text
                  style={[
                    styles.emergencyTypeText,
                    emergencyType === type.name && styles.selectedEmergencyTypeText,
                  ]}
                >
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Additional Information */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          <TextInput
            style={styles.additionalInfoInput}
            placeholder="Describe your emergency situation..."
            multiline
            numberOfLines={4}
            value={additionalInfo}
            onChangeText={setAdditionalInfo}
          />
        </View>

        {/* Request Ambulance Button */}
        <TouchableOpacity 
          style={styles.requestButton}
          onPress={handleRequestAmbulance}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.requestButtonText}>PROCESSING...</Text>
          ) : (
            <Text style={styles.requestButtonText}>REQUEST AMBULANCE</Text>
          )}
        </TouchableOpacity>

        {/* Emergency Contacts */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <View style={styles.contactsContainer}>
            <TouchableOpacity style={styles.contactItem}>
              <View style={styles.contactIconContainer}>
                <Icon name="local-hospital" size={20} color="#fff" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>Emergency Helpline</Text>
                <Text style={styles.contactNumber}>911</Text>
              </View>
              <TouchableOpacity style={styles.callButton}>
                <Icon name="call" size={20} color="#e74c3c" />
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem}>
              <View style={styles.contactIconContainer}>
                <Icon name="person" size={20} color="#fff" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>Primary Contact</Text>
                <Text style={styles.contactNumber}>+1 234 567 8900</Text>
              </View>
              <TouchableOpacity style={styles.callButton}>
                <Icon name="call" size={20} color="#e74c3c" />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default EmergencyScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
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
  scrollView: {
    flex: 1,
    padding: 15,
  },
  sosContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  sosButton: {
    backgroundColor: '#e74c3c',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  sosText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  sosDescription: {
    textAlign: 'center',
    marginTop: 15,
    color: '#7f8c8d',
    paddingHorizontal: 20,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  locationInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  refreshButton: {
    padding: 5,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
    marginLeft: 10,
  },
  emergencyTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emergencyTypeButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  selectedEmergencyType: {
    backgroundColor: '#e74c3c',
  },
  emergencyTypeText: {
    marginLeft: 10,
    fontWeight: '500',
    color: '#2c3e50',
  },
  selectedEmergencyTypeText: {
    color: '#fff',
  },
  additionalInfoInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    textAlignVertical: 'top',
    elevation: 2,
  },
  requestButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  requestButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  contactsContainer: {
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
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
    flex: 1,
    marginLeft: 15,
  },
  contactName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  contactNumber: {
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
})