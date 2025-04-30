import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import React, { useState } from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons'

const EmergencyScreen = () => {
  const [location, setLocation] = useState('Current Location')
  const [emergencyType, setEmergencyType] = useState('')

  const emergencyTypes = [
    { id: 1, name: 'Medical', icon: 'medical-services' },
    { id: 2, name: 'Accident', icon: 'car-crash' },
    { id: 3, name: 'Fire', icon: 'local-fire-department' },
    { id: 4, name: 'Police', icon: 'local-police' },
  ]

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
              value={location}
              onChangeText={setLocation}
            />
            <TouchableOpacity style={styles.refreshButton}>
              <Icon name="my-location" size={20} color="#e74c3c" />
            </TouchableOpacity>
          </View>
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
          />
        </View>

        {/* Request Ambulance Button */}
        <TouchableOpacity style={styles.requestButton}>
          <Text style={styles.requestButtonText}>REQUEST AMBULANCE</Text>
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