// ../data/achievementsData.js
const achievements = [
  {
    id: 1,
    name: "Workout Beginner",
    description: "Complete workouts",
    type: "workouts",
    target: 5,
    image: require("../assets/badges/a1.png")
  },
  {
    id: 2,
    name: "Calorie Burner",
    description: "Burn calories",
    type: "calories",
    target: 500,
    image: require("../assets/badges/a2.png")
  },
  {
    id: 3,
    name: "Time Invested",
    description: "Time spent working out",
    type: "duration",
    target: 10,
    image: require("../assets/badges/a3.png")
  },
  {
    id: 4,
    name: "Exercise Master",
    description: "Complete exercises",
    type: "exercises",
    target: 30,
    image: require("../assets/badges/a4.png")
  },
  {
    id: 5,
    name: "Consistency King",
    description: "Maintain daily streak",
    type: "streak",
    target: 3,
    image: require("../assets/badges/a5.png")
  }
];

export default achievements;
