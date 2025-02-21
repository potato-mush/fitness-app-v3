import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { formatDuration } from '../services/workoutTimerService';

const RewardsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { 
    completedExercises = 0, 
    caloriesBurned = 0,
    xpGained = completedExercises * 10,
    coinsGained = completedExercises * 10,
    staminaCost = 0,
    duration = 0 
  } = route.params || {};
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.5);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.content, 
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <Text style={styles.achievementText}>Workout Complete!</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Image 
              source={require('../assets/avatar/fitness.png')} 
              style={styles.icon} 
            />
            <Text style={[styles.baseStatText, styles.exerciseText]}>
              {completedExercises} exercises
            </Text>
          </View>

          <View style={styles.statRow}>
            <Image 
              source={require('../assets/avatar/calories.png')} 
              style={styles.icon} 
            />
            <Text style={[styles.baseStatText, styles.calorieText]}>
              {Number(caloriesBurned).toFixed(1)} calories
            </Text>
          </View>

          <View style={styles.statRow}>
            <Image 
              source={require('../assets/avatar/level.png')} 
              style={styles.icon} 
            />
            <Text style={styles.xpText}>+{xpGained} xp</Text>
          </View>

          <View style={styles.statRow}>
            <Image 
              source={require('../assets/avatar/coins.png')} 
              style={styles.icon} 
            />
            <Text style={styles.coinsText}>+{coinsGained} coins</Text>
          </View>

          <View style={styles.statRow}>
            <Image 
              source={require('../assets/avatar/flash.png')} 
              style={styles.icon} 
            />
            <Text style={styles.staminaText}>-{staminaCost} stamina</Text>
          </View>

          <View style={styles.statRow}>
            <Image 
              source={require('../assets/avatar/chronometer.png')} 
              style={styles.icon} 
            />
            <Text style={[styles.baseStatText, styles.durationText]}>
              {formatDuration(duration)}
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  achievementText: {
    fontSize: 24,
    color: '#15B392',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  statsContainer: {
    backgroundColor: '#FBFBFB',
    padding: 40,
    borderRadius: 10,
    width: '100%',
    gap: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // for Android shadow
  },
  baseStatText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginTop: 5,
  },
  exerciseText: {
    color: '#32CD32',
  },
  calorieText: {
    color: '#FF6B6B',
  },
  xpText: {
    color: '#d59ee4',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
    flex: 1,
  },
  coinsText: {
    color: '#FFA500',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
    flex: 1,
  },
  staminaText: {
    color: '#D84040',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
    flex: 1,
  },
  button: {
    backgroundColor: '#32CD32',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 30,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bonusText: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    marginRight: 20,
  },
});

export default RewardsScreen;
