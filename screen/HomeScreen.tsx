import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons'

const HomeScreen = () => {
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
          <TouchableOpacity style={styles.sosButton}>
            <Icon name="warning" size={24} color="#fff" />
            <Text style={styles.sosButtonText}>SOS</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
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
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIconContainer}>
              <Icon name="location-on" size={24} color="#e74c3c" />
            </View>
            <Text style={styles.actionText}>Nearby Hospitals</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityContainer}>
          <View style={styles.activityItem}>
            <View style={styles.activityIconContainer}>
              <Icon name="history" size={20} color="#e74c3c" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Ambulance Request</Text>
              <Text style={styles.activityTime}>Today, 10:30 AM</Text>
              <Text style={styles.activityStatus}>Completed</Text>
            </View>
          </View>
          
          <View style={styles.activityItem}>
            <View style={styles.activityIconContainer}>
              <Icon name="history" size={20} color="#e74c3c" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Medical Consultation</Text>
              <Text style={styles.activityTime}>Yesterday, 2:15 PM</Text>
              <Text style={styles.activityStatus}>Completed</Text>
            </View>
          </View>
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
    color: '#27ae60',
    fontWeight: '500',
  },
  tipsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  tipCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  tipImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
  },
  tipTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tipDescription: {
    fontSize: 12,
    color: '#7f8c8d',
  },
})