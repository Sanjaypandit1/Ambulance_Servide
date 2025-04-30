import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, FlatList, SafeAreaView, StatusBar } from 'react-native'
import React, { useState, useEffect } from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useRoute, useNavigation, RouteProp, NavigationProp } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Define types for your emergency data
type EmergencyData = {
  id: string;
  timestamp: number;
  location: string;
  type: 'Medical' | 'Accident' | 'Fire' | 'Police';
  additionalInfo?: string;
  status?: string;
}

// Define your root stack param list
type RootStackParamList = {
  TrackScreen: {
    emergencyData?: EmergencyData;
  };
  Home: undefined;
  // Add other screens here as needed
};

// Extract the route prop type for TrackScreen
type TrackScreenRouteProp = RouteProp<RootStackParamList, 'TrackScreen'>;

const TrackScreen = () => {
  const route = useRoute<TrackScreenRouteProp>()
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current')
  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyData[]>([])
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyData | null>(null)
  
  // Format timestamp to readable time
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  // Format date to readable date
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Get icon based on emergency type
  const getEmergencyIcon = (type: string) => {
    switch(type) {
      case 'Medical':
        return 'medical-services'
      case 'Accident':
        return 'car-crash'
      case 'Fire':
        return 'local-fire-department'
      case 'Police':
        return 'local-police'
      default:
        return 'local-hospital'
    }
  }

  // Get color based on emergency type
  const getEmergencyColor = (type: string) => {
    switch(type) {
      case 'Medical':
        return '#e74c3c' // Red
      case 'Accident':
        return '#f39c12' // Orange
      case 'Fire':
        return '#d35400' // Dark Orange
      case 'Police':
        return '#3498db' // Blue
      default:
        return '#e74c3c'
    }
  }

  // Load emergency data
  useEffect(() => {
    const loadEmergencyData = async () => {
      try {
        // First check if data was passed via navigation
        if (route.params?.emergencyData) {
          const newEmergency = route.params.emergencyData
          
          // Load existing emergencies
          const storedEmergencies = await AsyncStorage.getItem('activeEmergencies')
          let emergencies: EmergencyData[] = storedEmergencies ? JSON.parse(storedEmergencies) : []
          
          // Check if this emergency already exists
          const existingIndex = emergencies.findIndex(e => e.id === newEmergency.id)
          
          if (existingIndex >= 0) {
            // Update existing emergency
            emergencies[existingIndex] = newEmergency
          } else {
            // Add new emergency
            emergencies = [newEmergency, ...emergencies]
          }
          
          // Save updated emergencies
          await AsyncStorage.setItem('activeEmergencies', JSON.stringify(emergencies))
          
          setEmergencyRequests(emergencies)
          setSelectedEmergency(newEmergency)
          return
        }
        
        // Otherwise try to load from storage
        const storedEmergencies = await AsyncStorage.getItem('activeEmergencies')
        if (storedEmergencies) {
          const emergencies: EmergencyData[] = JSON.parse(storedEmergencies)
          setEmergencyRequests(emergencies)
          
          if (emergencies.length > 0) {
            setSelectedEmergency(emergencies[0])
          }
        }
      } catch (error) {
        console.log('Error loading emergency data:', error)
      }
    }
    
    loadEmergencyData()
  }, [route.params])

  // Handle cancel request
  const handleCancelRequest = (emergency: EmergencyData) => {
    Alert.alert(
      'Cancel Request',
      `Are you sure you want to cancel this ${emergency.type} request?`,
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Update status
              const updatedEmergency: EmergencyData = { 
                ...emergency, 
                status: 'Cancelled' 
              }
              
              // Update active emergencies
              let updatedEmergencies = emergencyRequests.filter(e => e.id !== emergency.id)
              await AsyncStorage.setItem('activeEmergencies', JSON.stringify(updatedEmergencies))
              
              // Update recent activities
              const storedActivities = await AsyncStorage.getItem('recentActivities')
              if (storedActivities) {
                let activities: EmergencyData[] = JSON.parse(storedActivities)
                activities = activities.map(activity => 
                  activity.id === updatedEmergency.id ? updatedEmergency : activity
                )
                await AsyncStorage.setItem('recentActivities', JSON.stringify(activities))
              }
              
              // Update state
              setEmergencyRequests(updatedEmergencies)
              
              // If we're cancelling the selected emergency, select another one
              if (selectedEmergency?.id === emergency.id) {
                if (updatedEmergencies.length > 0) {
                  setSelectedEmergency(updatedEmergencies[0])
                } else {
                  setSelectedEmergency(null)
                  // Navigate back to home if no emergencies left
                  navigation.navigate('Home')
                }
              }
            } catch (error) {
              console.log('Error cancelling request:', error)
            }
          }
        }
      ]
    )
  }

  // Render emergency item
  const renderEmergencyItem = ({ item }: { item: EmergencyData }) => {
    const isSelected = selectedEmergency?.id === item.id
    const color = getEmergencyColor(item.type)
    
    return (
      <TouchableOpacity 
        style={[
          styles.emergencyItem, 
          isSelected && { borderColor: color, borderWidth: 2 }
        ]}
        onPress={() => setSelectedEmergency(item)}
      >
        <View style={[styles.emergencyIconContainer, { backgroundColor: color }]}>
          <Icon name={getEmergencyIcon(item.type)} size={20} color="#fff" />
        </View>
        <View style={styles.emergencyItemContent}>
          <Text style={styles.emergencyItemType}>{item.type}</Text>
          <Text style={styles.emergencyItemTime}>{formatTime(item.timestamp)}</Text>
        </View>
        <View style={[styles.emergencyStatus, { backgroundColor: isSelected ? color : '#f8f9fa' }]}>
          <Text style={{ color: isSelected ? '#fff' : '#2c3e50', fontSize: 10, fontWeight: '500' }}>
            {isSelected ? 'ACTIVE' : 'TRACKING'}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  // Render history item
  const renderHistoryItem = ({ item }: { item: EmergencyData }) => {
    const color = getEmergencyColor(item.type)
    
    return (
      <View style={styles.historyItem}>
        <View style={[styles.emergencyIconContainer, { backgroundColor: color }]}>
          <Icon name={getEmergencyIcon(item.type)} size={20} color="#fff" />
        </View>
        <View style={styles.historyItemContent}>
          <Text style={styles.historyItemType}>{item.type}</Text>
          <Text style={styles.historyItemTime}>{formatDate(item.timestamp)}</Text>
        </View>
        <View style={[styles.historyStatus, { borderColor: color }]}>
          <Text style={{ color: color, fontSize: 10, fontWeight: '500' }}>
            {item.status || 'COMPLETED'}
          </Text>
        </View>
      </View>
    )
  }

  // Load history data
  const [historyData, setHistoryData] = useState<EmergencyData[]>([])
  
  useEffect(() => {
    const loadHistoryData = async () => {
      try {
        const storedActivities = await AsyncStorage.getItem('recentActivities')
        if (storedActivities) {
          const activities: EmergencyData[] = JSON.parse(storedActivities)
          setHistoryData(activities.filter(a => a.status === 'Cancelled' || a.status === 'Completed'))
        }
      } catch (error) {
        console.log('Error loading history data:', error)
      }
    }
    
    if (activeTab === 'history') {
      loadHistoryData()
    }
  }, [activeTab])

  // Get ETA based on emergency type
  const getEta = (type: string) => {
    switch(type) {
      case 'Medical':
        return '8 mins'
      case 'Accident':
        return '10 mins'
      case 'Fire':
        return '5 mins'
      case 'Police':
        return '7 mins'
      default:
        return '8 mins'
    }
  }

  // Get ambulance ID based on emergency type
  const getAmbulanceId = (type: string) => {
    switch(type) {
      case 'Medical':
        return 'Ambulance #A-123'
      case 'Accident':
        return 'Rescue #R-456'
      case 'Fire':
        return 'Fire Truck #F-789'
      case 'Police':
        return 'Police Car #P-101'
      default:
        return 'Vehicle #V-000'
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {selectedEmergency ? `Track ${selectedEmergency.type} Response` : 'Track Emergency'}
        </Text>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <Image
          source={{ uri: 'https://via.placeholder.com/400x500' }}
          style={styles.mapImage}
          resizeMode="cover"
        />
        
        {/* Ambulance Info Overlay */}
        {selectedEmergency && (
          <View style={styles.ambulanceInfoContainer}>
            <View style={[styles.ambulanceInfo, { borderLeftWidth: 4, borderLeftColor: getEmergencyColor(selectedEmergency.type) }]}>
              <View style={[styles.ambulanceIconContainer, { backgroundColor: getEmergencyColor(selectedEmergency.type) }]}>
                <Icon name={getEmergencyIcon(selectedEmergency.type)} size={24} color="#fff" />
              </View>
              <View style={styles.ambulanceDetails}>
                <Text style={styles.ambulanceId}>{getAmbulanceId(selectedEmergency.type)}</Text>
                <Text style={styles.ambulanceEta}>ETA: {getEta(selectedEmergency.type)}</Text>
                <View style={styles.ambulanceStatus}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>On the way</Text>
                </View>
              </View>
              <TouchableOpacity style={[styles.callDriverButton, { backgroundColor: getEmergencyColor(selectedEmergency.type) }]}>
                <Icon name="call" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Emergency Requests List */}
      {emergencyRequests.length > 0 && (
        <View style={styles.emergencyListContainer}>
          <Text style={styles.emergencyListTitle}>Active Requests</Text>
          <FlatList
            data={emergencyRequests}
            renderItem={renderEmergencyItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.emergencyListContent}
          />
        </View>
      )}

      {/* Tracking Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'current' && styles.activeTab]}
          onPress={() => setActiveTab('current')}
        >
          <Text style={[styles.tabText, activeTab === 'current' && styles.activeTabText]}>
            Current
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'current' ? (
        /* Tracking Details */
        selectedEmergency ? (
          <View style={styles.trackingDetailsContainer}>
            <View style={styles.detailItem}>
              <View style={[styles.detailIconContainer, { backgroundColor: `${getEmergencyColor(selectedEmergency.type)}15` }]}>
                <Icon name="access-time" size={20} color={getEmergencyColor(selectedEmergency.type)} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Request Time</Text>
                <Text style={styles.detailValue}>
                  {formatTime(selectedEmergency.timestamp)}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={[styles.detailIconContainer, { backgroundColor: `${getEmergencyColor(selectedEmergency.type)}15` }]}>
                <Icon name="location-on" size={20} color={getEmergencyColor(selectedEmergency.type)} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Pickup Location</Text>
                <Text style={styles.detailValue}>
                  {selectedEmergency.location}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={[styles.detailIconContainer, { backgroundColor: `${getEmergencyColor(selectedEmergency.type)}15` }]}>
                <Icon 
                  name={getEmergencyIcon(selectedEmergency.type)} 
                  size={20} 
                  color={getEmergencyColor(selectedEmergency.type)} 
                />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Emergency Type</Text>
                <Text style={styles.detailValue}>
                  {selectedEmergency.type}
                </Text>
              </View>
            </View>

            {selectedEmergency.additionalInfo && (
              <View style={styles.detailItem}>
                <View style={[styles.detailIconContainer, { backgroundColor: `${getEmergencyColor(selectedEmergency.type)}15` }]}>
                  <Icon name="info" size={20} color={getEmergencyColor(selectedEmergency.type)} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Additional Information</Text>
                  <Text style={styles.detailValue}>{selectedEmergency.additionalInfo}</Text>
                </View>
              </View>
            )}

            <View style={styles.detailItem}>
              <View style={[styles.detailIconContainer, { backgroundColor: `${getEmergencyColor(selectedEmergency.type)}15` }]}>
                <Icon name="person" size={20} color={getEmergencyColor(selectedEmergency.type)} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Responder</Text>
                <Text style={styles.detailValue}>John Smith</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.noEmergencyContainer}>
            <Icon name="info" size={40} color="#7f8c8d" />
            <Text style={styles.noEmergencyText}>No active emergency requests</Text>
          </View>
        )
      ) : (
        /* History List */
        <View style={styles.historyContainer}>
          {historyData.length > 0 ? (
            <FlatList
              data={historyData}
              renderItem={renderHistoryItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.historyListContent}
            />
          ) : (
            <View style={styles.noEmergencyContainer}>
              <Icon name="history" size={40} color="#7f8c8d" />
              <Text style={styles.noEmergencyText}>No history available</Text>
            </View>
          )}
        </View>
      )}

      {/* Action Buttons */}
      {selectedEmergency && activeTab === 'current' && (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.cancelButton, { borderColor: getEmergencyColor(selectedEmergency.type) }]}
            onPress={() => handleCancelRequest(selectedEmergency)}
          >
            <Text style={[styles.cancelButtonText, { color: getEmergencyColor(selectedEmergency.type) }]}>CANCEL REQUEST</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.shareButton, { backgroundColor: getEmergencyColor(selectedEmergency.type) }]}>
            <Icon name="share" size={20} color="#fff" />
            <Text style={styles.shareButtonText}>SHARE LOCATION</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}

export default TrackScreen

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
  mapContainer: {
    height: 150,
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  ambulanceInfoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  ambulanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 5,
  },
  ambulanceIconContainer: {
    backgroundColor: '#e74c3c',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  ambulanceDetails: {
    flex: 1,
  },
  ambulanceId: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  ambulanceEta: {
    fontSize: 14,
    marginBottom: 5,
  },
  ambulanceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#27ae60',
    marginRight: 5,
  },
  statusText: {
    color: '#27ae60',
    fontSize: 12,
  },
  callDriverButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyListContainer: {
    paddingVertical: 15,
    paddingLeft: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  emergencyListTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    color: '#2c3e50',
  },
  emergencyListContent: {
    paddingRight: 15,
  },
  emergencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  emergencyIconContainer: {
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  emergencyItemContent: {
    marginRight: 10,
  },
  emergencyItemType: {
    fontWeight: '600',
    fontSize: 14,
  },
  emergencyItemTime: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  emergencyStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#e74c3c',
  },
  tabText: {
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  trackingDetailsContainer: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 10,
    padding: 15,
    elevation: 2,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailIconContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    color: '#7f8c8d',
    fontSize: 12,
  },
  detailValue: {
    fontWeight: '500',
    fontSize: 14,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e74c3c',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  noEmergencyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  noEmergencyText: {
    marginTop: 10,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  historyContainer: {
    flex: 1,
    margin: 15,
  },
  historyListContent: {
    paddingBottom: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  historyItemContent: {
    flex: 1,
    marginLeft: 10,
  },
  historyItemType: {
    fontWeight: '600',
    fontSize: 14,
  },
  historyItemTime: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  historyStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
})