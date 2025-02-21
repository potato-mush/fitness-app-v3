import { db } from '../firebase/config';
import { doc, setDoc, getDoc, updateDoc, increment, collection, query, where, getDocs } from 'firebase/firestore';

const calculateStreak = (lastWorkout, currentStreak = 0) => {
  if (!lastWorkout) return 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day

  const lastWorkoutDate = new Date(lastWorkout);
  lastWorkoutDate.setHours(0, 0, 0, 0); // Set to start of day

  // If last workout was today, keep current streak
  if (lastWorkoutDate.getTime() === today.getTime()) {
    return currentStreak || 1;
  }

  // If last workout was yesterday, increment streak
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate());
  if (lastWorkoutDate.getTime() === yesterday.getTime()) {
    return (currentStreak || 0) + 1;
  }

  // If more than a day has passed, reset streak
  return 1;
};

export const updateUserProgress = async (userId, updateData) => {
  try {
    console.log('Received update data:', updateData); // Add this for debugging
    console.log('Updating progress with:', updateData);
    
    if (!userId) {
      throw new Error('No user ID provided');
    }

    const userStatsRef = doc(db, 'userStats', userId);
    let userStatsDoc = await getDoc(userStatsRef);
    let currentStats = userStatsDoc.exists() ? userStatsDoc.data() : null;

    if (!currentStats) {
      const initialStats = {
        level: 1,
        xp: 0,
        xpMax: 1000,
        stamina: 100,
        staminaMax: 100,
        chest: 0,
        arms: 0,
        abs: 0,
        legs: 0,
        back: 0,
        totalCalories: 0,
        totalExercises: 0,
        totalDuration: 0, // Add total duration to initial stats
        lastWorkout: null,
        streak: 0,
        coins: 100,
        inventory: {
          energyDrink: 1,
          apple: 1,
          friedEgg: 1,
          chickenLeg: 1,
        },
        workoutDates: {},  // Add workoutDates to initial stats
      };
      await setDoc(userStatsRef, initialStats);
      currentStats = initialStats;
    }

    let updates = { ...updateData };

    if (updateData.type === 'WORKOUT') {
      // Calculate XP gain
      const xpGained = (updateData.exercises || 0) * 10;
      let newXP = (currentStats.xp || 0) + xpGained;
      let newLevel = currentStats.level || 1;
      let newXPMax = currentStats.xpMax || 1000;
 
      // Level up check
      while (newXP >= newXPMax) {
        newXP -= newXPMax;
        newLevel++;
        newXPMax = Math.floor(newXPMax * 1.5);
      }

      // Handle muscle group updates
      const muscleTypes = ['abs', 'arms', 'chest', 'legs', 'back'];
      muscleTypes.forEach(muscle => {
        if (updateData[muscle] !== undefined) {
          // Add the new value to the existing value
          updates[muscle] = (currentStats[muscle] || 0) + updateData[muscle];
          console.log(`Updating ${muscle} from ${currentStats[muscle]} to ${updates[muscle]}`); // Add this for debugging
        } else {
          // Keep the existing value
          updates[muscle] = currentStats[muscle] || 0;
        }
      });

      // Add the data of the corresponding muscle group
      if (Array.isArray(updateData.exercises)) {
        updateData.exercises.forEach(exercise => {
          if (exercise.muscleGroup && muscleTypes.includes(exercise.muscleGroup)) {
            updates[exercise.muscleGroup] = (updates[exercise.muscleGroup] || 0) + exercise.count;
          }
        });
      }

      // Calculate streak
      const newStreak = calculateStreak(currentStats.lastWorkout, currentStats.streak || 0);

      const today = new Date().toISOString().split('T')[0];
      
      // Update workout dates - Only mark today
      const workoutDates = {
        ...currentStats.workoutDates,
        [today]: {
          marked: true,
          dotColor: "orange"
        }
      };

      updates = {
        ...updates,
        level: newLevel,
        xp: newXP,
        xpMax: newXPMax,
        totalCalories: (currentStats.totalCalories || 0) + (updateData.calories || 0),
        totalExercises: (currentStats.totalExercises || 0) + (updateData.exercises || 0),
        totalDuration: (currentStats.totalDuration || 0) + (updateData.duration || 0), // Add total duration tracking
        lastWorkout: new Date().toISOString(),
        streak: newStreak, 
        coins: currentStats.coins + ((updateData.exercises || 0) * 10),
        workoutDates,
      };
    }

    // Handle inventory updates
    if (updateData.inventory) {
      updates = {
        ...updates,
        inventory: {
          ...currentStats.inventory,
          ...updateData.inventory
        }
      };
    }

    // Handle direct coin updates
    if (updateData.coins !== undefined) {
      updates.coins = updateData.coins;
    }

    // Handle stamina updates
    if (updateData.stamina !== undefined) {
      updates.stamina = updateData.stamina;
    }

    console.log('Final updates to apply:', updates); // Add this for debugging
    await updateDoc(userStatsRef, updates);

    // Get and return the updated document
    const updatedDoc = await getDoc(userStatsRef);
    return updatedDoc.data();
  } catch (error) {
    console.error('Error in updateUserProgress:', error);
    throw error;
  }
};

export const getUserStats = async (userId) => {
  try {
    console.log('Getting stats for user:', userId);
    const userStatsRef = doc(db, 'userStats', userId);
    const userStatsDoc = await getDoc(userStatsRef);
    
    if (!userStatsDoc.exists()) {
      // Initialize new user stats
      const initialStats = {
        level: 1,
        xp: 0,
        xpMax: 1000,
        stamina: 100,
        staminaMax: 100,
        chest: 0,
        arms: 0,
        abs: 0,
        legs: 0,
        back: 0,
        totalCalories: 0,
        totalExercises: 0,
        totalDuration: 0, // Add total duration to initial stats
        lastWorkout: null,
        streak: 0,
        coins: 100,
        inventory: {
          energyDrink: 1,
          apple: 1,
          friedEgg: 1,
          chickenLeg: 1,
        },
        workoutDates: {},  // Add workoutDates to initial stats
      };
      await setDoc(userStatsRef, initialStats);
      return initialStats;
    }
    
    return userStatsDoc.data();
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
};

export const getUserAchievements = async (userId) => {
  try {
    const userAchievementsRef = doc(db, 'userAchievements', userId);
    const achievementsDoc = await getDoc(userAchievementsRef);
    
    if (!achievementsDoc.exists()) {
      const initialAchievements = {
        targets: {
          1: { level: 1, target: 5, timestamp: new Date().toISOString() },      // workouts
          2: { level: 1, target: 500, timestamp: new Date().toISOString() },    // calories
          3: { level: 1, target: 10, timestamp: new Date().toISOString() },     // duration
          4: { level: 1, target: 30, timestamp: new Date().toISOString() },     // exercises
          5: { level: 1, target: 3, timestamp: new Date().toISOString() }       // streak
        }
      };
      await setDoc(userAchievementsRef, initialAchievements);
      return initialAchievements;
    }
    
    return achievementsDoc.data();
  } catch (error) {
    console.error('Error getting user achievements:', error);
    throw error;
  }
};

export const updateAchievementProgress = async (userId, achievementId, progressData) => {
  try {
    const userAchievementsRef = doc(db, 'userAchievements', userId);
    await setDoc(userAchievementsRef, {
      targets: {
        [achievementId]: {
          level: progressData.level,
          target: progressData.target,
          timestamp: new Date().toISOString()
        }
      }
    }, { merge: true });
  } catch (error) {
    console.error('Error updating achievement progress:', error);
    throw error;
  }
};

export const updateAchievement = async (userId, achievementId, data) => {
  try {
    const achievementRef = doc(db, 'achievements', achievementId);
    await updateDoc(achievementRef, {
      ...data,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating achievement:', error);
    throw error;
  }
};

export const initializeUserAchievements = async (userId) => {
  try {
    const achievementsRef = doc(db, 'achievements', userId);
    const achievementsDoc = await getDoc(achievementsRef);
    
    if (!achievementsDoc.exists()) {
      const initialAchievements = {
        targets: {
          1: { level: 1, target: 5, timestamp: new Date().toISOString() },      // workouts
          2: { level: 1, target: 500, timestamp: new Date().toISOString() },    // calories
          3: { level: 1, target: 10, timestamp: new Date().toISOString() },     // duration
          4: { level: 1, target: 30, timestamp: new Date().toISOString() },     // exercises
          5: { level: 1, target: 3, timestamp: new Date().toISOString() }       // streak
        }
      };
      await setDoc(achievementsRef, initialAchievements);
      return initialAchievements;
    }
    return achievementsDoc.data();
  } catch (error) {
    console.error('Error initializing achievements:', error);
    throw error;
  }
};

export const getUserMilestones = async (userId) => {
  try {
    const milestonesRef = doc(db, 'userMilestones', userId);
    const milestonesDoc = await getDoc(milestonesRef);
    
    if (!milestonesDoc.exists()) {
      const initialMilestones = {
        milestones: {
          1: { claimed: false },
          2: { claimed: false },
          3: { claimed: false },
          4: { claimed: false },
          5: { claimed: false }
        }
      };
      await setDoc(milestonesRef, initialMilestones);
      return initialMilestones;
    }
    
    return milestonesDoc.data();
  } catch (error) {
    console.error('Error getting user milestones:', error);
    throw error;
  }
};

const formatItemName = (name) => {
  const nameMap = {
    'Energy Drink': 'energyDrink',
    'Chicken Leg': 'chickenLeg',
    'Fried Egg': 'friedEgg',
    'Apple': 'apple'
  };
  return nameMap[name] || name;
};

export const claimMilestone = async (userId, milestoneId, reward) => {
  try {
    const milestonesRef = doc(db, 'userMilestones', userId);
    const userStatsRef = doc(db, 'userStats', userId);
    
    // Mark milestone as claimed with a clear boolean value
    await setDoc(milestonesRef, {
      milestones: {
        [milestoneId]: { claimed: true }
      }
    }, { merge: true });

    // Update user stats with rewards
    const updates = {
      coins: increment(reward.coins)
    };

    // Add inventory updates
    reward.items.forEach(item => {
      const formattedName = formatItemName(item.name);
      updates[`inventory.${formattedName}`] = increment(item.quantity);
    });

    await updateDoc(userStatsRef, updates);
    return true;
  } catch (error) {
    console.error('Error claiming milestone:', error);
    throw error;
  }
};
