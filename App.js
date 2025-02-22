import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { FitnessContext } from './Context';
import StackNavigator from './StackNavigator';
import { StatusBar } from 'expo-status-bar';
import { auth } from './firebase/config';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Remove timeout and check auth state immediately
        await auth._initializationPromise;
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <FitnessContext>
      <StatusBar style="light" backgroundColor='#000' />
      <StackNavigator />
    </FitnessContext>
  );
}
