// ../data/milestonesData.js
const milestones = [
  {
    id: 1,
    name: "Rookie Milestone",
    description: "Reach level 10",
    type: "level",
    target: 10,
    reward: {
      coins: 100,
      items: [
        { name: "Apple", quantity: 3 }
      ]
    },
    image: require("../assets/badges/m1.png")
  },
  {
    id: 2,
    name: "Bronze Milestone",
    description: "Reach level 25",
    type: "level",
    target: 25,
    reward: {
      coins: 250,
      items: [
        { name: "Chicken Leg", quantity: 2 },
        { name: "Apple", quantity: 5 }
      ]
    },
    image: require("../assets/badges/m2.png")
  },
  {
    id: 3,
    name: "Silver Milestone",
    description: "Reach level 50",
    type: "level",
    target: 50,
    reward: {
      coins: 500,
      items: [
        { name: "Energy Drink", quantity: 3 },
        { name: "Chicken Leg", quantity: 5 }
      ]
    },
    image: require("../assets/badges/m3.png")
  },
  {
    id: 4,
    name: "Gold Milestone",
    description: "Reach level 75",
    type: "level",
    target: 75,
    reward: {
      coins: 750,
      items: [
        { name: "Energy Drink", quantity: 5 },
        { name: "Fried Egg", quantity: 15 }
      ]
    },
    image: require("../assets/badges/m4.png")
  },
  {
    id: 5,
    name: "Diamond Milestone",
    description: "Reach level 100",
    type: "level",
    target: 100,
    reward: {
      coins: 1000,
      items: [
        { name: "Energy Drink", quantity: 10 },
        { name: "Chicken Leg", quantity: 12 }
      ]
    },
    image: require("../assets/badges/m5.png")
  }
];

export default milestones;
