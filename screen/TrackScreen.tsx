import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons'

const TrackScreen = () => {
  const [activeTab, setActiveTab] = useState('current')

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Track Ambulance</Text>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <Image
          source={{ uri: 'https://via.placeholder.com/400x500' }}
          style={styles.mapImage}
          resizeMode="cover"
        />
        
        {/* Ambulance Info Overlay */}
        <View style={styles.ambulanceInfoContainer}>
          <View style={styles.ambulanceInfo}>
            <View style={styles.ambulanceIconContainer}>
              <Icon name="local-hospital" size={24} color="#fff" />
            </View>
            <View style={styles.ambulanceDetails}>
              <Text style={styles.ambulanceId}>Ambulance #A-123</Text>
              <Text style={styles.ambulanceEta}>ETA: 8 mins</Text>
              <View style={styles.ambulanceStatus}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>On the way</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.callDriverButton}>
              <Icon name="call" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

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

      {/* Tracking Details */}
      <View style={styles.trackingDetailsContainer}>
        <View style={styles.detailItem}>
          <View style={styles.detailIconContainer}>
            <Icon name="access-time" size={20} color="#e74c3c" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Request Time</Text>
            <Text style={styles.detailValue}>10:30 AM</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <View style={styles.detailIconContainer}>
            <Icon name="location-on" size={20} color="#e74c3c" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Pickup Location</Text>
            <Text style={styles.detailValue}>123 Main Street, Cityville</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <View style={styles.detailIconContainer}>
            <Icon name="local-hospital" size={20} color="#e74c3c" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Destination</Text>
            <Text style={styles.detailValue}>City General Hospital</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <View style={styles.detailIconContainer}>
            <Icon name="person" size={20} color="#e74c3c" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Driver</Text>
            <Text style={styles.detailValue}>John Smith</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>CANCEL REQUEST</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton}>
          <Icon name="share" size={20} color="#fff" />
          <Text style={styles.shareButtonText}>SHARE LOCATION</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    height: 300,
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
})