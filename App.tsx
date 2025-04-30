"use client"

import { StyleSheet } from "react-native"
import { useEffect, useState } from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import Icon from "react-native-vector-icons/MaterialIcons"
import HomeScreen from "./screen/HomeScreen"
import ProfileScreen from "./screen/ProfileScreen"
import TrackScreen from "./screen/TrackScreen"
import LoginSelectionScreen from "./screen/loginpage"
import EmergencyScreen from "./screen/EmergencyScreen"
import { AuthProvider, useAuth } from "./context/AuthContext"

// Navigation types
type TabParamList = {
  Home: undefined
  Profile: undefined
  Track: undefined
  Emergency: undefined
}

type RootStackParamList = {
  Login: undefined
  MainApp: undefined
}

type HomeStackParamList = {
  Home: undefined
}

const Tab = createBottomTabNavigator<TabParamList>()
const Stack = createStackNavigator<RootStackParamList>()
const HomeStack = createStackNavigator<HomeStackParamList>()

// Tab Bar Icon function with ambulance-themed icons
function TabBarIcon({
  color,
  route,
}: {
  color: string
  route: keyof TabParamList
}) {
  const iconSize = 28

  const iconMap = {
    Home: "home",
    Profile: "account-circle",
    Track: "map",
    Emergency: "emergency",
  }

  return <Icon name={iconMap[route]} size={iconSize} color={color} />
}

// Home Stack Navigator
const HomeStackScreen = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="Home" component={HomeScreen} />
  </HomeStack.Navigator>
)

// Main Tab Navigator with red theme
const MainApp = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color }) => <TabBarIcon route={route.name} color={color} />,
        tabBarActiveTintColor: "#e74c3c",
        tabBarInactiveTintColor: "#95a5a6",
        tabBarStyle: {
          backgroundColor: "#fff",
          height: 60,
          padding: 10,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} options={{ tabBarLabel: "Home" }} />
      <Tab.Screen name="Emergency" component={EmergencyScreen} options={{ tabBarLabel: "Emergency" }} />
      <Tab.Screen name="Track" component={TrackScreen} options={{ tabBarLabel: "Track" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: "Profile" }} />
    </Tab.Navigator>
  )
}

// Authentication Flow Component
const AuthFlow = () => {
  const { user, loading } = useAuth()
  const [initializing, setInitializing] = useState(true)

  // Handle user state changes
  useEffect(() => {
    if (!loading) {
      setInitializing(false)
    }
  }, [loading])

  if (initializing) {
    return null // Or a loading screen
  }

  return (
    <Stack.Navigator
      initialRouteName={user ? "MainApp" : "Login"}
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "#fff" },
      }}
    >
      {user ? (
        <Stack.Screen name="MainApp" component={MainApp} />
      ) : (
        <Stack.Screen name="Login" component={LoginSelectionScreen} />
      )}
    </Stack.Navigator>
  )
}

// Root App Component
const App = () => {
  return (
    <NavigationContainer>
      <AuthProvider>
        <AuthFlow />
      </AuthProvider>
    </NavigationContainer>
  )
}

export default App

const styles = StyleSheet.create({
  // Add global styles if needed
})
