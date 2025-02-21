import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import BottomNavigation from "./BottomNavigation"; // Import the BottomNavigation component
import achievements from "../data/achievementsData"; // Import the achievements data
import milestones from "../data/milestonesData"; // Import the milestones data
import { auth } from '../firebase/config';
import { 
  getUserStats, 
  getUserAchievements, 
  updateAchievement, 
  updateAchievementProgress, // Add this import
  updateUserProgress, // Add this import
  getUserMilestones,  // Add this import
  claimMilestone     // Add this import
} from '../services/userProgressService';
import RewardModal from '../components/RewardModal';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get("window"); // Get the screen width

const AchievementsScreen = () => {
  const [activeTab, setActiveTab] = useState("achievements"); // State to manage the active tab
  const linePosition = useRef(new Animated.Value(0)).current; // Animated value for the green line position
  const [userStats, setUserStats] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentReward, setCurrentReward] = useState(null);
  const [userAchievements, setUserAchievements] = useState([]);
  const [achievementTargets, setAchievementTargets] = useState({});
  const [claimedMilestones, setClaimedMilestones] = useState({});

  const handleModalClose = () => {
    // First close modal
    setModalVisible(false);
    // Clear reward data
    setCurrentReward(null);
    // Refresh data after a short delay
    setTimeout(fetchData, 300);
  };

  const fetchData = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      try {
        console.log('Fetching user data...');
        const [stats, achievements, milestones] = await Promise.all([
          getUserStats(userId),
          getUserAchievements(userId),
          getUserMilestones(userId)
        ]);
        console.log('User stats:', stats);
        setUserStats(stats);
        setAchievementTargets(achievements?.targets || {});
        setClaimedMilestones(milestones?.milestones || {});
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      console.log('Screen focused, fetching data...');
      fetchData();
      return () => {
        // Cleanup if needed
      };
    }, [])
  );

  const getDescription = (type, target) => {
    switch (type) {
      case 'workouts':
        return `Complete ${target} workouts`;
      case 'calories':
        return `Burn ${target.toLocaleString()} calories`;
      case 'duration':
        return `Spend ${target} minutes working out`;
      case 'exercises':
        return `Complete ${target} exercises`;
      case 'streak':
        return `Maintain a ${target}-day workout streak`;
      default:
        return '';
    }
  };

  const calculateStreak = (workoutDates) => {
    if (!workoutDates) return 0;
    
    // Get all dates and sort them in descending order
    const dates = Object.keys(workoutDates).sort((a, b) => new Date(b) - new Date(a));
    if (dates.length === 0) return 0;

    let streak = 1;
    let currentDate = new Date(dates[0]);

    // Count consecutive days
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i]);
      const diffDays = (currentDate - prevDate) / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        streak++;
        currentDate = prevDate;
      } else {
        break;
      }
    }

    return streak;
  };

  const getProgress = (item) => {
    if (!userStats) return { current: 0, total: item.target };

    const achievementData = achievementTargets[item.id];
    const currentTarget = achievementData?.target || item.target;
    
    let current = 0;
    switch (item.type) {
      case 'workouts':
        // Sum of all muscle group exercises
        current = Math.floor(['abs', 'chest', 'legs', 'back', 'arms'].reduce((sum, muscle) => {
          return sum + (userStats[muscle] || 0);
        }, 0));
        break;
      case 'calories':
        current = Math.floor(userStats.totalCalories || 0);
        break;
      case 'exercises':
        current = Math.floor(userStats.totalExercises || 0);
        break;
      case 'duration':
        current = Math.floor(userStats.totalDuration || 0);
        break;
      case 'streak':
        current = Math.floor(calculateStreak(userStats.workoutDates));
        break;
      default:
        current = 0;
    }

    current = Math.min(current, currentTarget);

    return {
      current,
      total: currentTarget,
      description: getDescription(item.type, currentTarget),
      isCompleted: current >= currentTarget
    };
  };

  const handleClaim = async (item) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      const achievementData = achievementTargets[item.id];
      const currentLevel = achievementData?.level || 1;
      const currentTarget = achievementData?.target || item.target;
      const nextTarget = currentTarget * 2;

      // First update the database
      await updateAchievementProgress(userId, item.id, {
        level: currentLevel + 1,
        target: nextTarget
      });

      await updateUserProgress(userId, {
        coins: userStats.coins + (10 * currentLevel)
      });

      // Then update the local state
      await fetchData();

      // Finally show the modal
      setCurrentReward({
        title: `Collect Rewards!`,
        reward: { coins: 10 * currentLevel }
      });
      setModalVisible(true);

    } catch (error) {
      console.error('Error claiming achievement:', error);
    }
  };

  const handleClaimMilestone = async (item) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      await claimMilestone(userId, item.id, item.reward);
      setCurrentReward({
        title: `${item.name} Unlocked!`,
        reward: item.reward
      });
      setModalVisible(true);
    } catch (error) {
      console.error('Error claiming milestone:', error);
    }
  };

  const renderItem = (item) => {
    const progress = getProgress(item);
    const percentage = (progress.current / progress.total) * 100;
    const isClaimable = progress.current >= progress.total;

    return (
      <View key={item.id} style={styles.itemContainer}>
        <View style={styles.imageContainer}>
          <Image source={item.image} style={styles.image} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemDescription}>{progress.description}</Text>
        </View>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {progress.current}/{progress.total}
          </Text>
          {isClaimable ? (
            <TouchableOpacity
              style={styles.claimButton}
              onPress={() => handleClaim(item)}
            >
              <Text style={styles.claimButtonText}>CLAIM</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${percentage}%` }]} />
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderMilestoneItem = (item) => {
    const isLevelMet = userStats?.level >= item.target;
    const isClaimed = claimedMilestones[item.id]?.claimed === true; // Check exact boolean value
    const isClaimable = isLevelMet && !isClaimed;

    return (
      <View key={item.id} style={styles.itemContainer}>
        <View style={styles.imageContainer}>
          <Image source={item.image} style={styles.image} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemDescription}>{`Reach Level ${item.target}`}</Text>
        </View>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {userStats?.level || 0}/{item.target}
          </Text>
          {isClaimed ? (
            <Text style={[styles.claimedText, { opacity: 0.7 }]}>CLAIMED</Text>
          ) : isClaimable ? (
            <TouchableOpacity
              style={styles.claimButton}
              onPress={() => handleClaimMilestone(item)}
            >
              <Text style={styles.claimButtonText}>CLAIM</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min((userStats?.level || 0) / item.target * 100, 100)}%` }
                ]} 
              />
            </View>
          )}
        </View>
      </View>
    );
  };

  // Function to handle tab press and animate the green line
  const handleTabPress = (tab, index) => {
    setActiveTab(tab);
    Animated.timing(linePosition, {
      toValue: index * (width / 2), // Move the line to the position of the active tab
      duration: 300, // Animation duration
      useNativeDriver: true, // Use native driver for better performance
    }).start();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Track your <Text style={styles.spanText}>Progress</Text>
      </Text>

      {/* Top Navigation Bar */}
      <View style={styles.topNavigation}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "achievements"
              ? styles.activeTab
              : styles.inactiveTab,
          ]}
          onPress={() => handleTabPress("achievements", 0)}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "achievements" && styles.activeTabText,
            ]}
          >
            Achievements
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "milestones" ? styles.activeTab : styles.inactiveTab,
          ]}
          onPress={() => handleTabPress("milestones", 1)}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "milestones" && styles.activeTabText,
            ]}
          >
            Milestones
          </Text>
        </TouchableOpacity>

        {/* Green Line */}
        <Animated.View
          style={[
            styles.greenLine,
            {
              transform: [{ translateX: linePosition }], // Animate the line's position
            },
          ]}
        />
      </View>

      {/* Scrollable list of achievements or milestones */}
      <ScrollView style={styles.achievementsList}>
        {activeTab === "achievements"
          ? achievements.map(renderItem)
          : milestones.map(renderMilestoneItem)}
      </ScrollView>

      {/* Render the BottomNavigation at the bottom of the screen */}
      <BottomNavigation />
      <RewardModal
        visible={modalVisible}
        onClose={handleModalClose}
        {...currentReward}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start", // Align content at the top, leaving space for the bottom navigation
    alignItems: "center",
    paddingBottom: 140, // Make space at the bottom for the BottomNavigation component
    backgroundColor: "#fff",
  },
  header: {
    width: 200,
    fontSize: 32,
    fontWeight: "bold",
    margin: 20,
  },
  spanText: {
    color: "#15B392", // Color for "Exercise"
  },
  topNavigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
    position: "relative", // Needed for the green line positioning
  },
  tab: {
    padding: 10,
    width: "50%", // Each tab takes half the width
    alignItems: "center",
  },
  inactiveTab: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.07)",
    borderColor: "rgba(0, 0, 0, 0.05)",
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderTopWidth: 2,
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "column",
    elevation: 2,
  },
  activeTab: {
    // No shadow for active tab
  },
  tabText: {
    fontSize: 16,
    color: "#666",
  },
  activeTabText: {
    color: "#15B392", // Highlight the active tab text
    fontWeight: "bold",
  },
  greenLine: {
    position: "absolute",
    left: 0,
    bottom: 0,
    height: 2,
    width: "50%", // Matches the width of a single tab
    backgroundColor: "#15B392",
  },
  achievementsList: {
    width: "100%",
    paddingHorizontal: 20,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff", // White background
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000", // Box shadow
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2, // For Android
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#73EC8B", // Background color for the image container
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 30,
    height: 30,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10, // Add some spacing between image and text
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  itemDescription: {
    fontSize: 13,
    color: "#666",
  },
  progressContainer: {
    alignItems: "flex-end",
  },
  progressText: {
    fontSize: 14,
    color: "#15B392",
    fontWeight: "bold",
    marginBottom: 5,
  },
  progressBar: {
    width: 80,
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#15B392",
    borderRadius: 3,
  },
  claimButton: {
    backgroundColor: '#15B392',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    minWidth: 80,
    alignItems: 'center',
  },
  claimButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  claimedText: {
    color: '#15B392',
    fontWeight: 'bold',
    fontSize: 12,
  },
  levelText: {
    color: '#666',
    fontSize: 12,
  },
  progressFillClaimed: {
    backgroundColor: '#888', // Grayed out color for claimed milestones
  }
});

export default AchievementsScreen;
