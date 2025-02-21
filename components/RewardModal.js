import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import foodIcons from '../data/foodIcons';

const RewardModal = ({ visible, onClose, title, reward }) => {
  if (!visible || !reward) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalContainer} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <Text style={styles.title}>{title}</Text>
          <Image 
            source={require('../assets/celebration.gif')} 
            style={styles.celebrationIcon}
          />
          {/* Show coins reward */}
          {reward?.coins > 0 && (
            <View style={styles.rewardItem}>
              <Image 
                source={require('../assets/rewards/coin.png')} 
                style={styles.rewardIcon} 
              />
              <Text style={styles.rewardText}>+{reward.coins} coins</Text>
            </View>
          )}

          {/* Show item rewards */}
          {reward?.items?.map((item, index) => (
            <View key={index} style={styles.rewardItem}>
              <Image 
                source={foodIcons[item.name]} 
                style={styles.rewardIcon} 
              />
              <Text style={styles.rewardText}>+{item.quantity} {item.name}</Text>
            </View>
          ))}

          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.closeButtonText}>COLLECT!</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    width: '80%',
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#15B392',
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  rewardIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
    resizeMode: 'contain'
  },
  rewardText: {
    fontSize: 18,
    color: '#666',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#15B392',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  celebrationIcon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
});

export default RewardModal;
