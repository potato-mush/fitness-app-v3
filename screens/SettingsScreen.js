import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomNavigation from "./BottomNavigation"; // Import BottomNavigation component
import { useNavigation } from "@react-navigation/native";
import { auth } from '../firebase/config';

const SettingsScreen = () => {
  const navigation = useNavigation();

  // Ensure activeTab is updated when the screen loads
  useEffect(() => {
    navigation.setOptions({ tabBarVisible: false }); // Optional, hide tab bar on this screen if necessary
  }, [navigation]);

  const openLink = (url) => {
    Linking.openURL(url);
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigation.replace('Login'); // Navigate to Login screen after signing out
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.settingsContainer}>
        <TouchableOpacity
          style={styles.item}
          onPress={() => openLink("https://example.com/rate-us")}
        >
          <Ionicons name="star" size={24} color="#15B392" />
          <Text style={styles.text}>Rate Us</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => openLink("https://example.com/feedback")}
        >
          <Ionicons name="chatbubbles" size={24} color="#15B392" />
          <Text style={styles.text}>Feedback</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => openLink("https://example.com/privacy-policy")}
        >
          <Ionicons name="document-text" size={24} color="#15B392" />
          <Text style={styles.text}>Privacy Policy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={handleSignOut}>
          <Ionicons name="log-out" size={24} color="#f44336" />
          <Text style={[styles.text, styles.signOutText]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      <BottomNavigation /> {/* Add BottomNavigation component here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  settingsContainer: {
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },
  text: {
    fontSize: 18,
    marginLeft: 15,
  },
  signOutText: {
    color: '#f44336',
  },
});

export default SettingsScreen;
